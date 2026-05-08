import type { Env } from "../config/env";
import { getAdminOverrideKey } from "../services/runtimeSecrets.service";
import { getEntitlementByLookup } from "../services/entitlement.service";
import { processQueuedDiscordSync, syncDiscordRoles } from "../services/discordSync.service";

async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get("Authorization");
  const override = request.headers.get("x-admin-key");
  const key = await getAdminOverrideKey(env);
  return auth === `Bearer ${key}` || override === key;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDiscordSync(request: Request, env: Env): Promise<Response> {
  if (!(await isAdmin(request, env))) {
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
    const result = await processQueuedDiscordSync(env, { force: true });
    return json({ status: "retry_queue_processed", ...result }, 200);
  }

  const userId = typeof payload.userId === "string" ? payload.userId : undefined;
  const discordId = typeof payload.discordId === "string" ? payload.discordId : undefined;
  const brand = typeof payload.brand === "string" ? payload.brand : undefined;
  const dryRun = payload.dryRun === true;

  const entitlement = await getEntitlementByLookup({ userId, discordId }, env);
  if (!entitlement) {
    return json({ error: "Entitlement not found" }, 404);
  }

  const syncResults = await syncDiscordRoles(entitlement, env, {
    brand: brand === "jaypventures" || brand === "jaypventuresllc" ? brand : undefined,
    dryRun,
  });

  return json({ status: dryRun ? "discord_sync_dry_run" : "discord_sync_completed", syncResults }, 200);
}
