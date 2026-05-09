# JPV-OS Enforcement Map

This document maps policy requirements to their enforcement mechanisms, ensuring that governance, security, and people-protection standards are operationally enforced rather than merely documented.

## Enforcement Principle

If governance is documented but not operationally enforced, governance is incomplete.

## Policy-to-Enforcement Mapping

### Governance Requirements

| Requirement | Enforcement Mechanism | Verification |
|-------------|----------------------|--------------|
| GOVERNANCE.md exists | `jpv-policy-enforcement.cjs` | CI check on PR and push |
| Governance references People Protection | `jpv-policy-enforcement.cjs` | Content validation |
| Risk tiers are defined | Manual review | Production review checklist |
| Audit trails are maintained | Operational logging | Audit review |
| Human oversight for critical decisions | Process documentation | Production review checklist |

### Security Requirements

| Requirement | Enforcement Mechanism | Verification |
|-------------|----------------------|--------------|
| SECURITY.md exists | `jpv-policy-enforcement.cjs` | CI check on PR and push |
| Security references People Protection | `jpv-policy-enforcement.cjs` | Content validation |
| No secrets in source | `.gitignore`, secret scanning | CI and GitHub settings |
| Webhook signature verification | Code review, CODEOWNERS | PR review |
| Admin route authentication | Code review, CODEOWNERS | PR review |
| Idempotency for external events | Code review, tests | PR review, CI tests |

### People Protection Requirements

| Requirement | Enforcement Mechanism | Verification |
|-------------|----------------------|--------------|
| PEOPLE-PROTECTION.md exists | `jpv-policy-enforcement.cjs` | CI check on PR and push |
| Philosophical foundation documented | `jpv-policy-enforcement.cjs` | Content validation |
| Prohibited uses defined | `jpv-policy-enforcement.cjs` | Content validation |
| Consent, notice, choice requirements | `jpv-policy-enforcement.cjs` | Content validation |
| AI authority limits documented | `jpv-policy-enforcement.cjs` | Content validation |
| Production gate language present | `jpv-policy-enforcement.cjs` | Regex validation |
| No weakening language | `jpv-policy-enforcement.cjs` | Forbidden pattern check |
| Minimum content depth | `jpv-policy-enforcement.cjs` | Character count validation |

### Repository Structure Requirements

| Requirement | Enforcement Mechanism | Verification |
|-------------|----------------------|--------------|
| CODEOWNERS exists | `jpv-policy-enforcement.cjs` | CI check |
| CODEOWNERS covers policy files | `jpv-policy-enforcement.cjs` | Content validation |
| CODEOWNERS covers workflows | `jpv-policy-enforcement.cjs` | Content validation |
| Policy enforcement workflow exists | `jpv-policy-enforcement.cjs` | File existence check |
| Production review checklist exists | `jpv-policy-enforcement.cjs` | File existence check |
| Policy index exists | `jpv-policy-enforcement.cjs` | File existence check |
| Enforcement map exists | `jpv-policy-enforcement.cjs` | File existence check |

## CI/CD Enforcement Workflows

### jpv-policy-enforcement.yml

**Triggers:** Pull requests, pushes to main/master

**Checks:**
- Required policy files exist
- Required content terms are present
- Forbidden weakening language is absent
- Production gate language is present
- Documentation depth is sufficient

### jpv-os-enforcement.yml

**Triggers:** Pull requests, pushes to main

**Checks:**
- Required workflow files exist
- Forbidden bypass patterns are absent
- Safety terms are present where required

## Branch Protection Enforcement

| Setting | Purpose |
|---------|---------|
| Require status checks | Ensures CI enforcement passes before merge |
| Require CODEOWNER review | Ensures policy changes are reviewed by owners |
| Require linear history | Maintains audit trail integrity |
| Restrict force pushes | Prevents audit trail tampering |

## Enforcement Escalation

When enforcement fails:

1. **CI Failure** — PR cannot be merged until enforcement passes
2. **CODEOWNER Review** — Policy changes require explicit approval
3. **Production Review** — Checklist must be completed before production deployment
4. **Audit Review** — Post-deployment verification of enforcement compliance

## Enforcement Gaps

If a policy requirement lacks an enforcement mechanism:

1. Document the gap in this enforcement map
2. Create an issue to implement enforcement
3. Add manual verification to the production review checklist
4. Update this map when enforcement is implemented

---

This enforcement map is maintained as part of JPV-OS governance requirements.
