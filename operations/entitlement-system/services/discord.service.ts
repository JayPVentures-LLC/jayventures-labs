// Discord Service: Role assignment/removal, retry logic, admin override
import { Entitlement, BrandEntitlement } from '../types/entitlement.types';
import { syncDiscordRoles } from './discordSync.service';

// Syncs all brand entitlements for a user across all guilds
export async function syncDiscord(entitlement: Entitlement) {
  if (!entitlement.discord?.discordId) return;
  for (const brandEnt of entitlement.entitlements) {
    await syncDiscordRoles({
      userId: entitlement.userId,
      status: entitlement.status,
      expiresAt: entitlement.expiresAt,
      source: entitlement.source,
      discord: entitlement.discord,
      entitlements: [brandEnt],
      override: entitlement.override
    });
  }
}

export async function syncDiscordRoles(entitlement: Entitlement): Promise<void> {
  // TODO: Assign/remove Discord roles based on entitlement
}
