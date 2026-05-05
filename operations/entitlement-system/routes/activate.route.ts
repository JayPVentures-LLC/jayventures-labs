import { Hono } from 'hono';
import { verifyActivationToken } from '../services/activationToken.service';

export type ActivateEnv = {
  ENTITLEMENT_KV: KVNamespace;
  WORKER_EVENTS_QUEUE: Queue;
  ACTIVATION_TOKEN_SECRET: string;
};

export const activateRoute = new Hono<{ Bindings: ActivateEnv }>();

activateRoute.get('/', async (c) => {
  const token = c.req.query('token');
  const discordUserId = c.req.query('discord_user_id');

  if (!token || !discordUserId) {
    return c.json({ ok: false, error: 'missing_parameters' }, 400);
  }

  const payload = await verifyActivationToken(c.env.ACTIVATION_TOKEN_SECRET, token);
  if (!payload) {
    return c.json({ ok: false, error: 'invalid_or_expired_token' }, 403);
  }

  const oauthRecord = await c.env.ENTITLEMENT_KV.get(`discord:oauth:${discordUserId}`, 'json');
  if (!oauthRecord) {
    return c.json({ ok: false, error: 'discord_not_verified' }, 403);
  }

  const entitlement = await c.env.ENTITLEMENT_KV.get(`entitlement:customer:${payload.customer_id}`, 'json');
  if (!entitlement) {
    return c.json({ ok: false, error: 'no_entitlement_found' }, 403);
  }

  const binding = {
    discord_user_id: discordUserId,
    customer_id: payload.customer_id,
    entitlement_id: payload.entitlement_id,
    bound_at: new Date().toISOString(),
  };

  await c.env.ENTITLEMENT_KV.put(`binding:${discordUserId}`, JSON.stringify(binding));

  await c.env.WORKER_EVENTS_QUEUE.send({
    type: 'discord-retry',
    payload: {
      userId: payload.customer_id,
      reason: "activation",
    },
  });

  return c.json({ ok: true, status: 'activated' });
});
