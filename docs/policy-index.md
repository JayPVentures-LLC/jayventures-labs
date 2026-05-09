# JPV-OS Policy Index

This index provides a reference to all governance, security, and people-protection policies enforced by JPV-OS.

## Core Policy Documents

| Document | Purpose | Location |
|----------|---------|----------|
| GOVERNANCE.md | Defines governance-by-design principles, risk tiers, auditability, human oversight, and enforcement standards | `/GOVERNANCE.md` |
| SECURITY.md | Defines security requirements, vulnerability handling, and operational security standards | `/SECURITY.md` |
| PEOPLE-PROTECTION.md | Defines human-safety, dignity, autonomy, consent, anti-exploitation, and anti-discrimination requirements | `/PEOPLE-PROTECTION.md` |

## Enforcement Documents

| Document | Purpose | Location |
|----------|---------|----------|
| Production Review Checklist | Pre-production verification checklist for governance, security, and people protection | `/docs/production-review-checklist.md` |
| Enforcement Map | Maps enforcement mechanisms to policy requirements | `/docs/enforcement-map.md` |
| CODEOWNERS | Defines required reviewers for policy and workflow changes | `/.github/CODEOWNERS` |

## CI/CD Enforcement Workflows

| Workflow | Purpose | Location |
|----------|---------|----------|
| jpv-policy-enforcement.yml | Verifies governance, security, and people protection requirements | `/.github/workflows/jpv-policy-enforcement.yml` |
| jpv-os-enforcement.yml | Runs JPV-OS enforcement checks | `/.github/workflows/jpv-os-enforcement.yml` |

## Policy Hierarchy

1. **People Protection** — Human dignity, autonomy, consent, and anti-exploitation requirements override all other considerations.
2. **Governance** — Decision integrity, accountability, and auditability requirements.
3. **Security** — System protection, vulnerability handling, and operational security.

No system may be considered production-ready unless all three policy layers are satisfied.

## Policy Enforcement Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| jpv-policy-enforcement.cjs | Validates governance, security, and people protection files | `/scripts/jpv-policy-enforcement.cjs` |
| jpv-enforce.mjs | Runs JPV-OS enforcement checks | `/scripts/jpv-enforce.mjs` |

## Related Documentation

- [Architecture Overview](/docs/architecture.md)
- [GitHub Setup Guide](/docs/github-setup.md)
- [GitHub Settings Checklist](/docs/github-settings-checklist.md)

---

This index is maintained as part of JPV-OS governance requirements.
