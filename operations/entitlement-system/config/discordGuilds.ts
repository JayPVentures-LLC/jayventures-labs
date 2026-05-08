import type { Brand, Tier } from "../types/entitlement.types";

// jaypventures  → Labs guild (DISCORD_GUILD_ID_LABS); role keys: member/researcher/student
// jaypventuresllc → Creator guild (DISCORD_GUILD_ID_CREATOR); role keys: community/vip
export const DISCORD_GUILD_CONFIG = {
  jaypventures: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      researcher: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      student: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
  },
  jaypventuresllc: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      community: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      vip: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
  },
} as const;
