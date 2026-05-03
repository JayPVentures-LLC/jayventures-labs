import type { Brand, Entitlement } from "./entitlement.types";

export interface DiscordRoleUpdate {
  discordId: string;
  guildId: string;
  addRoles: string[];
  removeRoles: string[];
}

export interface DiscordSyncPayload {
  discordId: string;
  entitlements: Entitlement["entitlements"];
}

export interface RetryTask {
  id: string;
  type: "discord-sync";
  attempts: number;
  runAfter: number;
  createdAt: string;
  payload: {
    userId: string;
    brand?: Brand;
    reason: string;
  };
}
