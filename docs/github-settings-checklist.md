# GitHub Settings Checklist

This checklist covers the GitHub repository settings that still must be configured manually because they are not writable from the current tool access.

## Repository
- Repository: `jaypventuresllc/jayventures-labs`
- Default branch: `main`

## Branch Protection for `main`
Create a branch protection rule for `main` with these settings:
- Require a pull request before merging
- Require approvals: at least `1`
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Required status check: `verify`
- Require conversation resolution before merging
- Do not allow force pushes
- Do not allow deletions

If you are the only maintainer and need fast iteration, keep admin bypass enabled. If this becomes team-operated, disable bypass and require the same rule for admins.

## GitHub Environments
Create these environments:

### `cloudflare-production`\nUse for manual worker deployment workflow approvals.\nRecommended settings:\n- Required reviewers: you or the operator group\n- Wait timer: optional\n- Deployment workflow now runs a validation script and will fail if Wrangler files still contain placeholder values\n- Environment secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### `hybrid-production`
Use if you later want Azure-bound deploy or archive approval separation.
Recommended environment secrets:
- `AZURE_KEY_VAULT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`
- `AZURE_ARCHIVE_TOKEN`

## Repository Secrets
Set these in `Settings > Secrets and variables > Actions`.

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
- `STRIPE_SECRET_KEY` if you later add administrative Stripe API calls in CI or deploy automation

### Discord
- `DISCORD_BOT_TOKEN`

### Admin / Access
- `ADMIN_OVERRIDE_KEY`
- `MCP_UPSTREAM_BEARER_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

## Recommended Actions Policy
In `Settings > Actions > General`:
- Allow GitHub Actions
- Allow local and GitHub-authored actions
- Allow `actions/checkout` and `actions/setup-node`
- Restrict workflow permissions to `Read repository contents` by default
- Enable `Allow GitHub Actions to create and approve pull requests` only if you later add release automation that needs it

## Required Manual Cloudflare Input Before Deployment
Update both Wrangler files with real values before running deploy workflows:
- [operations/entitlement-system/wrangler.toml](/c:/dev/jayventures-labs/operations/entitlement-system/wrangler.toml)
- [wix/bookings/wrangler.toml](/c:/dev/jayventures-labs/wix/bookings/wrangler.toml)

## Recommended First GitHub Workflow Validation
1. Push current branch.
2. Open a pull request.
3. Confirm the `verify` workflow passes.
4. Configure branch protection to require `verify`.
5. Add repository secrets.
6. Run `deploy-workers` manually after Wrangler bindings are real.

