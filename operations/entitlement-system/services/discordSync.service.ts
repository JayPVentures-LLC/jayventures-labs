// Discord Sync Service: Multi-guild, brand-aware role sync
import { Entitlement, Brand, Tier } from '../types/entitlement.types';
import { getGuildIdForBrand, getRoleIdsForBrandTier } from './discordRoleMapping.service';
import { logger } from '../utils/logger';

export interface DiscordSyncResult {
  success: boolean;
  brand: Brand;
  guildId: string;
  addedRoles: string[];
  removedRoles: string[];
  skipped: boolean;
  error?: string;
}

export async function syncDiscordRoles(entitlement: Entitlement): Promise<DiscordSyncResult> {
  const { brand, tier, discord } = entitlement;
  if (!discord?.discordId) {
    logger.log('warn', 'No Discord ID for entitlement', { brand, tier });
    return { success: false, brand, guildId: '', addedRoles: [], removedRoles: [], skipped: true };
  }
  const guildId = getGuildIdForBrand(brand);
  const targetRoles = getRoleIdsForBrandTier(brand, tier);
  // TODO: Fetch current roles from Discord API, compute add/remove
  // TODO: Call Discord API to update roles
  // For now, stubbed:
  logger.log('info', 'Syncing Discord roles', { discordId: discord.discordId, guildId, add: targetRoles });
  return {
    success: true,
    brand,
    guildId,
    addedRoles: targetRoles,
    removedRoles: [],
    skipped: false
  };
}
