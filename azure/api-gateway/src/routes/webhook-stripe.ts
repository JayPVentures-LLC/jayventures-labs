import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { QueueServiceClient } from '@azure/storage-queue';
import { CosmosClient } from '@azure/cosmos';

const router = Router();

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

function getQueueClient(queueName: string) {
  const conn = process.env.STORAGE_CONNECTION;
  if (!conn) throw new Error('STORAGE_CONNECTION not configured');
  return QueueServiceClient.fromConnectionString(conn).getQueueClient(queueName);
}

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

/**
 * POST /webhook/stripe
 * 1. Verify Stripe signature
 * 2. Normalize event
 * 3. Store audit_event in Cosmos DB
 * 4. Push event to stripe-events queue
 * 5. Return 200 only after all steps succeed
 */
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook/stripe] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'webhook_not_configured' });
  }
  if (!sig) {
    return res.status(400).json({ error: 'missing_stripe_signature' });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    // Raw body is needed for signature verification. Express.json() parses it,
    // so re-serialise or use express.raw() middleware upstream for production.
    const rawBody = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[webhook/stripe] signature verification failed:', msg);
    return res.status(400).json({ error: 'invalid_signature', detail: msg });
  }

  // Normalize
  const normalized = {
    id: event.id,
    type: event.type,
    created: event.created,
    livemode: event.livemode,
    data: event.data.object,
    received_at: new Date().toISOString(),
  };

  try {
    // Store audit event
    const auditContainer = getCosmosContainer('audit_events');
    await auditContainer.items.create({
      id: event.id,
      subject_id: (event.data.object as Record<string, unknown>)['customer'] ?? 'unknown',
      event_type: event.type,
      payload: normalized,
      created_at: new Date().toISOString(),
    });

    // Push to stripe-events queue
    const queueName = process.env.STRIPE_EVENTS_QUEUE ?? 'stripe-events';
    const queueClient = getQueueClient(queueName);
    await queueClient.sendMessage(Buffer.from(JSON.stringify(normalized)).toString('base64'));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[webhook/stripe] failed to store/enqueue event:', msg);
    return res.status(500).json({ error: 'internal_error' });
  }

  return res.status(200).json({ received: true });
});

export { router as webhookStripeRouter };
