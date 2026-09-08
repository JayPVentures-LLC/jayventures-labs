# JPV-OS Enforcement Map

This map identifies how governance, security, and People Protection requirements are enforced before merge or deployment.

## Automated Gates

| Gate | Enforcement point | Required evidence |
| --- | --- | --- |
| Repository execution surface | `scripts/jpv-enforce.mjs` rejects `.github/workflows`. | The repository remains free of GitHub Actions workflows. |
| Policy presence | `scripts/jpv-policy-enforcement.cjs` validates required governance, security, People Protection, CODEOWNERS, and production-review artifacts. | Required policy files and production review docs exist. |
| Policy integrity | `scripts/jpv-policy-enforcement.cjs` checks required People Protection, governance, and security terms. | Root policy files preserve required production-readiness language. |
| Code quality | JPV-native execution runs typecheck, tests, build, lint, and security analysis as applicable. | Passing results or documented remediation before release. |
| Deployment validation | Deployment dry runs and config validators run through the JPV execution plane for deployable surfaces. | Runtime configs, bindings, and release paths validate before promotion. |

## Human Review Gates

| Gate | Owner | Required review |
| --- | --- | --- |
| CODEOWNER review | `.github/CODEOWNERS` | Policy, governance, security, and production-readiness changes require accountable review. |
| Production review | Release owner | `docs/production-review-checklist.md` must be completed before a system is promoted as production-ready. |
| People Protection review | Release owner and reviewer | Human impact, informed consent, autonomy, accessibility, exploitation risk, discriminatory automation, surveillance risk, and appeal paths must be reviewed. |
| Security review | Release owner and reviewer | Secret handling, authentication, webhook verification, admin access, audit logging, and least privilege must be reviewed. |

## Enforcement Boundaries

Automation can block missing or weakened policy safeguards, but it does not replace accountable review. A passing automated gate means the required policy surfaces are present and have not obviously been weakened. It does not mean production approval is complete.

Production approval still requires documented review evidence, identified owners, rollback and remediation paths, passing JPV-native validation, completed People Protection/governance/security review, and no unresolved critical risk to human dignity, user autonomy, accessibility, equal treatment, or safety.

## Failure Handling

If an enforcement gate fails, the release must stop until the missing policy, review evidence, or safeguard is restored. Reintroducing GitHub Actions or bypassing the JPV execution plane is not an acceptable remediation.
