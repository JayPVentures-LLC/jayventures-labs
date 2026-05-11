import * as appInsights from 'applicationinsights';
import express from 'express';

import { webhookStripeRouter } from './routes/webhook-stripe';
import { entitlementsSyncRouter } from './routes/entitlements-sync';
import { userAccessRouter } from './routes/user-access';
import { discordSyncRouter } from './routes/discord-sync';
import { intakeEnterpriseRouter } from './routes/intake-enterprise';
import { intakeLabsRouter } from './routes/intake-labs';
import { intakeCreatorRouter } from './routes/intake-creator';

// ─── Application Insights ─────────────────────────────────────────────────────
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_CONNECTION) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ?? process.env.APPINSIGHTS_CONNECTION)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
}

// ─── Rate-limit state ─────────────────────────────────────────────────────────
// Simple in-process rate limiter (per-IP, sliding window).
// Swap for a Redis-backed solution when scaling to multiple replicas.
const rateLimitWindows = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX  = parseInt(process.env.RATE_LIMIT_MAX  ?? '60',  10); // requests
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW ?? '60000', 10); // ms

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const entry = rateLimitWindows.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitWindows.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'rate_limit_exceeded' });
  }
  return next();
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

// Stripe webhook must receive the raw body for signature verification.
// Mount before express.json() so it gets the buffer.
app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

// All other routes receive parsed JSON.
app.use(express.json());

// Health probe (used by Container Apps)
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'jpv-api-gateway' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
// POST /webhook/stripe — verify Stripe signature, push to stripe-events queue
app.use('/webhook', webhookStripeRouter);

// POST /entitlements/sync — recalculate access from Stripe subscription
app.use('/entitlements', entitlementsSyncRouter);

// GET /user/access — signed token → active products, tier, scope (rate-limited)
app.use('/user', rateLimit, userAccessRouter);

// POST /discord/sync — assign/remove Discord roles from entitlement
app.use('/discord', discordSyncRouter);

// POST /intake/enterprise — JayPVentures LLC leads
app.use('/intake', intakeEnterpriseRouter);

// POST /intake/labs — jaypVLabs research/school leads
app.use('/intake', intakeLabsRouter);

// POST /intake/creator — jaypventures creator community leads
app.use('/intake', intakeCreatorRouter);

// 404 fallthrough
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3000', 10);
app.listen(PORT, () => {
  console.log(`[jpv-api-gateway] listening on :${PORT}`);
});

export default app;
