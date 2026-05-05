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

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

app.use(express.json());

// Health probe (used by Container Apps)
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'jpv-api-gateway' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
// POST /webhook/stripe — verify Stripe signature, push to stripe-events queue
app.use('/webhook', webhookStripeRouter);

// POST /entitlements/sync — recalculate access from Stripe subscription
app.use('/entitlements', entitlementsSyncRouter);

// GET /user/access — signed token → active products, tier, scope
app.use('/user', userAccessRouter);

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
