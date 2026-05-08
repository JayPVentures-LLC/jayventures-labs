import type { Env } from "../config/env";
import type { Brand, Tier } from "../types/entitlement.types";

type RoleMap = Partial<Record<Tier, string>>;

export type DiscordRoleEnv = Pick<
  Env,
  | "DISCORD_GUILD_ID_CREATOR"
  | "DISCORD_ROLE_CREATOR_COMMUNITY_ID"
  | "DISCORD_ROLE_CREATOR_VIP_ID"
  | "DISCORD_GUILD_ID_LABS"
  | "DISCORD_ROLE_LABS_MEMBER_ID"
  | "DISCORD_ROLE_LABS_RESEARCHER_ID"
  | "DISCORD_ROLE_LABS_STUDENT_ID"
>;

interface BrandDiscordConfig {
  guildId: string;
  roles: RoleMap;
}

function getConfigForBrand(brand: Brand, env: DiscordRoleEnv): BrandDiscordConfig {
  if (brand === "jaypventures") {
    const guildId = env.DISCORD_GUILD_ID_CREATOR;
    if (!guildId) {
      throw new Error("Missing required Worker binding: DISCORD_GUILD_ID_CREATOR (brand: jaypventures)");
    }
    return {
      guildId,
      roles: {
        free: env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
        member: env.DISCORD_ROLE_CREATOR_VIP_ID,
        premium: env.DISCORD_ROLE_CREATOR_VIP_ID,
        enterprise: env.DISCORD_ROLE_CREATOR_VIP_ID,
      },
    };
  } else if (brand === "jaypventuresllc") {
    const guildId = env.DISCORD_GUILD_ID_LABS;
    if (!guildId) {
      throw new Error("Missing required Worker binding: DISCORD_GUILD_ID_LABS (brand: jaypventuresllc)");
    }
    return {
      guildId,
      roles: {
        member: env.DISCORD_ROLE_LABS_MEMBER_ID,
        premium: env.DISCORD_ROLE_LABS_RESEARCHER_ID,
        enterprise: env.DISCORD_ROLE_LABS_STUDENT_ID,
      },
    };
  } else {
    const exhaustiveCheck: never = brand;
    throw new Error(`Unsupported brand: ${String(exhaustiveCheck)}`);
  }
}

export function getGuildIdForBrand(brand: Brand, env: DiscordRoleEnv): string {
  return getConfigForBrand(brand, env).guildId;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier, env: DiscordRoleEnv): string[] {
  const roleId = getConfigForBrand(brand, env).roles[tier];
  return roleId ? [roleId] : [];
}

export function getAllTierRolesForBrand(brand: Brand, env: DiscordRoleEnv): string[] {
  return Object.values(getConfigForBrand(brand, env).roles).filter((roleId): roleId is string => Boolean(roleId));
}

export function reconcileRoles(params: {
  brand: Brand;
  tier: Tier;
  status: "active" | "inactive" | "expired" | "revoked";
  currentRoles: string[];
  env: DiscordRoleEnv;
}): { add: string[]; remove: string[] } {
  const allBrandRoles = getAllTierRolesForBrand(params.brand, params.env);

  if (params.status === "active") {
    const expected = getRoleIdsForBrandTier(params.brand, params.tier, params.env);
    if (expected.length === 0) {
      throw new Error(`Missing required Worker binding for role: brand=${params.brand}, tier=${params.tier}`);
    }
    const remove = params.currentRoles.filter((roleId) => allBrandRoles.includes(roleId) && !expected.includes(roleId));
    const add = expected.filter((roleId) => !params.currentRoles.includes(roleId));
    return { add, remove };
  }

  const remove = params.currentRoles.filter((roleId) => allBrandRoles.includes(roleId));
  return { add: [], remove };
}
