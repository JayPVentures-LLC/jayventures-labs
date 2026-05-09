# JPV-OS Enforcement Map

This document maps enforcement points across the CI/CD pipeline and operational infrastructure.

## CI Enforcement Points

### Pull Request Triggers

| Check | Workflow | Script | Exit on Fail |
|-------|----------|--------|--------------|
| Policy Enforcement | `jpv-policy-enforcement.yml` | `scripts/jpv-policy-enforcement.cjs` | Yes |
| JPV-OS Enforcement | `jpv-os-enforcement.yml` | `npm run jpv:enforce` | Yes |
| Authority Check | `jpv-os-authority-check.yml` | `operations/jpv_os_enforcement/authority-check.ps1` | Yes |

### Push to Main Triggers

All above workflows plus:
- Brand enforcement
- Deployment gates (when applicable)

## Enforcement Categories

### 1. Revenue Authority Enforcement
**Location**: `authority-check.ps1`, `jpv_os.yaml`

Validates:
- TIN/SSN revenue channel separation
- No revenue mixing patterns in code
- Brand-specific revenue routing

### 2. Role Authority Enforcement
**Location**: `enforcement_engine.ts`, `jpv_os.yaml`

Validates:
- Brand voice constraints
- Authority level definitions (absolute/controlled/cultural)
- Cross-voice prohibition

### 3. Idea Authority Enforcement
**Location**: `jpv_os.yaml`, `authority-check.ps1`

Validates:
- System flow sequence
- No creator-to-enterprise bypass without validation
- Layer-specific routing

### 4. Governance Document Enforcement
**Location**: `jpv-policy-enforcement.cjs`

Validates:
- Required files exist
- Cross-references are intact
- Required terms are present
- Forbidden patterns are absent

### 5. Audit/Recovery Path Enforcement
**Location**: `authority-check.ps1`

Validates:
- `docs/production-review-checklist.md` exists
- `docs/policy-index.md` exists
- `docs/enforcement-map.md` exists
- Enforcement workflows exist

## Forbidden Patterns

Code scans reject patterns that attempt to:
- Bypass JPV-OS enforcement rules
- Skip enforcement checks
- Disable JPV enforcement via environment variables
- Circumvent revenue authority checks
- Skip TIN validation
- Ignore SSN separation rules

Document scans reject:
- "People Protection is optional"
- "bypass" language for protections
- "non-binding ethics statement"
- "aspirational only"

## Deployment Gates

Before production deployment:
1. All CI checks must pass
2. Production review checklist must be complete
3. CODEOWNERS approval required for policy files
4. Branch protection rules enforced

## Recovery Procedures

On enforcement failure:
1. Review violation details in CI logs
2. Fix violations in failing file(s)
3. Re-run enforcement checks
4. Document remediation if pattern indicates systemic issue

## Escalation Path

If enforcement blocks critical deployment:
1. Review GOVERNANCE.md for exception criteria
2. Document exception rationale
3. Require CODEOWNER approval for any bypass
4. Log exception in audit trail

---

*This enforcement map is itself enforced by CI. Changes require CODEOWNER review.*
