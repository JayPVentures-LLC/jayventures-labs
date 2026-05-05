import type { Brand, Tier } from "../types/entitlement.types";

interface GuildConfig {
  guildId: string | undefined;
  roles: Partial<Record<Tier, string | undefined>>;
}

export const DISCORD_GUILD_CONFIG: Record<Brand, GuildConfig> = {
  jaypventures: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      member: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      premium: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
  },
  jaypventuresllc: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      premium: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      enterprise: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
  },
};
