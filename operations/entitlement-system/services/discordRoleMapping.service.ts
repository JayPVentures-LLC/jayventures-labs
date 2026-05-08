
import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "../config/discordGuilds";

type KnownBrand = keyof typeof DISCORD_GUILD_CONFIG;

export function getGuildIdForBrand(brand: Brand): string | undefined {
  if (brand in DISCORD_GUILD_CONFIG) {
    return DISCORD_GUILD_CONFIG[brand as KnownBrand].guildId;
  }
  return undefined;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier): string[] {
  if (!(brand in DISCORD_GUILD_CONFIG)) return [];
  const config = DISCORD_GUILD_CONFIG[brand as KnownBrand];
  const roleKey = (config.tierRoleMap as Record<Tier, string | null>)[tier];
  if (!roleKey) return [];
  const roleId = (config.roles as Record<string, string | undefined>)[roleKey];
  return roleId ? [roleId] : [];
}

export function getAllTierRolesForBrand(brand: Brand): string[] {
  if (!(brand in DISCORD_GUILD_CONFIG)) return [];
  const config = DISCORD_GUILD_CONFIG[brand as KnownBrand];
  // Only return roles that are tier-managed (listed in tierRoleMap) to avoid
  // inadvertently removing manually-assigned roles (e.g. admin, institute).
  const tierManagedKeys = new Set(
    Object.values(config.tierRoleMap as Record<Tier, string | null>).filter(Boolean) as string[]
  );
  return Object.entries(config.roles as Record<string, string | undefined>)
    .filter(([key]) => tierManagedKeys.has(key))
    .map(([, id]) => id)
    .filter(Boolean) as string[];
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
