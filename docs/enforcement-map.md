# JPV-OS Enforcement Map

This document maps the infrastructure controls that enforce JPV-OS governance, security, people-protection, and constitutional continuity requirements.

## Enforcement Layers

### Layer 1: Repository Protection

| Control | Enforcement | Doctrine Alignment |
|---------|-------------|-------------------|
| Branch protection on `main` | No direct push; PR required | No unilateral production mutation |
| Require approvals | At least 1 approval before merge | Independent review requirement |
| Dismiss stale approvals | New commits require re-approval | Continuous accountability |
| Require status checks | CI must pass before merge | Verified governance compliance |
| Require conversation resolution | Review concerns must be addressed | Concerns cannot be bypassed |
| No force push | History cannot be rewritten | Audit trail preservation |
| No branch deletion | Protected branches are persistent | Continuity of operations |

### Layer 2: Code Ownership

| Protected Path | Owner | Purpose |
|----------------|-------|---------|
| `/GOVERNANCE.md` | @JayPVentures-LLC | Governance integrity |
| `/SECURITY.md` | @JayPVentures-LLC | Security policy ownership |
| `/PEOPLE-PROTECTION.md` | @JayPVentures-LLC | People-protection oversight |
| `/.github/CODEOWNERS` | @JayPVentures-LLC | Ownership definition control |
| `/.github/workflows/` | @JayPVentures-LLC | Workflow enforcement |
| `/scripts/` | @JayPVentures-LLC | Enforcement script ownership |
| `/docs/` | @JayPVentures-LLC | Documentation governance |
| `/operations/entitlement-system/` | @JayPVentures-LLC | Production system ownership |

### Layer 3: CI Enforcement

| Workflow | Trigger | Enforces |
|----------|---------|----------|
| `jpv-policy-enforcement.yml` | PR, push to main | Policy file presence, content requirements |
| `ci.yml` | PR, push | Build, test, lint verification |
| `enforce-brand.yml` | PR, push | Brand voice and language compliance |
| `jpv-os-enforcement.yml` | PR, push | JPV-OS spec compliance |

### Layer 4: Policy Verification

The `jpv-policy-enforcement.cjs` script verifies:

| Check | Enforcement |
|-------|-------------|
| Required files exist | GOVERNANCE.md, SECURITY.md, PEOPLE-PROTECTION.md, CODEOWNERS |
| Policy content requirements | Required terms and sections |
| No weakening language | Prohibited patterns that dilute protections |
| Minimum policy depth | Document length thresholds |
| Cross-reference integrity | Policy documents reference each other |
| Operational documentation | production-review-checklist.md, policy-index.md, enforcement-map.md |

### Layer 5: Production Gates

| Gate | Control |
|------|---------|
| Environment protection | `cloudflare-production` requires reviewers |
| Deployment validation | `validate:deploy:*` scripts verify config |
| Manual approval | Production deploys may require explicit approval |
| Deployment freeze | Freeze governance during critical periods |

## Constitutional Continuity Mapping

| Constitutional Principle | Infrastructure Control |
|--------------------------|----------------------|
| **Succession** | CODEOWNER hierarchy, fallback reviewers |
| **Incapacity Review** | Required independent approval, stale approval dismissal |
| **Congressional Confirmation** | Branch protection, required status checks |
| **Constitutional Limits** | Force-push prevention, deletion prevention, admin enforcement |
| **Continuity of Government** | Deployment freeze governance, rollback paths, audit logging |

## Enforcement Status

### Active Enforcements

- [x] Branch protection requiring PR
- [x] Required approval before merge
- [x] Required status checks
- [x] CODEOWNER review for policy files
- [x] CI policy enforcement workflow
- [x] Policy content verification
- [x] Forbidden pattern detection
- [x] Cross-reference integrity

### Configuration Requirements

These must be configured in GitHub repository settings:

- [ ] Branch protection rule for `main` with all settings
- [ ] Environment protection for `cloudflare-production`
- [ ] Repository secrets properly scoped
- [ ] Dependabot enabled
- [ ] Secret scanning enabled

See [`docs/github-settings-checklist.md`](/docs/github-settings-checklist.md) for complete configuration requirements.

## Verification

Run the policy enforcement script locally:

```sh
node scripts/jpv-policy-enforcement.cjs
```

If enforcement passes, the output is:

```
JPV-OS policy enforcement passed.
```

If enforcement fails, the output lists all violations that must be addressed before merge.

## Enforcement Failure Response

When enforcement fails:

1. Read the failure output to identify violations
2. Address each violation in the relevant policy file
3. Re-run enforcement verification
4. Continue until all checks pass
5. Submit PR for review

Do not bypass enforcement failures by removing checks.

---

*This enforcement map is reviewed and updated whenever enforcement controls are added, removed, or modified.*
