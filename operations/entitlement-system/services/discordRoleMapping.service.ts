import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "../config/discordGuilds";

export function getGuildIdForBrand(brand: Brand): string | undefined {
  return DISCORD_GUILD_CONFIG[brand]?.guildId;
}

/**
 * Get role IDs for a brand and tier using the tierRoleMap for deterministic mapping.
 * Tier→role-key mapping uses tierRoleMap[tier]→roles[roleKey].
 */
export function getRoleIdsForBrandTier(brand: Brand, tier: Tier): string[] {
  const config = DISCORD_GUILD_CONFIG[brand];
  if (!config) return [];

  const roleKey = config.tierRoleMap[tier];
  if (!roleKey) return [];

  const roleId = config.roles[roleKey];
  return roleId ? [roleId] : [];
}

/**
 * Get all tier-managed roles for a brand.
 * Only returns roles that are part of tier management to prevent
 * accidental removal of admin/institute roles.
 */
export function getAllTierRolesForBrand(brand: Brand): string[] {
  const config = DISCORD_GUILD_CONFIG[brand];
  if (!config) return [];

  // Collect only roles that are referenced in tierRoleMap
  const tierRoleKeys = new Set(Object.values(config.tierRoleMap).filter(Boolean) as string[]);
  return Array.from(tierRoleKeys)
    .map((key) => config.roles[key])
    .filter((roleId): roleId is string => Boolean(roleId));
}

export function reconcileRoles(params: {
  brand: Brand;
  tier: Tier;
  status: "active" | "inactive" | "expired" | "revoked";
  currentRoles: string[];
}): { add: string[]; remove: string[] } {
  const expected = params.status === "active" ? getRoleIdsForBrandTier(params.brand, params.tier) : [];
  const allBrandRoles = getAllTierRolesForBrand(params.brand);
  const remove = params.currentRoles.filter((roleId) => allBrandRoles.includes(roleId) && !expected.includes(roleId));
  const add = expected.filter((roleId) => !params.currentRoles.includes(roleId));
  return { add, remove };
}
