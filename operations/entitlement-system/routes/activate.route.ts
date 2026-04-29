import { Hono } from 'hono';

export type ActivateEnv = {
  ENTITLEMENT_KV: KVNamespace;
  WORKER_EVENTS_QUEUE: Queue;
};

export const activateRoute = new Hono<{ Bindings: ActivateEnv }>();

activateRoute.get('/', async (c) => {
  const discordUserId = c.req.query('discord_user_id');
  const customerId = c.req.query('customer_id');

  if (!discordUserId) {
    return c.json({ ok: false, error: 'missing_discord_user' }, 400);
  }

  // lookup verified oauth session
  const oauthRecord = await c.env.ENTITLEMENT_KV.get(`discord:oauth:${discordUserId}`, 'json');
  if (!oauthRecord) {
    return c.json({ ok: false, error: 'discord_not_verified' }, 403);
  }

  // lookup entitlement (example assumes Stripe customer id passed or resolved upstream)
  const entitlement = customerId
    ? await c.env.ENTITLEMENT_KV.get(`entitlement:customer:${customerId}`, 'json')
    : null;

  if (!entitlement) {
    return c.json({ ok: false, error: 'no_entitlement_found' }, 403);
  }

  const binding = {
    discord_user_id: discordUserId,
    customer_id: customerId,
    bound_at: new Date().toISOString(),
  };

  await c.env.ENTITLEMENT_KV.put(
    `binding:${discordUserId}`,
    JSON.stringify(binding)
  );

  await c.env.WORKER_EVENTS_QUEUE.send({
    type: 'DISCORD_ROLE_SYNC',
    payload: binding,
  });

  return c.json({ ok: true, status: 'activated' });
});
