# Branch Protection Configuration

This repository is configured with branch protection rules to ensure code quality and security.

## Protected Branches

### `main` Branch

The `main` branch has the following protections enabled:

| Rule | Setting |
|------|---------|
| Require pull request | ✅ Yes |
| Required approvals | 1 |
| Dismiss stale reviews | ✅ Yes |
| Require code owner review | ✅ Yes |
| Require status checks | ✅ Yes |
| Require up-to-date branches | ✅ Yes |
| Required checks | `verify` |
| Require conversation resolution | ✅ Yes |
| Allow force pushes | ❌ No |
| Allow deletions | ❌ No |

## Required Status Checks

The `verify` job in `.github/workflows/ci.yml` must pass before merging. This includes:

- `npm test` - Unit tests via Vitest
- `npm run typecheck` - TypeScript type checking
- `deploy:dryrun:website` - Flagship site packaging validation
- `deploy:dryrun:entitlement` - Entitlement worker packaging validation
- `deploy:dryrun:bookings` - Bookings worker packaging validation

## Configuring Branch Protection

Branch protection can be configured in two ways:

### 1. Via GitHub UI (Recommended for initial setup)

Navigate to **Settings → Branches → Add branch protection rule** and configure:

1. Branch name pattern: `main`
2. Enable "Require a pull request before merging"
3. Set required approvals to 1
4. Enable "Dismiss stale pull request approvals"
5. Enable "Require review from Code Owners"
6. Enable "Require status checks to pass"
7. Add `verify` to required status checks
8. Enable "Require conversation resolution"
9. Disable force pushes and deletions

### 2. Via Workflow (Automated)

Run the `branch-protection.yml` workflow manually from Actions tab. This requires the `GITHUB_TOKEN` to have admin repository permissions.

## Code Owners

See `.github/CODEOWNERS` for the list of code owners who must review changes to specific paths.

## Dependabot

Dependabot is configured to:

- Update npm dependencies weekly (root and `/operations/jpv_os_enforcement`)
- Update GitHub Actions weekly
- Group minor/patch dev dependency updates
- Label PRs with `dependencies` and ecosystem-specific labels
