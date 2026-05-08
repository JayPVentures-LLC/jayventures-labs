import type { Env } from "./env";

export function getDiscordGuildConfig(env: Env) {
  return {
    jaypventures: {
      guildId: env.DISCORD_GUILD_ID_CREATOR,
      roles: {
        // free tier gets the community role; paid tiers (member/premium/enterprise) share the VIP role
        free: env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
        member: env.DISCORD_ROLE_CREATOR_VIP_ID,
        premium: env.DISCORD_ROLE_CREATOR_VIP_ID,
        enterprise: env.DISCORD_ROLE_CREATOR_VIP_ID,
      },
    },
    jaypventuresllc: {
      guildId: env.DISCORD_GUILD_ID_LABS,
      roles: {
        // labs tiers map to distinct roles; enterprise re-uses the member role as the top-level access role
        free: env.DISCORD_ROLE_LABS_STUDENT_ID,
        member: env.DISCORD_ROLE_LABS_MEMBER_ID,
        premium: env.DISCORD_ROLE_LABS_RESEARCHER_ID,
        enterprise: env.DISCORD_ROLE_LABS_MEMBER_ID,
      },
    },
  };
}
