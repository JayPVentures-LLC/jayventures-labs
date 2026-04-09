# GitHub Setup

This repository is ready for CI and manual Cloudflare worker deployments once the required GitHub Actions secrets are configured.

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

### Admin
- `ADMIN_OVERRIDE_KEY`
- `MCP_UPSTREAM_BEARER_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

## Required Cloudflare Resource Values

Patch these placeholder values in the Wrangler files before using deployment workflows:

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
  - Verifies both Cloudflare workers package cleanly with dry-run deploys

- `deploy-workers.yml`
  - Manual workflow dispatch
  - Deploys one or both workers to Cloudflare
  - Requires valid Cloudflare secrets and real Wrangler bindings

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
