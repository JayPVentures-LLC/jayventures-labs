import type { Env } from "../config/env";
import { getAdminOverrideKey } from "../services/runtimeSecrets.service";
import { getEntitlementByLookup, hasRequiredTier, normalizeExpiredEntitlement } from "../services/entitlement.service";
import type { Brand, Tier } from "../types/entitlement.types";

async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get("Authorization");
  const override = request.headers.get("x-admin-key");
  const key = await getAdminOverrideKey(env);
  return auth === `Bearer ${key}` || override === key;
}

function lookupFromRequest(request: Request): { userId?: string; discordId?: string } {
  const userId = request.headers.get("x-user-id") ?? undefined;
  const discordId = request.headers.get("x-discord-id") ?? undefined;
  return { userId, discordId };
}

export function entitlementCheck(requiredBrand: Brand, requiredTier: Tier) {
  return async (request: Request, env: Env): Promise<Response | void> => {
    if (await isAdmin(request, env)) {
      return;
    }

    const lookup = lookupFromRequest(request);
    if (!lookup.userId && !lookup.discordId) {
      return new Response(JSON.stringify({ error: "Unauthorized", detail: "Missing x-user-id or x-discord-id header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const entitlement = await getEntitlementByLookup(lookup, env);
    if (!entitlement) {
      return new Response(JSON.stringify({ error: "Forbidden", detail: "Entitlement not found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const entry = entitlement.entitlements
      .map(normalizeExpiredEntitlement)
      .find((candidate) => candidate.brand === requiredBrand);

    if (!entry || entry.status !== "active" || entry.expiresAt <= Date.now() || !hasRequiredTier(entry.tier, requiredTier)) {
      return new Response(JSON.stringify({ error: "Forbidden", detail: "Required entitlement missing" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
