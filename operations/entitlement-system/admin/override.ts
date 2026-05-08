import type { Env } from "../config/env";
import type { Brand, EntitlementStatus, Tier } from "../types/entitlement.types";
import { getRoleIdsForBrandTier } from "../services/discordRoleMapping.service";
import { syncDiscordRoles } from "../services/discordSync.service";
import { updateEntitlement } from "../services/entitlement.service";
import { logger } from "../utils/logger";
import { getAdminOverrideKey } from "../services/runtimeSecrets.service";

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

function normalizeBrand(value: unknown): Brand | null {
  return value === "jaypventures" || value === "jaypventuresllc" ? value : null;
}

function normalizeTier(value: unknown): Tier | null {
  return value === "free" || value === "member" || value === "premium" || value === "enterprise" ? value : null;
}

function normalizeStatus(value: unknown): EntitlementStatus | null {
  return value === "active" || value === "inactive" || value === "expired" || value === "revoked" ? value : null;
}

export async function handleAdminOverride(request: Request, env: Env): Promise<Response> {
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
    return json({ error: "Invalid JSON" }, 400);
  }

  const userId = typeof payload.userId === "string" ? payload.userId : null;
  const brand = normalizeBrand(payload.brand);
  const tier = normalizeTier(payload.tier);
  const status = normalizeStatus(payload.status);
  const discordId = typeof payload.discordId === "string" ? payload.discordId : undefined;
  const reason = typeof payload.reason === "string" ? payload.reason : "admin override";
  const expiresAt = typeof payload.expiresAt === "number" ? payload.expiresAt : Date.now() + (30 * 24 * 60 * 60 * 1000);
  const shouldSync = payload.syncDiscord !== false;

  if (!userId || !brand || !tier || !status) {
    return json({ error: "Missing required fields", required: ["userId", "brand", "tier", "status"] }, 400);
  }

  const entitlement = await updateEntitlement(
    {
      userId,
      brand,
      tier,
      status,
      expiresAt,
      source: "admin",
      discordId,
      roleIds: getRoleIdsForBrandTier(env, brand, tier),
      override: true,
      overrideReason: reason,
    },
    env
  );

  const syncResults = shouldSync ? await syncDiscordRoles(entitlement, env, { brand }) : [];
  logger.log("info", "Admin override applied", { userId, brand, tier, status, reason });

  return json({ status: "override_applied", entitlement, syncResults }, 200);
}
