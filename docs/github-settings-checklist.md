# GitHub Settings Checklist

This checklist covers repository settings that must remain aligned with JPV governance. GitHub is the source/review/security-results surface; it is not the JPV execution plane.

## Repository
- Repository: `JayPVentures-LLC/jayventures-labs`
- Default branch: `main`

## Required Execution Settings
- GitHub Actions: disabled for the repository.
- `.github/workflows`: absent.
- CodeQL default setup: disabled because it executes through GitHub Actions.
- External/JVP-native CodeQL or equivalent scanning: permitted, with SARIF/results uploaded to GitHub when useful.
- GitHub workflow secrets/environments: not production dependencies.

## Branch Protection for `main`
Required baseline:
- Require a pull request before merging.
- Require conversation resolution before merging where appropriate.
- Require verified signatures where supported by the selected merge path.
- Do not allow force pushes.
- Do not allow deletions.
- Require only status checks that have a verified non-Actions producer.

### Review-gate availability invariant
Do not enable a mandatory approving-review gate unless an independent write-capable reviewer can actually authenticate and approve, or a documented founder/admin recovery path is available without weakening required security and audit safeguards.

A configuration that requires approval while providing no operable approving identity and no approved recovery path is a governance deadlock and must be rejected as `REVIEW_GATE_UNSATISFIABLE`.

Do not use automated GitHub workflow approval as a recovery path.

## Deadlock Preflight
Before enforcing a protected PR, verify:
- PR author identity;
- required approval count;
- at least one eligible reviewer distinct from the author when independent review is required;
- reviewer can actually authenticate and submit `APPROVE`;
- admin/founder recovery state where policy permits it;
- required checks have real non-Actions producers;
- signature requirements;
- merge eligibility.

If any required path is not operational, fail before creating a merge-dependent workflow and route through the configured JPV recovery mechanism.

## Secret Infrastructure
Production credentials belong in the owning provider or JPV-approved secret infrastructure.

Cloudflare examples:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Azure examples:
- `AZURE_KEY_VAULT_URL`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`
- `AZURE_ARCHIVE_TOKEN`

Stripe/Discord/access credentials follow the same rule: inject them into the execution environment only when needed; do not make GitHub workflow secrets the canonical store.

## Verification
1. Confirm `.github/workflows` is absent.
2. Confirm repository Actions are disabled.
3. Confirm CodeQL default setup is not configured.
4. Confirm required status checks have a verified non-Actions producer.
5. Confirm reviewer/bypass availability before enforcing review requirements.
6. Confirm external/JVP-native validation and security scanning can execute and produce readback.
7. Treat any drift from these conditions as an infrastructure defect, not a manual founder task.
