# GitHub Settings Checklist

This checklist covers GitHub repository settings that are not writable from the current connected tool surface and therefore must be treated as explicit repository configuration dependencies.

## Repository
- Repository: `JayPVentures-LLC/jayventures-labs`
- Default branch: `main`

## Branch Protection for `main`
Required baseline:
- Require a pull request before merging.
- Require status checks to pass before merging.
- Required status check: `verify` plus any additional repository-required enforcement checks.
- Require conversation resolution before merging.
- Require verified signatures where supported by the selected merge path.
- Do not allow force pushes.
- Do not allow deletions.

### Review-gate availability invariant
Do **not** enable a mandatory approving-review gate unless at least one of the following is true and verified before the rule becomes active:
1. at least one independent write-capable reviewer, other than the expected PR author, is operationally available and can authenticate to review;
2. a governed automated reviewer is enabled and GitHub Actions is permitted to create/approve pull requests; or
3. an explicit founder/admin bypass is enabled for deadlock recovery while all required CI, signature, and audit gates remain intact.

A configuration that requires one approval while providing no operable approving identity and no approved bypass is a governance deadlock and must be rejected as `REVIEW_GATE_UNSATISFIABLE`.

For founder-operated repositories, keep the founder/admin bypass enabled unless and until an independently operable reviewer path has been verified end-to-end. Do not infer reviewer availability merely because a second account exists in the collaborator list.

## Deadlock Preflight
Before opening or enforcing a protected PR, verify:
- PR author identity;
- required approval count;
- at least one eligible reviewer distinct from the author;
- reviewer can actually authenticate and submit `APPROVE`;
- GitHub Actions approval setting if automation is relied upon;
- admin bypass state if bypass is the recovery route;
- required checks and signature requirements;
- auto-merge eligibility.

If any required reviewer path is not operational, fail before creating a merge-dependent workflow and route to the configured governed recovery path.

## GitHub Actions Approval Policy
If governed automated approval is used:
- Enable `Allow GitHub Actions to create and approve pull requests` in repository Actions settings.
- Restrict the workflow to explicitly governed branches and authors.
- Keep required CI/security/governance checks mandatory.
- Do not use automated approval as a substitute for an independent human review where policy specifically requires human review.

## GitHub Environments
### `cloudflare-production`
Use for governed Cloudflare deployment approvals.
Recommended environment secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### `hybrid-production`
Recommended environment secrets:
- `AZURE_KEY_VAULT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`
- `AZURE_ARCHIVE_TOKEN`

## Repository Secrets
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
- `STRIPE_SECRET_KEY` when administrative Stripe API calls are intentionally added to CI/deploy automation.

### Discord
- `DISCORD_BOT_TOKEN`

### Admin / Access
- `ADMIN_OVERRIDE_KEY`
- `MCP_UPSTREAM_BEARER_TOKEN`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET`

## Recommended Actions Policy
In `Settings > Actions > General`:
- Allow GitHub Actions.
- Allow local and GitHub-authored actions.
- Allow `actions/checkout` and `actions/setup-node`.
- Restrict default workflow permissions to read unless a specific workflow requires a narrower documented write permission.
- Enable GitHub Actions PR approval only when a governed automated-review path is intentionally active.

## Required Manual Cloudflare Input Before Deployment
Update these Wrangler files with real values before running deploy workflows:
- `apps/flagship-site/wrangler.toml`
- `operations/entitlement-system/wrangler.toml`
- `wix/bookings/wrangler.toml`

For the flagship site, only override the default membership and portal URLs when replacing the publish-safe internal routing with live checkout or gated destinations.

## Required GitHub Workflow Validation
1. Confirm reviewer/bypass availability before enforcing review requirements.
2. Push the branch and open the PR.
3. Confirm required checks pass.
4. Confirm the configured approval path actually produces an eligible `APPROVE` review or a governed bypass is available.
5. Enable auto-merge only after the above preflight is satisfiable.
6. Treat `REVIEW_GATE_UNSATISFIABLE` as a configuration defect, not a task for the founder to manually discover after work is complete.
