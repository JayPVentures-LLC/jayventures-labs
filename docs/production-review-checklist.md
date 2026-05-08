# JPV-OS Production Review Checklist

This checklist must be completed before a system is promoted as production-ready.

## Required Policy Files

- [ ] `GOVERNANCE.md` exists.
- [ ] `SECURITY.md` exists.
- [ ] `PEOPLE-PROTECTION.md` exists.
- [ ] `.github/CODEOWNERS` exists.
- [ ] CI includes JPV-OS policy enforcement.

## People Protection Review

- [ ] The affected people are identified.
- [ ] Foreseeable harms are identified.
- [ ] Data collection is minimized.
- [ ] Consent, notice, and choice are clear.
- [ ] Material automated decisions have reason codes.
- [ ] Appeals, support, rollback, or remediation paths exist.
- [ ] Creator, worker, student, and vulnerable-user risks are reviewed.
- [ ] AI authority limits are documented.
- [ ] Administrator and emergency actions are logged.
- [ ] Monetization does not depend on coercion, deception, forced exclusivity, or dark patterns.

## Security Review

- [ ] No secrets are committed.
- [ ] Environment variables and platform secrets are configured outside source.
- [ ] Webhooks use signature verification.
- [ ] Admin routes require authentication.
- [ ] Idempotency exists for retryable external events.
- [ ] Sensitive state changes are logged.
- [ ] Least privilege is applied to external integrations.

## Governance Review

- [ ] Production owner is identified.
- [ ] Deployment path is documented.
- [ ] Rollback path is documented.
- [ ] Review evidence is recorded.
- [ ] Required CI checks pass.
- [ ] Branch protection requires required checks before merge.
- [ ] CODEOWNER review is required for policy and workflow changes.

## Production Decision

A system may not be promoted as production-ready unless governance, security, and people-protection review are complete.
