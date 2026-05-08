import type { Brand, Tier } from "../types/entitlement.types";
import type { Env } from "./env";
import { getDiscordGuildConfig } from "./discordGuilds";

export function getDiscordRoleId(env: Env, brand: Brand, tier: Tier): string | undefined {
  const config = getDiscordGuildConfig(env);
  return config[brand]?.roles?.[tier] ?? undefined;
}
