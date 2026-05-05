// Centralized access routing for Discord and Microsoft Teams/Entra
// See: https://copilot-instructions.md for policy

export const ACCESS_TARGETS = {
  creator: {
    platform: "discord",
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      community: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      vip: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
    },
  },

  labs: {
    platform: "discord",
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      member: process.env.DISCORD_ROLE_LABS_MEMBER_ID,
      researcher: process.env.DISCORD_ROLE_LABS_RESEARCHER_ID,
      student: process.env.DISCORD_ROLE_LABS_STUDENT_ID,
    },
  },

  llc: {
    platform: "microsoft_teams",
    tenantId: process.env.MS_TENANT_ID,
    teamId: process.env.MS_TEAM_ID_LLC,
    groups: {
      clients: process.env.MS_GROUP_ID_LLC_CLIENTS,
      partners: process.env.MS_GROUP_ID_LLC_PARTNERS,
      enterprise: process.env.MS_GROUP_ID_LLC_ENTERPRISE,
    },
  },
} as const;

export const PRODUCT_ACCESS_MAP = {
  creator_community: {
    surface: "creator",
    access: "community",
  },

  creator_vip: {
    surface: "creator",
    access: "vip",
  },

  labs_member: {
    surface: "labs",
    access: "member",
  },

  labs_researcher: {
    surface: "labs",
    access: "researcher",
  },

  labs_student: {
    surface: "labs",
    access: "student",
  },

  llc_client: {
    surface: "llc",
    access: "clients",
  },

  llc_partner: {
    surface: "llc",
    access: "partners",
  },

  llc_enterprise: {
    surface: "llc",
    access: "enterprise",
  },
} as const;
