import type { Env } from "../config/env";
import type { Tier } from "../types/entitlement.types";
import { getDiscordBotToken } from "./runtimeSecrets.service";
import type { DiscordRoleUpdate } from "../types/discord.types";
import type { BrandEntitlement, Entitlement } from "../types/entitlement.types";
import { reconcileRoles } from "./discordRoleMapping.service";
import { logger } from "../utils/logger";

const DISCORD_API = "https://discord.com/api/v10";

// --- Error types for fail-closed Discord reflection ---

export type DiscordReflectionErrorCode =
  | "missing_discord_user_id"
  | "missing_subject_id"
  | "missing_discord_guild_id"
  | "missing_discord_bot_token"
  | "missing_discord_role_mapping"
  | "unsupported_entitlement_sync_action"
  | "discord_api_error";

export class DiscordReflectionError extends Error {
  readonly isTransient: boolean;
  constructor(readonly code: DiscordReflectionErrorCode, message: string, isTransient = false) {
    super(message);
    this.name = "DiscordReflectionError";
    this.isTransient = isTransient;
  }
}

class DiscordApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function discordRequest(env: Env, method: string, url: string): Promise<unknown> {
  const botToken = await getDiscordBotToken(env);
  const response = await fetch(`${DISCORD_API}${url}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new DiscordApiError(message || `Discord request failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getGuildMember(env: Env, guildId: string, discordId: string): Promise<{ roles?: string[] } | null> {
  try {
    return (await discordRequest(env, "GET", `/guilds/${guildId}/members/${discordId}`)) as { roles?: string[] };
  } catch (error) {
    if (error instanceof DiscordApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function addMemberRole(env: Env, guildId: string, discordId: string, roleId: string): Promise<void> {
  await discordRequest(env, "PUT", `/guilds/${guildId}/members/${discordId}/roles/${roleId}`);
}

export async function removeMemberRole(env: Env, guildId: string, discordId: string, roleId: string): Promise<void> {
  await discordRequest(env, "DELETE", `/guilds/${guildId}/members/${discordId}/roles/${roleId}`);
}

export async function syncDiscordRoles(
  entitlement: Entitlement,
  brandEntitlement: BrandEntitlement,
  env: Env
): Promise<DiscordRoleUpdate & { success: boolean; skipped: boolean; error?: string }> {
  const discordId = entitlement.discord?.discordId;
  if (!discordId) {
    return {
      discordId: "",
      guildId: brandEntitlement.guildId,
      addRoles: [],
      removeRoles: [],
      success: false,
      skipped: true,
      error: "No Discord ID",
    };
  }

  const member = await getGuildMember(env, brandEntitlement.guildId, discordId);
  if (!member) {
    logger.log("warn", "Discord member not found", { userId: entitlement.userId, discordId, guildId: brandEntitlement.guildId });
    return {
      discordId,
      guildId: brandEntitlement.guildId,
      addRoles: [],
      removeRoles: [],
      success: false,
      skipped: true,
      error: "Discord member not found",
    };
  }

  const currentRoles = Array.isArray(member.roles) ? member.roles : [];
  const { add, remove } = reconcileRoles({
    brand: brandEntitlement.brand,
    tier: brandEntitlement.tier,
    status: brandEntitlement.status,
    currentRoles,
  });

  for (const roleId of remove) {
    await removeMemberRole(env, brandEntitlement.guildId, discordId, roleId);
  }

  for (const roleId of add) {
    await addMemberRole(env, brandEntitlement.guildId, discordId, roleId);
  }

  return {
    discordId,
    guildId: brandEntitlement.guildId,
    addRoles: add,
    removeRoles: remove,
    success: true,
    skipped: false,
  };
}

// --- Issue #7: Queue-based Discord reflection ---

/**
 * Maps a Tier to a Discord role ID using runtime env bindings.
 * Reads DISCORD_ROLE_COMMUNITY_ID for member tier and DISCORD_ROLE_VIP_ID for premium/enterprise.
 */
export function getDiscordRoleIdForTier(env: Env, tier: Tier): string | undefined {
  if (tier === "member") return env.DISCORD_ROLE_COMMUNITY_ID;
  if (tier === "premium" || tier === "enterprise") return env.DISCORD_ROLE_VIP_ID;
  return undefined;
}

export interface DiscordRoleSyncResult {
  roleId: string;
  applied: boolean;
}

/**
 * Applies a single Discord role mutation based on an entitlement sync action.
 * Uses runtime env bindings (DISCORD_GUILD_ID, DISCORD_BOT_TOKEN, role vars) — no hard-coded values.
 * Throws DiscordReflectionError for all failure cases:
 *   - Permanent errors (not retried): missing IDs, missing config, unsupported action.
 *   - Transient errors (retried): Discord API failures.
 */
export async function syncDiscordRole(
  env: Env,
  params: {
    subject_id: string;
    discord_user_id: string | undefined;
    tier: Tier;
    action: "ENTITLEMENT_ACTIVE" | "ENTITLEMENT_INACTIVE";
  }
): Promise<DiscordRoleSyncResult> {
  const { subject_id, discord_user_id, tier, action } = params;

  if (!subject_id) {
    throw new DiscordReflectionError("missing_subject_id", "subject_id is required");
  }
  if (!discord_user_id) {
    throw new DiscordReflectionError("missing_discord_user_id", "discord_user_id is required");
  }
  if (!env.DISCORD_GUILD_ID) {
    throw new DiscordReflectionError("missing_discord_guild_id", "DISCORD_GUILD_ID env binding is required");
  }

  let botToken: string;
  try {
    botToken = await getDiscordBotToken(env);
  } catch {
    throw new DiscordReflectionError("missing_discord_bot_token", "Discord bot token is unavailable");
  }

  const roleId = getDiscordRoleIdForTier(env, tier);
  if (!roleId) {
    throw new DiscordReflectionError(
      "missing_discord_role_mapping",
      `No role mapping found for tier: ${tier}`
    );
  }

  if (action !== "ENTITLEMENT_ACTIVE" && action !== "ENTITLEMENT_INACTIVE") {
    throw new DiscordReflectionError(
      "unsupported_entitlement_sync_action",
      `Unsupported action: ${action}`
    );
  }

  const method = action === "ENTITLEMENT_ACTIVE" ? "PUT" : "DELETE";
  const url = `${DISCORD_API}/guilds/${env.DISCORD_GUILD_ID}/members/${discord_user_id}/roles/${roleId}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => String(response.status));
    throw new DiscordReflectionError(
      "discord_api_error",
      `Discord API error ${response.status}: ${detail}`,
      true // transient — should be retried
    );
  }

  logger.log("info", "Discord role sync applied", { subject_id, discord_user_id, tier, roleId, action });
  return { roleId, applied: true };
}
