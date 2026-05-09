# JPV-OS Policy Index

This document provides a centralized index of all JPV-OS governance, security, and people-protection policies.

## Core Policy Files

| Policy | Location | Purpose |
|--------|----------|---------|
| Governance | [`GOVERNANCE.md`](/GOVERNANCE.md) | Decision integrity, adaptive oversight, systemic accountability |
| Security | [`SECURITY.md`](/SECURITY.md) | System protection, vulnerability handling, hardening requirements |
| People Protection | [`PEOPLE-PROTECTION.md`](/PEOPLE-PROTECTION.md) | Human dignity, consent, anti-exploitation, accessibility |

## Doctrine Documents

| Doctrine | Location | Purpose |
|----------|----------|---------|
| Constitutional Continuity | [`docs/doctrine/constitutional-continuity.md`](/docs/doctrine/constitutional-continuity.md) | 25th Amendment alignment, reviewable authority, continuity of operations |

## Operational Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Enforcement Map | [`docs/enforcement-map.md`](/docs/enforcement-map.md) | Infrastructure enforcement controls |
| Production Review Checklist | [`docs/production-review-checklist.md`](/docs/production-review-checklist.md) | Pre-production verification requirements |
| GitHub Settings Checklist | [`docs/github-settings-checklist.md`](/docs/github-settings-checklist.md) | Repository configuration requirements |

## Repository Governance Files

| File | Location | Purpose |
|------|----------|---------|
| CODEOWNERS | [`.github/CODEOWNERS`](/.github/CODEOWNERS) | Review ownership for protected files |
| Policy Enforcement Workflow | [`.github/workflows/jpv-policy-enforcement.yml`](/.github/workflows/jpv-policy-enforcement.yml) | CI enforcement of policy requirements |
| Policy Enforcement Script | [`scripts/jpv-policy-enforcement.cjs`](/scripts/jpv-policy-enforcement.cjs) | Policy verification logic |

## Policy Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                   Constitutional Continuity                  │
│            (Authority, Accountability, Continuity)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ GOVERNANCE  │     │  SECURITY   │     │ PEOPLE-PROTECTION│
│             │     │             │     │                  │
│ Decision    │     │ System      │     │ Human dignity    │
│ integrity   │     │ protection  │     │ and consent      │
└─────────────┘     └─────────────┘     └─────────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  PRODUCTION GATE    │
                │                     │
                │ All three required  │
                │ for production      │
                └─────────────────────┘
```

## Quick Reference

### Production Readiness

A system is production-ready only when:

1. `GOVERNANCE.md` requirements are satisfied
2. `SECURITY.md` requirements are satisfied
3. `PEOPLE-PROTECTION.md` requirements are satisfied
4. Constitutional continuity principles are enforced
5. CI policy enforcement passes
6. Production review checklist is complete

### Policy Updates

Policy changes require:

- CODEOWNER review
- CI verification
- Documentation update
- Enforcement verification

### Enforcement Verification

All policies are enforced through:

- Branch protection
- Required status checks
- CODEOWNER review requirements
- CI workflows
- Production review gates

---

*This index is maintained alongside policy documents and updated when policies are added, removed, or restructured.*
