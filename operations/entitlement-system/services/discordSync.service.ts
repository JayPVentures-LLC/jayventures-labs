// Discord Sync Service: Multi-guild, brand-aware role sync
import { Entitlement, Brand, Tier, BrandEntitlement } from '../types/entitlement.types';
import { logger } from '../utils/logger';
import { syncDiscordRoles as syncRoles } from './discord.service';

export interface DiscordSyncResult {
  brand: Brand;
  guildId: string;
  addedRoles: string[];
  removedRoles: string[];
  skipped: boolean;
  error?: string;
  success: boolean;
}

// Syncs all entitlements for a user, returns results per guild
export async function syncDiscordRoles(entitlement: Entitlement, env: any): Promise<DiscordSyncResult[]> {
  if (!entitlement.discord?.discordId) {
    logger.log('warn', 'No Discord ID for entitlement', { userId: entitlement.userId });
    return [{ brand: 'jaypventures', guildId: '', addedRoles: [], removedRoles: [], skipped: true, error: 'No Discord ID', success: false }];
  }
  const results: DiscordSyncResult[] = [];
  for (const brandEnt of entitlement.entitlements) {
    try {
      const res = await syncRoles(entitlement, brandEnt, env);
      results.push(res);
    } catch (e: any) {
      results.push({
        brand: brandEnt.brand,
        guildId: brandEnt.guildId,
        addedRoles: [],
        removedRoles: [],
        skipped: false,
        error: e.message,
        success: false
      });
    }
  }
  return results;
}
