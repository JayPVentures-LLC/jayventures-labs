import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "./discordGuilds";

export function getDiscordRoleId(brand: Brand, tier: Tier): string | undefined {
  return DISCORD_GUILD_CONFIG[brand]?.tierRoles[tier]?.[0];
}
