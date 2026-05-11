import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';

const router = Router();

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

interface LabsLead {
  name: string;
  email: string;
  institution?: string;
  research_area?: string;
  scholarship_interest?: boolean;
  message?: string;
}

/**
 * POST /intake/labs
 * Routes research/education/labs leads (jaypVLabs — SSN-aligned) to Cosmos DB customers container.
 */
router.post('/labs', async (req: Request, res: Response) => {
  const { name, email, institution, research_area, scholarship_interest, message } = req.body as LabsLead;

  if (!name || !email) {
    return res.status(400).json({ error: 'missing_required_fields', required: ['name', 'email'] });
  }

  const leadRecord = {
    id: `labs_${Date.now()}_${email.replace(/[^a-z0-9]/gi, '_')}`,
    lead_type: 'labs',
    entity: 'jaypVLabs',
    revenue_alignment: 'SSN',
    name,
    email,
    institution: institution ?? null,
    research_area: research_area ?? null,
    scholarship_interest: scholarship_interest ?? false,
    message: message ?? null,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  try {
    const container = getCosmosContainer('customers');
    await container.items.create(leadRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[intake/labs] Cosmos write failed:', msg);
    return res.status(500).json({ error: 'lead_capture_failed' });
  }

  return res.status(201).json({ received: true, lead_type: 'labs', id: leadRecord.id });
});

export { router as intakeLabsRouter };
