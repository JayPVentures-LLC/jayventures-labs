// Discord Service: Role assignment/removal, retry logic, admin override
import { Entitlement, BrandEntitlement } from '../types/entitlement.types';
import { reconcileRoles, getGuildIdForBrand } from './discordRoleMapping.service';
import { logger } from '../utils/logger';

const DISCORD_API = 'https://discord.com/api/v10';

async function discordRequest(env: any, method: string, url: string, body?: any) {
  const headers: Record<string, string> = {
    'Authorization': `Bot ${env.DISCORD_BOT_TOKEN}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${DISCORD_API}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 429) {
    logger.log('warn', 'Discord rate limited', { url });
    throw new Error('Rate limited');
  }
  if (!res.ok) {
    const err = await res.text();
    logger.log('error', 'Discord API error', { url, err });
    throw new Error(`Discord API error: ${err}`);
  }
  return res.json();
}

export async function getGuildMember(env: any, guildId: string, discordId: string) {
  try {
    const member = await discordRequest(env, 'GET', `/guilds/${guildId}/members/${discordId}`);
    return member;
  } catch (e: any) {
    if (e.message && e.message.includes('404')) return null;
    throw e;
  }
}

export async function addMemberRole(env: any, guildId: string, discordId: string, roleId: string) {
  return discordRequest(env, 'PUT', `/guilds/${guildId}/members/${discordId}/roles/${roleId}`);
}

export async function removeMemberRole(env: any, guildId: string, discordId: string, roleId: string) {
  return discordRequest(env, 'DELETE', `/guilds/${guildId}/members/${discordId}/roles/${roleId}`);
}

// Syncs all brand entitlements for a user across all guilds
export async function syncDiscord(entitlement: Entitlement, env: any) {
  if (!entitlement.discord?.discordId) return;
  for (const brandEnt of entitlement.entitlements) {
    await syncDiscordRoles(entitlement, brandEnt, env);
  }
}

// Syncs roles for a single brand entitlement
export async function syncDiscordRoles(ent: Entitlement, brandEnt: BrandEntitlement, env: any) {
  const { discord } = ent;
  const { brand, tier, guildId } = brandEnt;
  if (!discord?.discordId) return { success: false, error: 'No Discord ID', skipped: true };
  // Get current member roles
  const member = await getGuildMember(env, guildId, discord.discordId);
  if (!member) {
    logger.log('warn', 'Discord member not found', { discordId: discord.discordId, guildId });
    return { success: false, error: 'Member not found', skipped: true };
  }
  const currentRoles: string[] = member.roles || [];
  const { add, remove } = reconcileRoles({ brand, tier, currentRoles });
  // Remove conflicting roles
  for (const roleId of remove) {
    try {
      await removeMemberRole(env, guildId, discord.discordId, roleId);
      logger.log('info', 'Removed Discord role', { discordId: discord.discordId, guildId, roleId });
    } catch (e) {
      logger.log('error', 'Failed to remove Discord role', { discordId: discord.discordId, guildId, roleId, error: e.message });
    }
  }
  // Add expected roles
  for (const roleId of add) {
    try {
      await addMemberRole(env, guildId, discord.discordId, roleId);
      logger.log('info', 'Added Discord role', { discordId: discord.discordId, guildId, roleId });
    } catch (e) {
      logger.log('error', 'Failed to add Discord role', { discordId: discord.discordId, guildId, roleId, error: e.message });
    }
  }
  return {
    success: true,
    brand,
    guildId,
    addedRoles: add,
    removedRoles: remove,
    skipped: false
  };
}
