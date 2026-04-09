// Discord Types: API requests/responses
export interface DiscordRoleUpdate {
  discordId: string;
  addRoles: string[];
  removeRoles: string[];
}
  guildId: string;
}

export interface DiscordSyncPayload {
  discordId: string;
  entitlements: Array<{
    brand: string;
    tier: string;
    guildId: string;
    roleIds: string[];
  }>;
}
