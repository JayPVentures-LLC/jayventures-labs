import type { Brand, Tier } from "../types/entitlement.types";

// jaypventures    → Creator ecosystem (DISCORD_GUILD_ID_CREATOR); role keys: community/vip/member
// jaypventuresllc → Labs/Institutional/Business ecosystem (DISCORD_GUILD_ID_LABS); role keys: partner/admin/labs/institute/business
//
// tierRoleMap: maps each Tier to the role key it confers in this guild.
// Only tier-mapped roles are managed (added/removed) by Discord sync.
// admin and institute are manually assigned and intentionally excluded from the tier map.
export const DISCORD_GUILD_CONFIG = {
  jaypventures: {
    guildPurpose: "creator" as const,
    guildId: process.env.DISCORD_GUILD_ID_CREATOR,
    roles: {
      community: process.env.DISCORD_ROLE_CREATOR_COMMUNITY_ID,
      vip: process.env.DISCORD_ROLE_CREATOR_VIP_ID,
      member: process.env.DISCORD_ROLE_CREATOR_MEMBER_ID,
    },
    tierRoleMap: {
      free: "community",
      member: "member",
      premium: "vip",
      enterprise: "vip",
    } as const,
  },
  jaypventuresllc: {
    guildPurpose: "labs_institutional_business" as const,
    guildId: process.env.DISCORD_GUILD_ID_LABS,
    roles: {
      partner: process.env.DISCORD_ROLE_LABS_PARTNER_ID,
      admin: process.env.DISCORD_ROLE_LABS_ADMIN_ID,
      labs: process.env.DISCORD_ROLE_LABS_LABS_ID,
      institute: process.env.DISCORD_ROLE_LABS_INSTITUTE_ID,
      business: process.env.DISCORD_ROLE_LABS_BUSINESS_ID,
    },
    tierRoleMap: {
      free: null,
      member: "labs",
      premium: "business",
      enterprise: "partner",
    } as const,
  },
} as const;
