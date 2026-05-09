import type { Brand, Tier } from "../types/entitlement.types";

/**
 * Discord guild configuration using Brand type values as keys.
 * Brand mapping:
 * - "jaypventures" → labs guild (DISCORD_GUILD_ID_LABS) with member/researcher/student roles
 * - "jaypventuresllc" → creator guild (DISCORD_GUILD_ID_CREATOR) with community/vip roles
 *
 * tierRoleMap maps Tier enum values to role keys for deterministic role assignment.
 */
export const DISCORD_GUILD_CONFIG: Record<Brand, {
  guildId: string | undefined;
  guildPurpose: string;
  roles: Record<string, string | undefined>;
  tierRoleMap: Partial<Record<Tier, string>>;
}> = {
  jaypventures: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    guildPurpose: "labs_institutional_business",
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      researcher: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      student: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
    tierRoleMap: {
      free: "member",
      member: "member",
      premium: "researcher",
      enterprise: "researcher",
    },
  },
  jaypventuresllc: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    guildPurpose: "creator",
    roles: {
      community: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      vip: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
    tierRoleMap: {
      free: "community",
      member: "community",
      premium: "vip",
      enterprise: "vip",
    },
  },
};
