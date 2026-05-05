
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
  if (brand in DISCORD_GUILD_CONFIG) {
    const config = DISCORD_GUILD_CONFIG[brand as KnownBrand];
    return config.roles?.[tier as keyof typeof config.roles] ? [config.roles[tier as keyof typeof config.roles]!] : [];
  }
  return [];
}

export function getAllTierRolesForBrand(brand: Brand): string[] {
  if (brand in DISCORD_GUILD_CONFIG) {
    return Object.values(DISCORD_GUILD_CONFIG[brand as KnownBrand].roles).filter(Boolean) as string[];
  }
  return [];
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
