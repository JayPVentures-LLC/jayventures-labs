# JPV-OS Policy Index

This document indexes all policy files and their enforcement locations within the JPV-OS governance framework.

## Core Policy Documents

| Policy | Location | Purpose |
|--------|----------|---------|
| Governance | `GOVERNANCE.md` | Decision integrity, accountability, human oversight |
| Security | `SECURITY.md` | System protection, vulnerability management |
| People Protection | `PEOPLE-PROTECTION.md` | Human dignity, autonomy, anti-exploitation |

## Enforcement Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| JPV-OS Spec | `operations/jpv_os_enforcement/jpv_os.yaml` | Brand authority, voice constraints, system flow |
| CODEOWNERS | `.github/CODEOWNERS` | Review requirements for policy files |
| Production Checklist | `docs/production-review-checklist.md` | Pre-production validation |
| Enforcement Map | `docs/enforcement-map.md` | CI/CD enforcement locations |

## CI Workflows

| Workflow | Location | Trigger |
|----------|----------|---------|
| JPV-OS Enforcement | `.github/workflows/jpv-os-enforcement.yml` | Push/PR to main |
| Policy Enforcement | `.github/workflows/jpv-policy-enforcement.yml` | Push/PR to main |
| Authority Check | `.github/workflows/jpv-os-authority-check.yml` | Push/PR to main |

## Authority Hierarchy

### Revenue Authority
- **TIN (Enterprise)**: `jaypventures_llc` - Absolute authority, enterprise revenue
- **SSN (Creator/Labs)**: `jaypventures`, `jaypv_labs` - Cultural/controlled authority

### Role Authority
- **Absolute**: Enterprise governance, infrastructure, monetization
- **Controlled**: Validation, testing, R&D
- **Cultural**: Content creation, community, attention

### Idea Authority
System flow sequence: `jaypventures` → `jaypv_labs` → `jaypventures_llc`

Rule: No direct creator-to-enterprise without validation.

## Review Requirements

Policy changes require:
1. CODEOWNERS approval
2. CI enforcement pass
3. Production checklist completion
4. Audit log entry

---

*This index is enforced by CI and must remain current with policy changes.*
