import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "./discordGuilds";
export function getDiscordRoleId(brand: Brand, tier: Tier): string | undefined {
  if (brand in DISCORD_GUILD_CONFIG) {
    return DISCORD_GUILD_CONFIG[brand as KnownBrand]?.tierRoles?.[tier]?.[0] ?? undefined;
  }
  return undefined;
}
