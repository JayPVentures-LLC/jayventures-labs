# jaypventures-labs

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
2. Create local secret files with `npm run setup:devvars`.
3. Fill in real secrets and KV IDs in the generated `.dev.vars` files and both Wrangler configs.
4. Run tests with `npm test`.
5. Type-check with `npm run typecheck`.
6. Start a worker locally with:
   - `npm run dev:entitlement`
   - `npm run dev:bookings`
7. Validate deployment packaging without pushing with:
   - `npm run deploy:dryrun:entitlement`
   - `npm run deploy:dryrun:bookings`

## Deployment and Automation
- [docs/github-setup.md](docs/github-setup.md)

## Trust and Governance
- [GOVERNANCE.md](GOVERNANCE.md)
- [SECURITY.md](SECURITY.md)

## Promotion Policy
Code and documentation in this repository remain experimental until they are deployed, verified, and promoted into a dedicated production repository or platform environment.

