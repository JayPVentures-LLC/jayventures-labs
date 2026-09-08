# Security Secret Remediation

## Status

This repository had GitHub secret scanning alerts involving generated build output, dependency/vendor content, and binary artifacts.

Treat all detected values as compromised unless the relevant provider confirms they are public test fixtures with no operational use.

## Immediate external actions

These actions must happen outside Git:

1. Revoke exposed passwords, tokens, private keys, deploy keys, API keys, tunnel credentials, and service credentials.
2. Generate replacements through the owning provider.
3. Store replacements only in the owning provider or JPV-approved secret infrastructure, such as Cloudflare secrets, Azure Key Vault/managed identity, or local untracked development secrets where appropriate.
4. Confirm no production, staging, CI, tunnel, deployment, or webhook flow still depends on revoked material.
5. Mark GitHub secret scanning alerts as revoked only after replacement is complete.

## Repository remediation

Repository hygiene must prevent generated, vendor, binary, and secret-prone files from being tracked again.

Required safeguards:
- maintain an explicit `.gitignore`;
- run secret scanning through an approved JPV-native or external security runner;
- remove generated/vendor/binary artifacts from Git tracking where present;
- preserve remediation evidence and provider-level revocation receipts.

## History cleanup

If secrets are present in historical commits, use a dedicated maintenance window and run `git filter-repo` or BFG after provider-level revocation. History rewrite must be coordinated because it changes commit SHAs and affects all clones, forks, open PRs, and local branches.

Recommended sequence:
1. Revoke and replace all exposed credentials.
2. Pause merges.
3. Back up the repository.
4. Rewrite history to remove generated/vendor/binary artifacts and secret material.
5. Force-push cleaned refs through the governed recovery path.
6. Require collaborators to reclone or hard-reset.
7. Re-run secret scanning.
8. Close alerts only after verification.

## Prevention standard

Do not commit:
- `.next/`
- `node_modules/`
- binary tool downloads
- `.env` files
- private keys
- generated cache files
- provider credential exports

Secrets belong in provider secret stores or JPV-approved secret infrastructure, not repository files or GitHub workflow secret stores.
