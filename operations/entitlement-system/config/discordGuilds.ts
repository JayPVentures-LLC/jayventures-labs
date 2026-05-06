import type { Brand, Tier } from "../types/entitlement.types";

type GuildConfig = {
  guildId: string | undefined;
  roles: Partial<Record<Tier, string | undefined>>;
};

// Maps Brand values to their Discord guild and role ID environment variables.
// Env var names reflect the legacy Discord role names (community/vip, member/researcher/student);
// they are mapped here to the canonical Tier values used by the entitlement system.
export const DISCORD_GUILD_CONFIG: Record<Brand, GuildConfig> = {
  // jaypventuresllc → "creator" Discord guild
  jaypventuresllc: {
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      member: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,   // community role = member tier
      premium: process.env.DISCORD_ROLE_CREATOR_VIP_ID,        // vip role = premium tier
    },
  },
  // jaypventures → "labs" Discord guild
  jaypventures: {
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      premium: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,    // researcher role = premium tier
      enterprise: process.env.DISCORD_ROLE_LABS_STUDENT_ID,   // student role = enterprise tier
    },
  },
};
