import type { Env } from "../config/env";
import { addMemberRole, removeMemberRole } from "./discord.service";
import { logger } from "../utils/logger";

export class DiscordReflectionError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "DiscordReflectionError";
  }
}

export function getDiscordRoleIdForTier(env: Env, tier: string): string {
  switch (tier) {
    case "community":
      if (!env.DISCORD_ROLE_COMMUNITY_ID) {
        throw new DiscordReflectionError(
          "Missing DISCORD_ROLE_COMMUNITY_ID binding",
          "missing_discord_role_mapping"
        );
      }
      return env.DISCORD_ROLE_COMMUNITY_ID;
    case "vip":
      if (!env.DISCORD_ROLE_VIP_ID) {
        throw new DiscordReflectionError(
          "Missing DISCORD_ROLE_VIP_ID binding",
          "missing_discord_role_mapping"
        );
      }
      return env.DISCORD_ROLE_VIP_ID;
    default:
      throw new DiscordReflectionError(
        `No Discord role mapping for tier: ${tier}`,
        "missing_discord_role_mapping"
      );
  }
}

export type DiscordReflectionResult = {
  subject_id: string;
  discord_user_id: string;
  tier: string;
  role_id: string;
  action: string;
  result: "added" | "removed";
  timestamp: string;
};

export async function syncDiscordRole(
  env: Env,
  params: {
    discord_user_id: string;
    tier: string;
    action: string;
    subject_id: string;
  }
): Promise<DiscordReflectionResult> {
  const { discord_user_id, tier, action, subject_id } = params;

  if (!subject_id) {
    throw new DiscordReflectionError("Missing verified subject_id", "missing_subject_id");
  }

  if (!discord_user_id) {
    throw new DiscordReflectionError("Missing verified discord_user_id", "missing_discord_user_id");
  }

  if (!env.DISCORD_GUILD_ID) {
    throw new DiscordReflectionError("Missing DISCORD_GUILD_ID binding", "missing_discord_guild_id");
  }

  if (!env.DISCORD_BOT_TOKEN && !env.DISCORD_BOT_TOKEN_SECRET_NAME) {
    throw new DiscordReflectionError("Missing DISCORD_BOT_TOKEN binding", "missing_discord_bot_token");
  }
  // Note: the actual token is resolved (including from Key Vault) inside addMemberRole/removeMemberRole
  // via getDiscordBotToken. A Key Vault resolution failure will throw a non-DiscordReflectionError,
  // which the queue handler treats as transient and retries.

  const role_id = getDiscordRoleIdForTier(env, tier);

  if (action !== "ENTITLEMENT_ACTIVE" && action !== "ENTITLEMENT_INACTIVE") {
    throw new DiscordReflectionError(
      `Unsupported entitlement sync action: ${action}`,
      "unsupported_entitlement_sync_action"
    );
  }

  const timestamp = new Date().toISOString();

  if (action === "ENTITLEMENT_ACTIVE") {
    await addMemberRole(env, env.DISCORD_GUILD_ID, discord_user_id, role_id);
  } else {
    await removeMemberRole(env, env.DISCORD_GUILD_ID, discord_user_id, role_id);
  }

  const syncResult = action === "ENTITLEMENT_ACTIVE" ? "added" : "removed";
  const record: DiscordReflectionResult = {
    subject_id,
    discord_user_id,
    tier,
    role_id,
    action,
    result: syncResult,
    timestamp,
  };

  logger.log("info", "Discord role synced via entitlement reflection", record as unknown as Record<string, unknown>);

  if (env.METRICS_KV) {
    const key = `discord_reflection:${timestamp}:${subject_id}`;
    await env.METRICS_KV.put(key, JSON.stringify(record), { expirationTtl: 90 * 24 * 60 * 60 });
  }

  return record;
}
