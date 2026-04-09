// Webhook Route: Stripe event ingestion
import { verifyStripeSignature } from '../utils/verify-signature';
import { processStripeEvent } from '../services/stripe.service';
import { logger } from '../utils/logger';
import { getEnv, Env } from '../config/env';
import { SUPPORTED_STRIPE_EVENTS } from '../config/stripeEvents';

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
    // Process event
    try {
      await processStripeEvent(event, env);
      await env.KV_NAMESPACE.put(idempotencyKey, '1', { expirationTtl: 86400 });
      logger.log('info', 'Stripe event processed', { id: event.id, type: event.type });
      return new Response('OK', { status: 200 });
    } catch (err: any) {
      logger.log('error', 'Stripe event processing failed', { id: event.id, error: err?.message });
      // Fail closed: Stripe will retry
      return new Response('Processing failed', { status: 500 });
    }
  } catch (err: any) {
    logger.log('error', 'Stripe webhook error', { error: err?.message });
    // Fail closed: Stripe will retry
    return new Response('Webhook error', { status: 500 });
  }
}
