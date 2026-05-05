import { app, InvocationContext } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StripeEventPayload {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: Record<string, unknown>;
  received_at: string;
}

type EntitlementTier = 'community' | 'vip' | 'enterprise' | 'labs';
type DiscordSyncAction = 'grant' | 'revoke';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

function mapProductToTier(productId: string): EntitlementTier {
  const communityId  = process.env.STRIPE_PRODUCT_COMMUNITY_ID ?? '';
  const vipId        = process.env.STRIPE_PRODUCT_VIP_ID ?? '';
  const enterpriseId = process.env.STRIPE_PRODUCT_ENTERPRISE_ID ?? '';
  const labsId       = process.env.STRIPE_PRODUCT_LABS_ID ?? '';

  if (productId === vipId)        return 'vip';
  if (productId === enterpriseId)  return 'enterprise';
  if (productId === labsId)        return 'labs';
  if (productId === communityId)   return 'community';
  return 'community';
}

const TIER_ROLE_ENV: Record<string, string> = {
  community: 'DISCORD_ROLE_COMMUNITY_ID',
  vip:       'DISCORD_ROLE_VIP_ID',
};

const DISCORD_SNOWFLAKE_RE = /^\d{17,20}$/;

async function syncDiscordRole(
  guildId: string,
  userId: string,
  roleId: string,
  action: DiscordSyncAction,
  botToken: string
): Promise<void> {
  // Validate IDs are Discord snowflakes before embedding in the URL.
  for (const [label, value] of [['guild_id', guildId], ['user_id', userId], ['role_id', roleId]] as const) {
    if (!DISCORD_SNOWFLAKE_RE.test(value)) {
      throw new Error(`discord_permanent_error:invalid_${label}`);
    }
  }

  const method = action === 'grant' ? 'PUT' : 'DELETE';
  const url = `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      'X-Audit-Log-Reason': `JPV-OS entitlement ${action} via event-processor`,
    },
  });

  if (res.status === 204 || res.status === 200) return;

  const body = await res.text().catch(() => '');
  if (res.status >= 500) {
    throw new Error(`discord_transient_error:${res.status}:${body}`);
  }
  throw new Error(`discord_permanent_error:${res.status}:${body}`);
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleSubscriptionEvent(
  eventPayload: StripeEventPayload,
  action: DiscordSyncAction,
  context: InvocationContext
): Promise<void> {
  const subData = eventPayload.data as {
    id?: string;
    customer?: string;
    items?: { data: Array<{ price: { product: string } }> };
    current_period_end?: number;
    metadata?: Record<string, string>;
  };

  const stripeCustomerId = String(subData.customer ?? '');
  const subId = String(subData.id ?? '');
  const productId = subData.items?.data[0]?.price?.product ?? '';
  const discordUserId = subData.metadata?.discord_user_id ?? '';
  const subjectId = subData.metadata?.subject_id ?? stripeCustomerId;

  const tier = mapProductToTier(productId);
  context.log(`[event-processor] ${action} ${tier} for subject=${subjectId} discord=${discordUserId}`);

  // Upsert entitlement in Cosmos
  const entitlementContainer = getCosmosContainer('entitlements');
  await entitlementContainer.items.upsert({
    id: subId,
    subject_id: subjectId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subId,
    stripe_product_id: productId,
    tier,
    status: action === 'grant' ? 'active' : 'inactive',
    expires_at: subData.current_period_end
      ? new Date(subData.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });

  // Sync Discord role if discord_user_id is present in Stripe metadata
  if (discordUserId) {
    const guildId  = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
      context.warn('[event-processor] Discord credentials not configured — skipping role sync');
    } else {
      const roleEnvKey = TIER_ROLE_ENV[tier];
      const roleId = roleEnvKey ? process.env[roleEnvKey] : undefined;

      if (!roleId) {
        context.warn(`[event-processor] No Discord role mapped for tier=${tier}`);
      } else {
        let discordSyncSucceeded = false;

        // Transient errors bubble up and cause Azure Functions to retry automatically.
        // Permanent errors are caught and logged — no retry on those.
        try {
          await syncDiscordRole(guildId, discordUserId, roleId, action, botToken);
          context.log(`[event-processor] Discord role ${action} succeeded for discord=${discordUserId} tier=${tier}`);
          discordSyncSucceeded = true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.startsWith('discord_transient_error')) {
            // Re-throw so Azure Functions retries the message
            throw err;
          }
          // Permanent error — log and ack (don't retry)
          context.error(`[event-processor] Discord permanent error — acking: ${msg}`);
        }

        // Write audit record for every attempted Discord sync (success and permanent failure)
        const auditContainer = getCosmosContainer('audit_events');
        await auditContainer.items.create({
          id: `discord_${action}_${Date.now()}_${subjectId}`,
          subject_id: subjectId,
          discord_user_id: discordUserId,
          tier,
          action,
          succeeded: discordSyncSucceeded,
          event_type: 'discord_role_sync',
          stripe_event_id: eventPayload.id,
          created_at: new Date().toISOString(),
        }).catch(e => context.error('[event-processor] audit write failed:', e));
      }
    }
  }
}

// ─── Queue Trigger ────────────────────────────────────────────────────────────

app.storageQueue('stripeEventsProcessor', {
  queueName: 'stripe-events',
  connection: 'STRIPE_EVENTS_QUEUE_CONNECTION',

  handler: async (queueItem: unknown, context: InvocationContext): Promise<void> => {
    context.log('[event-processor] received queue message');

    let eventPayload: StripeEventPayload;
    try {
      const raw = typeof queueItem === 'string' ? queueItem : JSON.stringify(queueItem);
      eventPayload = JSON.parse(raw) as StripeEventPayload;
    } catch (err) {
      context.error('[event-processor] failed to parse queue message — dropping:', err);
      return; // ack bad message to avoid infinite retry
    }

    context.log(`[event-processor] processing event type=${eventPayload.type} id=${eventPayload.id}`);

    try {
      switch (eventPayload.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionEvent(eventPayload, 'grant', context);
          break;

        case 'customer.subscription.deleted':
        case 'customer.subscription.paused':
          await handleSubscriptionEvent(eventPayload, 'revoke', context);
          break;

        case 'invoice.payment_succeeded':
          context.log(`[event-processor] payment_succeeded — no action required for event=${eventPayload.id}`);
          break;

        case 'invoice.payment_failed':
          context.warn(`[event-processor] payment_failed — consider grace-period logic for event=${eventPayload.id}`);
          break;

        default:
          context.log(`[event-processor] unhandled event type=${eventPayload.type} — acking`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('discord_transient_error')) {
        // Re-throw to trigger Azure Functions retry (message will be re-queued)
        context.warn('[event-processor] transient Discord error — will retry');
        throw err;
      }
      context.error('[event-processor] unhandled error — acking to avoid poison pill:', msg);
    }
  },
});
