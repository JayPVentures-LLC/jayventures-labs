# Automation Map

## Objective
Map every major automation path in the dual-brand ecosystem so routing, ownership, fallback behavior, and data outputs are explicit.

## Current Automations

### Stripe to Entitlement
- Source: Stripe webhook events
- Entry point: `operations/entitlement-system/routes/webhook.route.ts`
- Trigger events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- Writes:
  - `ENTITLEMENT_KV`
  - `IDEMPOTENCY_KV`
  - optional `RETRY_QUEUE_KV`
- Side effects:
  - Discord role reconciliation
- Fallback:
  - failed Discord sync is enqueued for retry
  - duplicate Stripe events are ignored by idempotency key

### Unified Intake Routing
- Source: HMAC-signed intake envelopes from bookings, Stripe, Memberstack, or admin callers
- Entry point: `wix/bookings/src/routes/intake.ts`
- Writes:
  - `IDEMPOTENCY_KV`
  - `METRICS_KV`
  - optional `INNER_CIRCLE_MEMBER_KV`
- Side effects by lane/event:
  - SharePoint list item creation
  - Stripe customer creation
  - email webhook dispatch
  - data lake write
- Fallback:
  - integration calls are retried in-process up to three times
  - missing integration env vars return `skipped` results instead of crashing the intake route

### Inner Circle Backfill
- Source: admin POST requests or helper scripts
- Entry point: `wix/bookings/src/routes/innerCircle.ts`
- Writes:
  - `INNER_CIRCLE_MEMBER_KV`
  - optional SharePoint member sync
- Fallback:
  - dry-run mode validates payloads without writing KV
  - invalid rows are returned with per-record validation errors

### Creator Metrics Upload
- Source: admin callers or authenticated Inner Circle users
- Entry point: `wix/bookings/src/routes/creatorPortal.ts`
- Writes:
  - `CREATOR_DATA_KV`
- Fallback:
  - unauthorized callers are rejected
  - missing `CREATOR_DATA_KV` fails fast with a 500

## Brand Routing Rules
- `jaypventuresllc`: governance, consulting, enterprise services, and high-ticket consultations
- `jaypventures`: creator products, memberships, community offers, and creator-facing portals
- `All Ventures Access`: recurring membership lane inside the bookings worker and membership normalization paths

## Operator Controls
- Admin entitlement override route for manual grants and revocations
- Admin Discord sync route for targeted reconciliation and retry queue drainage
- Bookings backfill scripts for Inner Circle ID restoration
- Metrics endpoints for current-month revenue and booking visibility

## Observability Expectations
- Every automation path should emit structured logs with user or event identifiers.
- KV-backed idempotency must exist for all externally retried event sources.
- Launch artifacts should link to governance documents and live booking destinations.

## Open Operational Tasks
- provision real KV namespace IDs in both Wrangler configs
- create `.dev.vars` files from the provided examples
- verify Discord bot permissions in both target guilds
- publish `SECURITY.md` if it is still missing from the repo root
- complete live-site analytics, uptime, accessibility, and legal checks from the launch checklist
