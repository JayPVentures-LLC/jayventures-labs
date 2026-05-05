import { Router, Request, Response } from 'express';
import { CosmosClient } from '@azure/cosmos';
import { jwtVerify, createLocalJWKSet, importJWK } from 'jose';

const router = Router();

function getCosmosContainer(containerName: string) {
  const conn = process.env.COSMOS_CONNECTION;
  if (!conn) throw new Error('COSMOS_CONNECTION not configured');
  const client = new CosmosClient(conn);
  return client.database('jpv-entitlements-db').container(containerName);
}

interface UserAccessResponse {
  subject_id: string;
  active_products: string[];
  tier: string;
  expiration: string | null;
  access_scope: string[];
}

const TIER_SCOPES: Record<string, string[]> = {
  community: ['content:read', 'community:access'],
  vip:       ['content:read', 'content:vip', 'community:access', 'community:vip'],
  enterprise:['content:read', 'content:vip', 'enterprise:access', 'consulting:access'],
  labs:      ['content:read', 'labs:access', 'research:access', 'education:access'],
};

/**
 * GET /user/access
 * Header: Authorization: Bearer <signed-jwt>
 * Returns: { subject_id, active_products, tier, expiration, access_scope }
 */
router.get('/access', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token' });
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'jwt_not_configured' });
  }

  let subject_id: string;
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    subject_id = String(payload.sub ?? payload.subject_id ?? '');
    if (!subject_id) throw new Error('missing sub claim');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(401).json({ error: 'invalid_token', detail: msg });
  }

  try {
    const container = getCosmosContainer('entitlements');
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.subject_id = @subjectId AND c.status = "active"',
        parameters: [{ name: '@subjectId', value: subject_id }],
      })
      .fetchAll();

    const active_products: string[] = resources.map((r: { stripe_product_id: string }) => r.stripe_product_id);
    const tiers = resources.map((r: { tier: string }) => r.tier);

    // Highest tier wins
    const tierPriority = ['enterprise', 'vip', 'labs', 'community'];
    const tier = tierPriority.find(t => tiers.includes(t)) ?? 'none';

    const expiration = resources.length > 0
      ? resources.sort((a: { expires_at: string | null }, b: { expires_at: string | null }) =>
          (b.expires_at ?? '').localeCompare(a.expires_at ?? '')
        )[0].expires_at
      : null;

    const access_scope = TIER_SCOPES[tier] ?? [];

    const response: UserAccessResponse = {
      subject_id,
      active_products,
      tier,
      expiration,
      access_scope,
    };

    return res.status(200).json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[user/access] error:', msg);
    return res.status(500).json({ error: 'access_check_failed', detail: msg });
  }
});

export { router as userAccessRouter };
