import type {
  Brand,
  BrandEntitlement,
  BrandEntitlementInput,
  Entitlement,
  EntitlementLookup,
  EntitlementStatus,
  Tier,
} from "../types/entitlement.types";
import type { Env } from "../config/env";
import { getGuildIdForBrand } from "./discordRoleMapping.service";

const TIER_ORDER: Record<Tier, number> = {
  free: 0,
  member: 1,
  premium: 2,
  enterprise: 3,
};

function userKey(userId: string): string {
  return `entitlement:user:${userId}`;
}

function discordKey(discordId: string): string {
  return `entitlement:discord:${discordId}`;
}

function overallStatus(entitlements: BrandEntitlement[]): EntitlementStatus {
  if (entitlements.some((entry) => entry.status === "active" && entry.expiresAt > Date.now())) {
    return "active";
  }
  if (entitlements.some((entry) => entry.status === "revoked")) {
    return "revoked";
  }
  if (entitlements.length > 0 && entitlements.every((entry) => entry.status === "expired" || entry.expiresAt <= Date.now())) {
    return "expired";
  }
  return "inactive";
}

function overallExpiry(entitlements: BrandEntitlement[]): number {
  return entitlements.reduce((max, current) => Math.max(max, current.expiresAt), 0);
}

export function hasRequiredTier(actual: Tier, required: Tier): boolean {
  return TIER_ORDER[actual] >= TIER_ORDER[required];
}

export function normalizeExpiredEntitlement(entry: BrandEntitlement): BrandEntitlement {
  if (entry.status === "active" && entry.expiresAt <= Date.now()) {
    return { ...entry, status: "expired", updatedAt: new Date().toISOString() };
  }
  return entry;
}

export async function getEntitlement(userId: string, env: { ENTITLEMENT_KV: KVNamespace }): Promise<Entitlement | null> {
  const raw = await env.ENTITLEMENT_KV.get(userKey(userId));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Entitlement;
  parsed.entitlements = parsed.entitlements.map(normalizeExpiredEntitlement);
  parsed.status = overallStatus(parsed.entitlements);
  parsed.expiresAt = overallExpiry(parsed.entitlements);
  return parsed;
}

export async function getEntitlementByDiscord(discordId: string, env: { ENTITLEMENT_KV: KVNamespace }): Promise<Entitlement | null> {
  const userId = await env.ENTITLEMENT_KV.get(discordKey(discordId));
  if (!userId) return null;
  return getEntitlement(userId, env);
}

export async function getEntitlementByLookup(
  lookup: EntitlementLookup,
  env: { ENTITLEMENT_KV: KVNamespace }
): Promise<Entitlement | null> {
  if (lookup.userId) return getEntitlement(lookup.userId, env);
  if (lookup.discordId) return getEntitlementByDiscord(lookup.discordId, env);
  return null;
}

async function persistEntitlement(entitlement: Entitlement, env: { ENTITLEMENT_KV: KVNamespace }): Promise<void> {
  await env.ENTITLEMENT_KV.put(userKey(entitlement.userId), JSON.stringify(entitlement));
  if (entitlement.discord?.discordId) {
    await env.ENTITLEMENT_KV.put(discordKey(entitlement.discord.discordId), entitlement.userId);
  }
}

export async function upsertBrandEntitlement(
  input: BrandEntitlementInput,
  env: Env
): Promise<Entitlement> {
  const existing = (await getEntitlement(input.userId, env)) ?? {
    userId: input.userId,
    status: input.status,
    expiresAt: input.expiresAt,
    source: input.source,
    updatedAt: new Date().toISOString(),
    discord: input.discordId ? { discordId: input.discordId } : undefined,
    entitlements: [],
  };

  const updatedAt = new Date().toISOString();
  const nextEntry: BrandEntitlement = {
    brand: input.brand,
    tier: input.tier,
    status: input.status,
    guildId: getGuildIdForBrand(env, input.brand) ?? "unknown",
    roleIds: input.roleIds,
    expiresAt: input.expiresAt,
    source: input.source,
    lastEventId: input.lastEventId,
    updatedAt,
  };

  const filtered = existing.entitlements.filter((entry) => entry.brand !== input.brand);
  const entitlements = [...filtered, nextEntry].map(normalizeExpiredEntitlement);

  const entitlement: Entitlement = {
    ...existing,
    status: overallStatus(entitlements),
    expiresAt: overallExpiry(entitlements),
    source: input.source,
    updatedAt,
    override: input.override ?? existing.override,
    overrideReason: input.overrideReason ?? existing.overrideReason,
    discord: input.discordId
      ? {
          ...(existing.discord ?? {}),
          discordId: input.discordId,
        }
      : existing.discord,
    entitlements,
  };

  await persistEntitlement(entitlement, env);
  return entitlement;
}

export async function updateEntitlement(
  input: BrandEntitlementInput,
  env: Env
): Promise<Entitlement> {
  return upsertBrandEntitlement(input, env);
}

export async function setDiscordSyncTimestamp(
  userId: string,
  syncedAt: string,
  env: { ENTITLEMENT_KV: KVNamespace }
): Promise<Entitlement | null> {
  const entitlement = await getEntitlement(userId, env);
  if (!entitlement || !entitlement.discord) return entitlement;
  entitlement.discord.lastSyncedAt = syncedAt;
  entitlement.updatedAt = syncedAt;
  await persistEntitlement(entitlement, env);
  return entitlement;
}

export async function revokeBrandEntitlement(
  userId: string,
  brand: Brand,
  env: { ENTITLEMENT_KV: KVNamespace }
): Promise<Entitlement | null> {
  const entitlement = await getEntitlement(userId, env);
  if (!entitlement) return null;

  entitlement.entitlements = entitlement.entitlements.map((entry) => {
    if (entry.brand !== brand) return entry;
    return { ...entry, status: "revoked", updatedAt: new Date().toISOString() };
  });

  entitlement.status = overallStatus(entitlement.entitlements);
  entitlement.expiresAt = overallExpiry(entitlement.entitlements);
  entitlement.updatedAt = new Date().toISOString();
  await persistEntitlement(entitlement, env);
  return entitlement;
}

export async function expireEntitlements(userId: string, env: { ENTITLEMENT_KV: KVNamespace }): Promise<Entitlement | null> {
  const entitlement = await getEntitlement(userId, env);
  if (!entitlement) return null;
  entitlement.entitlements = entitlement.entitlements.map(normalizeExpiredEntitlement);
  entitlement.status = overallStatus(entitlement.entitlements);
  entitlement.expiresAt = overallExpiry(entitlement.entitlements);
  entitlement.updatedAt = new Date().toISOString();
  await persistEntitlement(entitlement, env);
  return entitlement;
}
