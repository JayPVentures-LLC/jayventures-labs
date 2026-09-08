# GitHub Repository Setup

GitHub is the repository, review, and security-results surface for `JayPVentures-LLC/jayventures-labs`. It is not the JPV execution or deployment plane.

## Repository Invariants

- `.github/workflows` must not exist.
- GitHub Actions must not be used for CI, deployment, governance enforcement, approval, or verification.
- Repository checks must not depend on GitHub-hosted workflow execution.
- Production secrets must live in the owning provider or JPV-approved secret infrastructure, not GitHub workflow secrets or GitHub environments.
- JPV-native execution must produce terminal verification and provider/canonical readback before a release is called operational.

## Code Scanning

GitHub CodeQL default setup is not compatible with the JPV no-Actions invariant because default setup executes CodeQL through GitHub Actions. Default setup must therefore remain disabled for this repository.

CodeQL may still be used through the CodeQL CLI on an approved external or JPV-native runner. SARIF results may be uploaded to GitHub code scanning after analysis so GitHub remains a results surface without becoming the execution plane.

## Provider Credentials

### Cloudflare
Store Cloudflare credentials in Cloudflare or JPV-approved secret infrastructure and inject them only into the execution environment that needs them:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Azure
Azure values belong in Azure Key Vault, managed identity, or JPV-approved secret infrastructure. Runtime Worker secrets are set through Wrangler or the owning provider as applicable:
- `AZURE_KEY_VAULT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`
- `AZURE_ARCHIVE_TOKEN`

### Stripe
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` only where an administrative Stripe integration explicitly requires it

### Discord
- `DISCORD_BOT_TOKEN`

### Admin / Access
- `ADMIN_OVERRIDE_KEY`
- `MCP_UPSTREAM_BEARER_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

## Required Cloudflare Resource Values

The Wrangler files must contain valid provider bindings before production promotion:
- `apps/flagship-site/wrangler.toml`
- `operations/entitlement-system/wrangler.toml`
- `wix/bookings/wrangler.toml`

Deployment validation is performed through the JPV execution plane with provider readback after mutation.

## Branch Protection

Protect the default branch with:
- pull requests required for changes
- accountable review where an operable independent reviewer route exists
- conversation resolution where applicable
- signed commits where required
- no force pushes
- no branch deletion
- only status checks that have a real non-Actions producer

Do not require a check whose only implementation path is a deleted or prohibited GitHub workflow.

## Repository Integrations

Any integration added later must be provider-neutral or explicitly subordinate to JPV governance. Integration availability must not create a mandatory founder fallback or a deployment deadlock.
