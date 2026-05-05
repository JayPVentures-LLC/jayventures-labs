import type { Brand, Tier } from "../types/entitlement.types";
import type { Env } from "./env";
import { getDiscordGuildConfig } from "./discordGuilds";

export function getDiscordRoleId(brand: Brand, tier: Tier, env: Env): string | undefined {
  const config = getDiscordGuildConfig(env);
  return config[brand]?.roles?.[tier] ?? undefined;
}
