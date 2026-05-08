import type { Env } from "../config/env";
import { getDiscordBotToken } from "./runtimeSecrets.service";
import type { DiscordRoleUpdate } from "../types/discord.types";
import type { BrandEntitlement, Entitlement } from "../types/entitlement.types";
import { reconcileRoles } from "./discordRoleMapping.service";
import { logger } from "../utils/logger";

const DISCORD_API = "https://discord.com/api/v10";

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
    env,
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
