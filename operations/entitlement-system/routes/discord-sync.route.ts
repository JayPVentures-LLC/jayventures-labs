import type { Env } from "../config/env";
import { getEntitlementByLookup } from "../services/entitlement.service";
import { processQueuedDiscordSync, syncDiscordRoles } from "../services/discordSync.service";

function isAdmin(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  const override = request.headers.get("x-admin-key");
  return auth === `Bearer ${env.ADMIN_OVERRIDE_KEY}` || override === env.ADMIN_OVERRIDE_KEY;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDiscordSync(request: Request, env: Env): Promise<Response> {
  if (!isAdmin(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  if (payload.processRetryQueue === true) {
    const result = await processQueuedDiscordSync(env);
    return json({ status: "retry_queue_processed", ...result }, 200);
  }

  const userId = typeof payload.userId === "string" ? payload.userId : undefined;
  const discordId = typeof payload.discordId === "string" ? payload.discordId : undefined;
  const brand = typeof payload.brand === "string" ? payload.brand : undefined;

  const entitlement = await getEntitlementByLookup({ userId, discordId }, env);
  if (!entitlement) {
    return json({ error: "Entitlement not found" }, 404);
  }

  const syncResults = await syncDiscordRoles(entitlement, env, {
    brand: brand === "jaypventures" || brand === "jaypventuresllc" ? brand : undefined,
  });

  return json({ status: "discord_sync_completed", syncResults }, 200);
}
