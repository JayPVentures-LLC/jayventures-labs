import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';

const router = Router();

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

interface EnterpriseLead {
  name: string;
  email: string;
  company?: string;
  tin?: string;
  package_interest?: string;
  message?: string;
}

/**
 * POST /intake/enterprise
 * Routes enterprise leads (JayPVentures LLC — TIN-aligned) to Cosmos DB customers container.
 */
router.post('/enterprise', async (req: Request, res: Response) => {
  const { name, email, company, tin, package_interest, message } = req.body as EnterpriseLead;

  if (!name || !email) {
    return res.status(400).json({ error: 'missing_required_fields', required: ['name', 'email'] });
  }

  const leadRecord = {
    id: `enterprise_${Date.now()}_${email.replace(/[^a-z0-9]/gi, '_')}`,
    lead_type: 'enterprise',
    entity: 'JayPVentures LLC',
    revenue_alignment: 'TIN',
    name,
    email,
    company: company ?? null,
    tin: tin ?? null,
    package_interest: package_interest ?? null,
    message: message ?? null,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const container = getCosmosContainer('customers');
    await container.items.create(leadRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[intake/enterprise] Cosmos write failed:', msg);
    return res.status(500).json({ error: 'lead_capture_failed' });
  }

  return res.status(201).json({ received: true, lead_type: 'enterprise', id: leadRecord.id });
});

export { router as intakeEnterpriseRouter };
