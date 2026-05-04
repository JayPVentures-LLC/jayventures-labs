
import type { Brand, Tier } from "../types/entitlement.types";
import type { Env } from "../config/env";
import { getDiscordGuildConfig } from "../config/discordGuilds";

export function getGuildIdForBrand(env: Env, brand: Brand): string | undefined {
  const config = getDiscordGuildConfig(env);
  return config[brand].guildId;
}

export function getRoleIdsForBrandTier(env: Env, brand: Brand, tier: Tier): string[] {
  const config = getDiscordGuildConfig(env);
  const roleId = config[brand].roles[tier];
  return roleId ? [roleId] : [];
}

export function getAllTierRolesForBrand(env: Env, brand: Brand): string[] {
  const config = getDiscordGuildConfig(env);
  return Object.values(config[brand].roles).filter(Boolean) as string[];
}

export function reconcileRoles(env: Env, params: {
  brand: Brand;
  tier: Tier;
  status: "active" | "inactive" | "expired" | "revoked";
  currentRoles: string[];
}): { add: string[]; remove: string[] } {
  const expected = params.status === "active" ? getRoleIdsForBrandTier(env, params.brand, params.tier) : [];
  const allBrandRoles = getAllTierRolesForBrand(env, params.brand);
  const remove = params.currentRoles.filter((roleId) => allBrandRoles.includes(roleId) && !expected.includes(roleId));
  const add = expected.filter((roleId) => !params.currentRoles.includes(roleId));
  return { add, remove };
}
