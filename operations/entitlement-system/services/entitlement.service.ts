// Entitlement Service: CRUD for entitlements in KV, schema enforcement
import { Entitlement, Brand, Tier, EntitlementStatus, BrandEntitlement, DiscordMeta } from '../types/entitlement.types';

// KV key helpers
function userKey(userId: string) {
  return `entitlement:user:${userId}`;
}
function discordKey(discordId: string) {
  return `entitlement:discord:${discordId}`;
}

// Get full entitlement record by userId
export async function getEntitlement(userId: string, env: any): Promise<Entitlement | null> {
  const raw = await env.KV_NAMESPACE.get(userKey(userId));
  if (!raw) return null;
  return JSON.parse(raw) as Entitlement;
}

// Get full entitlement record by Discord userId
export async function getEntitlementByDiscord(discordId: string, env: any): Promise<Entitlement | null> {
  const userId = await env.KV_NAMESPACE.get(discordKey(discordId));
  if (!userId) return null;
  return getEntitlement(userId, env);
}

// Add or update a brand entitlement for a user
export async function upsertBrandEntitlement({
  userId,
  brand,
  tier,
  status,
  expiresAt,
  source,
  discordId,
  roleIds,
  env
}: {
  userId: string;
  brand: Brand;
  tier: Tier;
  status: EntitlementStatus;
  expiresAt: number;
  source: 'stripe' | 'admin' | 'import';
  discordId: string;
  roleIds: string[];
  env: any;
}): Promise<Entitlement> {
  // Fetch or create
  let ent = await getEntitlement(userId, env);
  if (!ent) {
    ent = {
      userId,
      status,
      expiresAt,
      source,
      discord: { discordId, guilds: [] },
      entitlements: [],
    };
  }
  // Update or add brand entitlement
  let found = false;
  ent.entitlements = ent.entitlements.map(e => {
    if (e.brand === brand) {
      found = true;
      return { brand, tier, guildId: e.guildId, roleIds };
    }
    return e;
  });
  if (!found) {
    // Find correct guildId from mapping
    const guildId = require('../services/discordRoleMapping.service').getGuildIdForBrand(brand);
    ent.entitlements.push({ brand, tier, guildId, roleIds });
  }
  // Update status, expiry, etc.
  ent.status = status;
  ent.expiresAt = expiresAt;
  ent.source = source;
  if (ent.discord) {
    ent.discord.discordId = discordId;
  } else {
    ent.discord = { discordId, guilds: [] };
  }
  // Write to KV
  await env.KV_NAMESPACE.put(userKey(userId), JSON.stringify(ent));
  await env.KV_NAMESPACE.put(discordKey(discordId), userId);
  return ent;
}

// Remove a brand entitlement for a user
export async function removeBrandEntitlement({
  userId,
  brand,
  env
}: {
  userId: string;
  brand: Brand;
  env: any;
}): Promise<Entitlement | null> {
  let ent = await getEntitlement(userId, env);
  if (!ent) return null;
  ent.entitlements = ent.entitlements.filter(e => e.brand !== brand);
  await env.KV_NAMESPACE.put(userKey(userId), JSON.stringify(ent));
  return ent;
}

// Expire entitlements
export async function expireEntitlements(userId: string, env: any): Promise<Entitlement | null> {
  let ent = await getEntitlement(userId, env);
  if (!ent) return null;
  const now = Date.now();
  ent.entitlements = ent.entitlements.map(e => {
    if (ent.expiresAt < now) {
      return { ...e, status: 'expired' };
    }
    return e;
  });
  ent.status = ent.entitlements.every(e => e.status === 'expired') ? 'expired' : ent.status;
  await env.KV_NAMESPACE.put(userKey(userId), JSON.stringify(ent));
  return ent;
}
