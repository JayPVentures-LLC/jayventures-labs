// Discord Role Mapping Service: Resolves guild and roles for brand/tier
import { Brand, Tier } from '../types/entitlement.types';
import { DISCORD_GUILD_CONFIG } from '../config/discordGuilds';

export function getGuildIdForBrand(brand: Brand): string {
  return DISCORD_GUILD_CONFIG[brand].guildId;
}

export function getRoleIdsForBrandTier(brand: Brand, tier: Tier): string[] {
  return DISCORD_GUILD_CONFIG[brand].tierRoles[tier] || [];
}

// Returns all possible tier roles for a brand (for conflict removal)
export function getAllTierRolesForBrand(brand: Brand): string[] {
  return Object.values(DISCORD_GUILD_CONFIG[brand].tierRoles).flat();
}

// Reconcile roles: given current roles, brand, tier, return roles to add/remove
export function reconcileRoles({
  brand,
  tier,
  currentRoles
}: {
  brand: Brand;
  tier: Tier;
  currentRoles: string[];
}): { add: string[]; remove: string[] } {
  const expected = getRoleIdsForBrandTier(brand, tier);
  const allBrandRoles = getAllTierRolesForBrand(brand);
  // Remove all other brand tier roles not in expected
  const remove = currentRoles.filter(r => allBrandRoles.includes(r) && !expected.includes(r));
  const add = expected.filter(r => !currentRoles.includes(r));
  return { add, remove };
}
