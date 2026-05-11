import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';

const router = Router();

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

interface CreatorLead {
  name: string;
  email: string;
  content_type?: string;
  tier_interest?: 'community' | 'vip';
  message?: string;
}

/**
 * POST /intake/creator
 * Routes creator community leads (jaypventures — SSN-aligned) to Cosmos DB customers container.
 */
router.post('/creator', async (req: Request, res: Response) => {
  const { name, email, content_type, tier_interest, message } = req.body as CreatorLead;

  if (!name || !email) {
    return res.status(400).json({ error: 'missing_required_fields', required: ['name', 'email'] });
  }

  const leadRecord = {
    id: `creator_${Date.now()}_${email.replace(/[^a-z0-9]/gi, '_')}`,
    lead_type: 'creator',
    entity: 'jaypventures',
    revenue_alignment: 'SSN',
    name,
    email,
    content_type: content_type ?? null,
    tier_interest: tier_interest ?? 'community',
    message: message ?? null,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const container = getCosmosContainer('customers');
    await container.items.create(leadRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[intake/creator] Cosmos write failed:', msg);
    return res.status(500).json({ error: 'lead_capture_failed' });
  }

  return res.status(201).json({ received: true, lead_type: 'creator', id: leadRecord.id });
});

export { router as intakeCreatorRouter };
