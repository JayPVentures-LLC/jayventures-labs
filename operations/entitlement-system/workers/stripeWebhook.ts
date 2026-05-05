import { getEnv } from "../config/env";
import { handleAdminOverride } from "../admin/override";
import { handleDiscordSync } from "../routes/discord-sync.route";
import { handleStripeWebhook } from "../routes/webhook.route";
import { oauthRoute } from "../routes/oauth.route";
import { activateRoute } from "../routes/activate.route";
import { archiveEvent, sendTelemetry, type WorkerEventMessage } from "../services/azure/observability.service";
import { getEntitlement } from "../services/entitlement.service";
import { syncDiscordRoles } from "../services/discordSync.service";
import { syncDiscordRole, DiscordReflectionError } from "../services/discord.service";
import { logger } from "../utils/logger";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function logDiscordReflectionResult(
  env: ReturnType<typeof getEnv>,
  record: {
    subject_id: string;
    discord_user_id: string | undefined;
    tier: string;
    role_id: string | undefined;
    action: string;
    result: string;
    timestamp: string;
  }
): Promise<void> {
  if (!env.METRICS_KV) return;
  const key = `discord_reflection:${record.timestamp}:${record.subject_id}`;
  await env.METRICS_KV.put(key, JSON.stringify(record));
}

async function processQueueMessage(message: WorkerEventMessage, env: ReturnType<typeof getEnv>): Promise<void> {
  if (message.type === "STRIPE_ENTITLEMENT_SYNCED") {
    const { subject_id, discord_user_id, tier, action } = message.payload;
    const timestamp = new Date().toISOString();
    let role_id: string | undefined;

    try {
      const syncResult = await syncDiscordRole(env, { subject_id, discord_user_id, tier, action });
      role_id = syncResult.roleId;
      const result = syncResult.applied ? "success" : "no_op";
      await logDiscordReflectionResult(env, { subject_id, discord_user_id, tier, role_id, action, result, timestamp });
      return;
    } catch (error) {
      if (error instanceof DiscordReflectionError && !error.isTransient) {
        // Permanent failure — log and ack (no retry will help)
        const result = error.code;
        logger.log("warn", "Discord reflection permanent failure", { code: error.code, subject_id, tier, action });
        await logDiscordReflectionResult(env, { subject_id, discord_user_id, tier, role_id, action, result, timestamp });
        return;
      }
      // Transient failure — re-throw so the outer handler retries the message
      throw error;
    }
  }

  if (message.type === "archive") {
    await archiveEvent(env, message);
    await sendTelemetry(env, `${message.payload.source}_${message.payload.event}`, message.payload.data);
    return;
  }

  if (message.type === "discord-retry") {
    const entitlement = await getEntitlement(message.payload.userId, env);
    if (!entitlement) {
      throw new Error(`Entitlement not found for retry user ${message.payload.userId}`);
    }
    await syncDiscordRoles(entitlement, env, { brand: message.payload.brand });
  }
}

export default {
  async fetch(request: Request, rawEnv: Record<string, unknown>, ctx: ExecutionContext): Promise<Response> {
    void ctx;

    let env;
    try {
      env = getEnv(rawEnv);
      (globalThis as { LOG_LEVEL?: string }).LOG_LEVEL = env.LOG_LEVEL;
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 500);
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "entitlement-system" }, 200);
    }

    if (url.pathname === "/webhook/stripe") {
      return handleStripeWebhook(request, env);
    }

    if (url.pathname.startsWith("/oauth/")) {
      return oauthRoute.fetch(request, rawEnv as unknown as Parameters<typeof oauthRoute.fetch>[1], ctx);
    }

    if (url.pathname === "/activate") {
      return activateRoute.fetch(request, rawEnv as unknown as Parameters<typeof activateRoute.fetch>[1], ctx);
    }

    if (url.pathname === "/admin/override") {
      return handleAdminOverride(request, env);
    }

    if (url.pathname === "/admin/discord-sync") {
      return handleDiscordSync(request, env);
    }

    return json({ error: "Not Found" }, 404);
  },

  async queue(batch: MessageBatch<WorkerEventMessage>, rawEnv: Record<string, unknown>, ctx: ExecutionContext): Promise<void> {
    const env = getEnv(rawEnv);
    for (const message of batch.messages) {
      try {
        await processQueueMessage(message.body, env);
        message.ack();
      } catch (error) {
        ctx.waitUntil(sendTelemetry(env, "entitlement_queue_failure", {
          type: message.body.type,
          error: error instanceof Error ? error.message : String(error),
        }));
        message.retry();
      }
    }
  },
};
