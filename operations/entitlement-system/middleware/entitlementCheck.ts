import type { Env } from "../config/env";
import type { Brand, Tier } from "../types/entitlement.types";
import { getEntitlementByLookup, hasRequiredTier, normalizeExpiredEntitlement } from "../services/entitlement.service";

function isAdmin(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  const override = request.headers.get("x-admin-key");
  return auth === `Bearer ${env.ADMIN_OVERRIDE_KEY}` || override === env.ADMIN_OVERRIDE_KEY;
}

function lookupFromRequest(request: Request): { userId?: string; discordId?: string } {
  const userId = request.headers.get("x-user-id") ?? undefined;
  const discordId = request.headers.get("x-discord-id") ?? undefined;
  return { userId, discordId };
}

export function entitlementCheck(requiredBrand: Brand, requiredTier: Tier) {
  return async (request: Request, env: Env): Promise<Response | void> => {
    if (isAdmin(request, env)) {
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
