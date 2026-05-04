import type { Brand, Tier } from "../types/entitlement.types";

export const DISCORD_GUILD_CONFIG = {
  creator: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      community: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      vip: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
  },
  labs: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      researcher: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      student: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
  },
} as const;
