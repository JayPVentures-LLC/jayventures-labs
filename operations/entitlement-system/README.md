# Entitlement System

Cloudflare Worker that receives Stripe subscription/payment events, updates entitlement state, and reconciles Discord roles for both JayPVentures brands.

## Runtime Surface
- `POST /webhook/stripe`: verifies Stripe signature, enforces idempotency, updates entitlement state, and attempts Discord sync.
- `POST /admin/override`: admin-only route for manual grants, revocations, or tier changes.
- `POST /admin/discord-sync`: admin-only route for on-demand sync or retry-queue drainage.
- `GET /health`: lightweight health endpoint.

## Data Model
Each user record stores:
- top-level status and expiry across all brand entitlements
- optional Discord identity and last sync timestamp
- one entitlement entry per brand with tier, role IDs, status, source, expiry, and last Stripe event ID
- admin override metadata when changes are made manually

## Environment
Required bindings and vars are declared in `wrangler.toml` and `.dev.vars.example`.

Required secrets:
- `STRIPE_WEBHOOK_SECRET`
- `DISCORD_BOT_TOKEN`
- `ADMIN_OVERRIDE_KEY`

Required KV bindings:
- `ENTITLEMENT_KV`
- `IDEMPOTENCY_KV`

Optional KV binding:
- `RETRY_QUEUE_KV`

## Event Flow
1. Stripe posts an event to `/webhook/stripe`.
2. The worker validates the `stripe-signature` header against the raw body.
3. Supported Stripe events are mapped to a normalized entitlement payload.
4. The worker writes the user entitlement record and idempotency marker to KV.
5. Discord roles are reconciled for the affected brand.
6. If Discord sync fails, a retry task is stored in `RETRY_QUEUE_KV`.
7. Admins can drain the retry queue with `POST /admin/discord-sync` and `{ "processRetryQueue": true }`.

## Admin Override Payload
Example:

```json
{
  "userId": "user-123",
  "discordId": "discord-123",
  "brand": "jaypventures",
  "tier": "member",
  "status": "active",
  "reason": "manual grant",
  "syncDiscord": true
}
```

Headers:
- `Authorization: Bearer <ADMIN_OVERRIDE_KEY>`
or
- `x-admin-key: <ADMIN_OVERRIDE_KEY>`

## Local Development
1. Copy `.dev.vars.example` to `.dev.vars`.
2. Replace the placeholder KV IDs in `wrangler.toml`.
3. Run `npm install` at the repo root.
4. Start the worker with:

```bash
npx wrangler dev operations/entitlement-system/workers/stripeWebhook.ts --config operations/entitlement-system/wrangler.toml
```

## Verification
Run the targeted tests:

```bash
npm run test:entitlement
```
