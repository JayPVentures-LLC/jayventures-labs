# GitHub Setup

This repository is ready for CI and manual Cloudflare deployments once the required GitHub Actions secrets are configured.

## Required Repository Secrets

### Cloudflare
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Azure
- `AZURE_KEY_VAULT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`
- `AZURE_ARCHIVE_TOKEN`

### Stripe
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` if administrative Stripe API calls are added later

### Discord
- `DISCORD_BOT_TOKEN`

### Admin / Access
- `ADMIN_OVERRIDE_KEY`
- `MCP_UPSTREAM_BEARER_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

## Required Cloudflare Resource Values

Patch these placeholder values in the Wrangler files before using deployment workflows:

### apps/flagship-site/wrangler.toml
- `SITE_ORIGIN` if deploying to a non-production hostname
- `MICROSOFT_BOOKINGS_URL` if the consultation calendar changes
- Optional overrides for `STRIPE_ALL_VENTURES_*` and `*_PORTAL_URL` only when live checkout and gated destinations are ready

### operations/entitlement-system/wrangler.toml
- `ENTITLEMENT_KV`
- `IDEMPOTENCY_KV`
- `RETRY_QUEUE_KV`
- `WORKER_EVENTS_QUEUE`

### wix/bookings/wrangler.toml
- `IDEMPOTENCY_KV`
- `METRICS_KV`
- `CREATOR_DATA_KV`
- `INNER_CIRCLE_MEMBER_KV`
- `WORKER_EVENTS_QUEUE`

## GitHub Actions Workflows

- `ci.yml`
  - Runs on push and pull request
  - Installs dependencies
  - Runs tests and typecheck
  - Verifies the flagship site and both Cloudflare workers package cleanly with dry-run deploys

- `deploy-workers.yml`
  - Manual workflow dispatch
  - Uses the `cloudflare-production` GitHub environment
  - Validates Wrangler configs before deploying
  - Deploys one or both Workers to Cloudflare
  - Requires valid Cloudflare secrets and real Wrangler bindings

- `deploy-website.yml`
  - Manual workflow dispatch
  - Uses the `cloudflare-production` GitHub environment
  - Validates the flagship site Wrangler config before deploying
  - Deploys the public flagship site to Cloudflare
  - Works with the internal routing defaults in `apps/flagship-site/wrangler.toml`, but production secrets and Cloudflare access still need to be configured

## Recommended Branch Protection

Protect the default branch with:
- required status check: `verify`
- pull request review required
- dismiss stale approvals on new commits
- block force pushes

## GitHub App / Integrations

Repository remote currently points to:
- `https://github.com/jaypventuresllc/jayventures-labs.git`

If you want automated release or issue triage later, add GitHub environments and environment-scoped secrets after the first successful deployment.
