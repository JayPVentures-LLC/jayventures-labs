import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "./discordGuilds";

/**
 * Get the Discord role ID for a brand and tier using the tierRoleMap.
 */
export function getDiscordRoleId(brand: Brand, tier: Tier): string | undefined {
  const config = DISCORD_GUILD_CONFIG[brand];
  if (!config) return undefined;

  const roleKey = config.tierRoleMap[tier];
  if (!roleKey) return undefined;

  return config.roles[roleKey];
}
