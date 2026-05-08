# JPV-OS Policy Index

This index lists all active governance, security, and people-protection policies in this repository.

## Core Policy Files

| File | Purpose |
|------|---------|
| [`GOVERNANCE.md`](../GOVERNANCE.md) | Organizational governance, decision authority, and stewardship framework |
| [`SECURITY.md`](../SECURITY.md) | Security posture, vulnerability reporting, and incident response |
| [`PEOPLE-PROTECTION.md`](../PEOPLE-PROTECTION.md) | People protection doctrine, enforcement requirements, and production gate |

## Operational Policy Files

| File | Purpose |
|------|---------|
| [`docs/production-review-checklist.md`](production-review-checklist.md) | Checklist required before promoting any system to production |
| [`docs/enforcement-map.md`](enforcement-map.md) | Maps each enforcement gate to the policy it satisfies |

## CI Enforcement

| Workflow | Policy Enforced |
|---------|----------------|
| `.github/workflows/jpv-policy-enforcement.yml` | Verifies governance, security, and people-protection integrity |
| `.github/workflows/jpv-os-enforcement.yml` | Runs JPV-OS enforcement scan for forbidden patterns |
| `.github/workflows/enforce-brand.yml` | Enforces brand safety and anti-exploitation terms |
| `.github/workflows/ci.yml` | Validates Discord brand mapping and runs test suite |

## Policy Precedence

People protection is a hard gate. No system is production-ready if it protects infrastructure while leaving people exposed. Governance and security policies operate within the boundary set by people-protection requirements.
