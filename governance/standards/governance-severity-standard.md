# Governance Severity Standard

## PASS
Operationally compliant.

## WARN
Non-blocking governance observation requiring review.

## FAIL
Blocking governance violation.

## CRITICAL
Immediate remediation required before deployment or release.

## Rules
- Scheduled audits should not terminate on WARN.
- Production deploys terminate on FAIL or CRITICAL.
- Audit workflows must always upload artifacts.
