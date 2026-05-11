import { getEnv } from "../config/env";
import { handleAdminOverride } from "../admin/override";
import { handleDiscordSync } from "../routes/discord-sync.route";
import { handleStripeWebhook } from "../routes/webhook.route";
import { archiveEvent, sendTelemetry, type WorkerEventMessage } from "../services/azure/observability.service";
import { getEntitlement } from "../services/entitlement.service";
import { syncDiscordRoles } from "../services/discordSync.service";
import { syncDiscordRole, DiscordReflectionError } from "../services/discordEntitlementReflection.service";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function processQueueMessage(message: WorkerEventMessage, env: ReturnType<typeof getEnv>): Promise<void> {
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
      if (message.body.type === "STRIPE_ENTITLEMENT_SYNCED") {
        try {
          const { subject_id, discord_user_id, tier, action } = message.body.payload;
          await syncDiscordRole(env, { subject_id, discord_user_id, tier, action });
          message.ack();
        } catch (error) {
          if (error instanceof DiscordReflectionError) {
            ctx.waitUntil(sendTelemetry(env, "discord_reflection_fail_closed", {
              code: error.code,
              error: error.message,
              subject_id: message.body.payload.subject_id,
              tier: message.body.payload.tier,
              action: message.body.payload.action,
            }));
            message.ack();
          } else {
            ctx.waitUntil(sendTelemetry(env, "discord_reflection_transient_error", {
              error: error instanceof Error ? error.message : String(error),
              subject_id: message.body.payload.subject_id,
            }));
            message.retry();
          }
        }
        continue;
      }

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
