import type { Brand } from "../types/entitlement.types";

interface GuildConfig {
  readonly guildId: string | undefined;
  readonly roles: Record<string, string | undefined>;
}

// Brand "jaypventures" maps to the Labs Discord guild (DISCORD_GUILD_ID_LABS / DISCORD_ROLE_LABS_*).
// Brand "jaypventuresllc" maps to the Creator Discord guild (DISCORD_GUILD_ID_CREATOR / DISCORD_ROLE_CREATOR_*).
// The env-var suffixes (LABS / CREATOR) reflect the guild's purpose, not the brand name.
export const DISCORD_GUILD_CONFIG: Record<Brand, GuildConfig> = {
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
};
