
import type { Brand, Tier } from "../types/entitlement.types";
import { getDiscordGuildConfig } from "../config/discordGuilds";
import type { Env } from "../config/env";

export function getGuildIdForBrand(brand: Brand, env: Env): string | undefined {
  const config = getDiscordGuildConfig(env);
  return config[brand]?.guildId;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier, env: Env): string[] {
  const config = getDiscordGuildConfig(env);
  const roleId = config[brand]?.roles?.[tier];
  return roleId ? [roleId] : [];
}

export function getAllTierRolesForBrand(brand: Brand, env: Env): string[] {
  const config = getDiscordGuildConfig(env);
  const roles = config[brand]?.roles;
  if (!roles) return [];
  return Object.values(roles).filter((id): id is string => Boolean(id));
}

export function reconcileRoles(params: {
  brand: Brand;
  tier: Tier;
  status: "active" | "inactive" | "expired" | "revoked";
  currentRoles: string[];
  env: Env;
}): { add: string[]; remove: string[] } {
  const expected = params.status === "active" ? getRoleIdsForBrandTier(params.brand, params.tier, params.env) : [];
  const allBrandRoles = getAllTierRolesForBrand(params.brand, params.env);
  const remove = params.currentRoles.filter((roleId) => allBrandRoles.includes(roleId) && !expected.includes(roleId));
  const add = expected.filter((roleId) => !params.currentRoles.includes(roleId));
  return { add, remove };
}
