// Webhook Route: Stripe event ingestion
import { verifyStripeSignature } from '../utils/verify-signature';
import { upsertBrandEntitlement } from '../services/entitlement.service';
import { syncDiscordRoles } from '../services/discordSync.service';
import { logger } from '../utils/logger';
import { getEnv, Env } from '../config/env';
import { SUPPORTED_STRIPE_EVENTS } from '../config/stripeEvents';
import { getRoleIdsForBrandTier } from '../services/discordRoleMapping.service';

// Helper: Read raw body for signature verification
async function readRawBody(request: Request): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  let chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (value) chunks.push(value);
    done = d;
  }
  let total = chunks.reduce((acc, c) => acc + c.length, 0);
  let out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function handleStripeWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const config = getEnv(env);
  let rawBody: Uint8Array;
  let sig: string | null = null;
  try {
    sig = request.headers.get('stripe-signature');
    if (!sig) throw new Error('Missing Stripe signature header');
    rawBody = await readRawBody(request);
    const valid = await verifyStripeSignature(rawBody, sig, config.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      logger.log('warn', 'Invalid Stripe signature', { sig });
      return new Response('Invalid signature', { status: 400 });
    }
    // Parse event
    const bodyText = new TextDecoder().decode(rawBody);
    const event = JSON.parse(bodyText);
    if (!SUPPORTED_STRIPE_EVENTS.includes(event.type)) {
      logger.log('info', 'Ignored Stripe event', { type: event.type });
      return new Response('Event ignored', { status: 200 });
    }
    // Idempotency: Use event.id as key
    const idempotencyKey = `stripe_event_${event.id}`;
    if (await env.KV_NAMESPACE.get(idempotencyKey)) {
      logger.log('info', 'Duplicate Stripe event', { id: event.id });
      return new Response('Duplicate event', { status: 200 });
    }
    // Extract user/brand/tier from event (example assumes metadata)
    const userId = event.data.object.metadata?.internal_user_id;
    const discordId = event.data.object.metadata?.discord_user_id;
    const brand = event.data.object.metadata?.brand;
    const tier = event.data.object.metadata?.tier;
    if (!userId || !discordId || !brand || !tier) {
      logger.log('error', 'Missing required metadata', { eventId: event.id });
      return new Response('Missing metadata', { status: 400 });
    }
    // Determine status and expiry
    let status = 'active';
    let expiresAt = 0;
    if (event.type === 'customer.subscription.deleted') {
      status = 'inactive';
      expiresAt = Date.now();
    } else {
      // Set expiry from subscription period if available
      expiresAt = event.data.object.current_period_end ? event.data.object.current_period_end * 1000 : 0;
    }
    // Get roles for this brand/tier
    const roleIds = getRoleIdsForBrandTier(brand, tier);
    // Update entitlement (fail closed on error)
    let ent;
    try {
      ent = await upsertBrandEntitlement({
        userId,
        brand,
        tier,
        status,
        expiresAt,
        source: 'stripe',
        discordId,
        roleIds,
        env
      });
      logger.log('info', 'Entitlement updated', { userId, brand, tier, status, expiresAt });
    } catch (err: any) {
      logger.log('error', 'Entitlement update failed', { userId, brand, error: err?.message });
      return new Response('Entitlement update failed', { status: 500 });
    }
    // Sync Discord roles
    try {
      const syncResults = await syncDiscordRoles(ent, env);
      logger.log('info', 'Discord sync results', { userId, brand, results: syncResults });
    } catch (err: any) {
      logger.log('error', 'Discord sync failed', { userId, brand, error: err?.message });
      // Optionally: queue for retry
    }
    await env.KV_NAMESPACE.put(idempotencyKey, '1', { expirationTtl: 86400 });
    logger.log('info', 'Stripe event processed', { id: event.id, type: event.type });
    return new Response('OK', { status: 200 });
  } catch (err: any) {
    logger.log('error', 'Stripe webhook error', { error: err?.message });
    // Fail closed: Stripe will retry
    return new Response('Webhook error', { status: 500 });
  }
}
