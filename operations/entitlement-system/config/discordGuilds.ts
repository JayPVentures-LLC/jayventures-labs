import type { Brand, Tier } from "../types/entitlement.types";

export type BrandGuildConfig = {
  [B in Brand]: {
    guildId: string | undefined;
    roles: Partial<Record<Tier, string | undefined>>;
  };
};

export const DISCORD_GUILD_CONFIG: BrandGuildConfig = {
  jaypventures: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      free: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      member: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      premium: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
      enterprise: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
  },
  jaypventuresllc: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      free: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      premium: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      enterprise: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
  },
};
