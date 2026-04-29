import { Hono } from 'hono';

export type AuditRouteEnv = {
  ENTITLEMENT_KV: KVNamespace;
  ADMIN_OVERRIDE_KEY: string;
};

export const auditRoute = new Hono<{ Bindings: AuditRouteEnv }>();

auditRoute.get('/', async (c) => {
  const key = c.req.header('x-admin-key');
  if (!key || key !== c.env.ADMIN_OVERRIDE_KEY) {
    return c.json({ ok: false, error: 'unauthorized' }, 401);
  }

  const prefix = c.req.query('prefix') || 'audit:';
  const list = await c.env.ENTITLEMENT_KV.list({ prefix, limit: 50 });

  const results = [];
  for (const item of list.keys) {
    const value = await c.env.ENTITLEMENT_KV.get(item.name, 'json');
    if (value) results.push(value);
  }

  return c.json({ ok: true, count: results.length, results });
});
