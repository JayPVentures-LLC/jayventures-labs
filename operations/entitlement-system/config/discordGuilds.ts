import type { Brand, Tier } from "../types/entitlement.types";
import type { Env } from "../config/env";

export type GuildConfig = {
  guildId: string | undefined;
  roles: Partial<Record<Tier, string | undefined>>;
};

export function getDiscordGuildConfig(
  env: Pick<
    Env,
    | "DISCORD_GUILD_ID_CREATOR"
    | "DISCORD_ROLE_CREATOR_COMMUNITY_ID"
    | "DISCORD_ROLE_CREATOR_VIP_ID"
    | "DISCORD_GUILD_ID_LABS"
    | "DISCORD_ROLE_LABS_MEMBER_ID"
    | "DISCORD_ROLE_LABS_RESEARCHER_ID"
    | "DISCORD_ROLE_LABS_STUDENT_ID"
  >
): Partial<Record<Brand, GuildConfig>> {
  return {
    jaypventures: {
      guildId: env.DISCORD_GUILD_ID_CREATOR,
      roles: {
        free: env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
        member: env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
        premium: env.DISCORD_ROLE_CREATOR_VIP_ID,
        enterprise: env.DISCORD_ROLE_CREATOR_VIP_ID,
      },
    },
    jaypventuresllc: {
      guildId: env.DISCORD_GUILD_ID_LABS,
      roles: {
        free: env.DISCORD_ROLE_LABS_STUDENT_ID,
        member: env.DISCORD_ROLE_LABS_MEMBER_ID,
        premium: env.DISCORD_ROLE_LABS_RESEARCHER_ID,
        enterprise: env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      },
    },
  };
}
