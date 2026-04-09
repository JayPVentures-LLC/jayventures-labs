// Discord Role Mapping: brand/tier → Discord role ID
import { Brand, Tier } from '../types/entitlement.types';

export function getDiscordRoleId(brand: Brand, tier: Tier, roleMap: Record<string, string>): string | undefined {
  // TODO: Return role ID for brand/tier
  return roleMap[`${brand}:${tier}`];
}
