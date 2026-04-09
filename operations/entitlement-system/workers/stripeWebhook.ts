import { getEnv } from "../config/env";
import { handleAdminOverride } from "../admin/override";
import { handleDiscordSync } from "../routes/discord-sync.route";
import { handleStripeWebhook } from "../routes/webhook.route";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
};
