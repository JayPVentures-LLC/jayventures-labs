import type { Env } from "./env";

export function getDiscordGuildConfig(env: Env) {
  return {
    jaypventures: {
      guildId: env.DISCORD_GUILD_ID_CREATOR,
      roles: {
        free: env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
        member: env.DISCORD_ROLE_CREATOR_VIP_ID,
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
        enterprise: env.DISCORD_ROLE_LABS_MEMBER_ID,
      },
    },
  };
}
