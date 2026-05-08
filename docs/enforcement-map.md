# JPV-OS Enforcement Map

This map identifies how governance, security, and People Protection requirements are enforced before merge or deployment.

## Automated Gates

| Gate | Enforcement point | Required evidence |
| --- | --- | --- |
| Policy presence | `.github/workflows/jpv-policy-enforcement.yml` runs `scripts/jpv-policy-enforcement.cjs`. | Required policy files, CODEOWNERS, workflow files, and production review docs exist. |
| Policy integrity | `scripts/jpv-policy-enforcement.cjs` checks required People Protection, governance, and security terms. | Root policy files preserve required production-readiness language. |
| Code quality | Repository CI runs typecheck, tests, build, and lint where configured. | Passing checks or documented remediation before release. |
| Deployment validation | Deployment dry runs and config validators run for Cloudflare Worker surfaces. | Worker configs, bindings, and release paths validate before promotion. |

## Human Review Gates

| Gate | Owner | Required review |
| --- | --- | --- |
| CODEOWNER review | `.github/CODEOWNERS` | Policy, workflow, governance, security, and production-readiness changes require accountable review. |
| Production review | Release owner | `docs/production-review-checklist.md` must be completed before a system is promoted as production-ready. |
| People Protection review | Release owner and reviewer | Human impact, informed consent, autonomy, accessibility, exploitation risk, discriminatory automation, surveillance risk, and appeal paths must be reviewed. |
| Security review | Release owner and reviewer | Secret handling, authentication, webhook verification, admin access, audit logging, and least privilege must be reviewed. |

## Enforcement Boundaries

Automation can block missing or weakened policy controls, but it does not replace accountable review. A passing automated gate means the required policy surfaces are present and have not obviously been weakened. It does not mean production approval is complete.

Production approval still requires:

- documented review evidence
- identified owners
- rollback and remediation paths
- passing CI
- completed People Protection, governance, and security review
- no unresolved critical risk to human dignity, user autonomy, accessibility, equal treatment, or safety

## Failure Handling

If an enforcement gate fails, the release must stop until the missing policy, workflow, review evidence, or control is restored. Bypassing the gate is not an acceptable remediation.
