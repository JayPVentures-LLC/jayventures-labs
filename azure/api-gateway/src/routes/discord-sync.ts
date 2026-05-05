import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';

const router = Router();

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

type DiscordSyncAction = 'grant' | 'revoke';

const TIER_ROLE_ENV: Record<string, string> = {
  community: 'DISCORD_ROLE_COMMUNITY_ID',
  vip:       'DISCORD_ROLE_VIP_ID',
};

async function callDiscordRoleApi(
  guildId: string,
  userId: string,
  roleId: string,
  action: DiscordSyncAction,
  botToken: string
): Promise<void> {
  const method = action === 'grant' ? 'PUT' : 'DELETE';
  const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      'X-Audit-Log-Reason': `JPV-OS entitlement ${action}`,
    },
  });

  if (res.status === 204 || res.status === 200) return;

  const body = await res.text().catch(() => '');
  if (res.status >= 500) {
    throw new Error(`discord_transient_error:${res.status}:${body}`);
  }
  throw new Error(`discord_permanent_error:${res.status}:${body}`);
}

/**
 * POST /discord/sync
 * Body: { subject_id: string, discord_user_id: string, tier: string, action: 'grant' | 'revoke' }
 * Assigns or removes Discord roles based on entitlement tier.
 */
router.post('/sync', async (req: Request, res: Response) => {
  const { subject_id, discord_user_id, tier, action } = req.body as {
    subject_id?: string;
    discord_user_id?: string;
    tier?: string;
    action?: string;
  };

  if (!subject_id)      return res.status(400).json({ error: 'missing_subject_id' });
  if (!discord_user_id) return res.status(400).json({ error: 'missing_discord_user_id' });
  if (!tier)            return res.status(400).json({ error: 'missing_tier' });
  if (action !== 'grant' && action !== 'revoke') {
    return res.status(400).json({ error: 'unsupported_action', valid: ['grant', 'revoke'] });
  }

  const guildId  = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId)  return res.status(503).json({ error: 'missing_discord_guild_id' });
  if (!botToken) return res.status(503).json({ error: 'missing_discord_bot_token' });

  const roleEnvKey = TIER_ROLE_ENV[tier];
  const roleId = roleEnvKey ? process.env[roleEnvKey] : undefined;
  if (!roleId) {
    return res.status(400).json({ error: 'missing_discord_role_mapping', tier });
  }

  try {
    await callDiscordRoleApi(guildId, discord_user_id, roleId, action, botToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith('discord_transient_error')) {
      console.warn('[discord/sync] transient error, should retry:', msg);
      return res.status(503).json({ error: 'discord_unavailable', retryable: true });
    }
    console.error('[discord/sync] permanent error:', msg);
    return res.status(400).json({ error: 'discord_sync_failed', detail: msg });
  }

  // Write audit record to Cosmos
  try {
    const container = getCosmosContainer('audit_events');
    await container.items.create({
      id: `discord_${action}_${Date.now()}_${subject_id}`,
      subject_id,
      discord_user_id,
      tier,
      role_id: roleId,
      action,
      event_type: 'discord_role_sync',
      created_at: new Date().toISOString(),
    });
  } catch (auditErr) {
    // Audit failure is non-fatal — log and continue
    console.error('[discord/sync] audit write failed:', auditErr);
  }

  return res.status(200).json({ synced: true, subject_id, discord_user_id, tier, action });
});

export { router as discordSyncRouter };
