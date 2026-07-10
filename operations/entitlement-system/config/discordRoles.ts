import type { Brand, Tier } from "../types/entitlement.types";
import { DISCORD_GUILD_CONFIG } from "./discordGuilds";
export function getDiscordRoleId(brand: Brand, tier: Tier): string | undefined {
  if (brand in DISCORD_GUILD_CONFIG) {
    // @ts-expect-error: TypeScript can't guarantee brand is KnownBrand, but we check above
    return DISCORD_GUILD_CONFIG[brand]?.roles?.[tier] ?? undefined;
  }
  return undefined;
}
