import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';
import Stripe from 'stripe';

const router = Router();

type EntitlementTier = 'community' | 'vip' | 'enterprise' | 'labs';

interface EntitlementRecord {
  id: string;
  subject_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_product_id: string;
  tier: EntitlementTier;
  status: 'active' | 'inactive' | 'cancelled';
  expires_at: string | null;
  updated_at: string;
}

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key);
}

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

function mapProductToTier(productId: string): EntitlementTier {
  // Product → tier mapping driven by env; fallback to metadata lookup
  const communityId = process.env.STRIPE_PRODUCT_COMMUNITY_ID ?? '';
  const vipId       = process.env.STRIPE_PRODUCT_VIP_ID ?? '';
  const enterpriseId= process.env.STRIPE_PRODUCT_ENTERPRISE_ID ?? '';
  const labsId      = process.env.STRIPE_PRODUCT_LABS_ID ?? '';

  if (productId === vipId)       return 'vip';
  if (productId === enterpriseId) return 'enterprise';
  if (productId === labsId)       return 'labs';
  if (productId === communityId)  return 'community';
  return 'community'; // safe default
}

/**
 * POST /entitlements/sync
 * Body: { stripe_customer_id: string, stripe_subscription_id?: string }
 * Recalculates user access from live Stripe data and upserts to Cosmos DB.
 */
router.post('/sync', async (req: Request, res: Response) => {
  const { stripe_customer_id, subject_id } = req.body as {
    stripe_customer_id?: string;
    subject_id?: string;
  };

  if (!stripe_customer_id) {
    return res.status(400).json({ error: 'missing_stripe_customer_id' });
  }

  try {
    const stripe = getStripeClient();

    // Fetch active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripe_customer_id,
      status: 'active',
      expand: ['data.items.data.price.product'],
      limit: 10,
    });

    const activeEntitlements: EntitlementRecord[] = subscriptions.data.map(sub => {
      const item = sub.items.data[0];
      const product = item?.price?.product;
      const productId = typeof product === 'object' && product !== null
        ? (product as Stripe.Product).id
        : String(product ?? '');

      const tier = mapProductToTier(productId);

      return {
        id: sub.id,
        subject_id: subject_id ?? stripe_customer_id,
        stripe_customer_id,
        stripe_subscription_id: sub.id,
        stripe_product_id: productId,
        tier,
        status: 'active',
        expires_at: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };
    });

    const container = getCosmosContainer('entitlements');

    // Upsert each entitlement record
    await Promise.all(
      activeEntitlements.map(e => container.items.upsert(e))
    );

    return res.status(200).json({ synced: activeEntitlements.length, entitlements: activeEntitlements });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[entitlements/sync] error:', msg);
    return res.status(500).json({ error: 'sync_failed', detail: msg });
  }
});

export { router as entitlementsSyncRouter };
