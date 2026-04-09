// Discord Role Mapping Service: Resolves guild and roles for brand/tier
import { Brand, Tier } from '../types/entitlement.types';
import { DISCORD_GUILD_CONFIG } from '../config/discordGuilds';

export function getGuildIdForBrand(brand: Brand): string {
  return DISCORD_GUILD_CONFIG[brand].guildId;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier): string[] {
  return DISCORD_GUILD_CONFIG[brand].tierRoles[tier] || [];
}
