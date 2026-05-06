
import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "../config/discordGuilds";

export function getGuildIdForBrand(brand: Brand): string | undefined {
  return DISCORD_GUILD_CONFIG[brand]?.guildId;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier): string[] {
  const roleId = DISCORD_GUILD_CONFIG[brand]?.roles?.[tier];
  return roleId ? [roleId] : [];
}

export function getAllTierRolesForBrand(brand: Brand): string[] {
  const roles = DISCORD_GUILD_CONFIG[brand]?.roles;
  if (!roles) return [];
  return Object.values(roles).filter((v): v is string => Boolean(v));
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
