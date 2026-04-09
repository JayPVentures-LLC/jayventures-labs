# jayventures-labs

Enterprise workspace for JayPVentures LLC experiments, internal tooling, worker prototypes, website drafts, and operating documentation.

## Active Projects

### Entitlement System
- Location: `operations/entitlement-system`
- Runtime: Cloudflare Worker
- Entry point: `workers/stripeWebhook.ts`
- Routes:
  - `POST /webhook/stripe`
  - `POST /admin/override`
  - `POST /admin/discord-sync`
  - `GET /health`

### Unified Intake Engine
- Location: `wix/bookings`
- Runtime: Cloudflare Worker
- Entry point: `src/index.ts`
- Routes:
  - `POST /webhook/intake`
  - `GET /metrics`
  - `GET /inner-circle`
  - `GET /inner-circle/metrics`
  - `POST /inner-circle/backfill`
  - `GET /creator`
  - `GET /creator/metrics`
  - `POST /creator/upload`

## Local Tooling

1. Install dependencies with `npm install` from the repo root.
2. Run tests with `npm test`.
3. Type-check with `npm run typecheck`.
4. Use the worker-specific Wrangler configs in:
   - `operations/entitlement-system/wrangler.toml`
   - `wix/bookings/wrangler.toml`
5. Copy each `.dev.vars.example` to `.dev.vars` in the matching worker folder before running locally.

## Trust and Governance
- [GOVERNANCE.md](GOVERNANCE.md)
- `SECURITY.md` is referenced by the website previews and should exist alongside governance documents before launch.

## Promotion Policy
Code and documentation in this repository remain experimental until they are deployed, verified, and promoted into a dedicated production repository or platform environment.
