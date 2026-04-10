# jaypventures-labs

Enterprise workspace for JayPVentures LLC systems, flagship website delivery, creator/member surfaces, worker prototypes, and operating documentation.

## Active Projects

### Flagship Website
- Location: `apps/flagship-site`
- Runtime: Cloudflare Worker
- Entry point: `src/index.ts`
- Purpose: Enterprise-first flagship marketing site for `jaypventuresllc.com`
- Public routes:
  - `GET /`
  - `GET /services`
  - `GET /pricing`
  - `GET /ventures`
  - `GET /creator`
  - `GET /all-ventures-access`
  - `GET /music`
  - `GET /travel`
  - `GET /partnerships`
  - `GET /insights`
  - `GET /insights/:slug`
  - `GET /trust`
  - `GET /contact`
  - `GET /privacy`
  - `GET /terms`
  - `GET /GOVERNANCE.md`
  - `GET /SECURITY.md`

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
3. Fill in real secrets and live bindings in the generated `.dev.vars` files and Wrangler configs.
4. Run tests with `npm test`.
5. Type-check with `npm run typecheck`.
6. Start a Worker locally with:
   - `npm run dev:website`
   - `npm run dev:entitlement`
   - `npm run dev:bookings`
7. Validate deployment packaging without pushing with:
   - `npm run deploy:dryrun:website`
   - `npm run deploy:dryrun:entitlement`
   - `npm run deploy:dryrun:bookings`

## Deployment and Automation
- [docs/flagship-site.md](docs/flagship-site.md)
- [docs/github-setup.md](docs/github-setup.md)
- [docs/github-settings-checklist.md](docs/github-settings-checklist.md)

## Trust and Governance
- [GOVERNANCE.md](GOVERNANCE.md)
- [SECURITY.md](SECURITY.md)

## Promotion Policy
Code and documentation in this repository remain experimental until they are deployed, verified, and promoted into a dedicated production repository or platform environment.
