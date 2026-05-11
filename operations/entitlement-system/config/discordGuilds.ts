
export const DISCORD_GUILD_CONFIG: Record<Brand, {
  guildId: string;
  tierRoles: Record<Tier, string[]>;
}> = {
  jaypventuresllc: {
    guildId: "1491229650142105621",
    tierRoles: {
      free: ["llc_guest"],
      member: ["llc_lead"],
      premium: ["llc_client"],
      enterprise: ["llc_vip"],
    },
  },
  jaypventures: {
    guildId: "1467930335290462357",
    tierRoles: {
      free: ["community_free"],
      member: ["community_supporter"],
      premium: ["community_vip"],
      enterprise: ["community_innercircle"],
    },
  },
};
