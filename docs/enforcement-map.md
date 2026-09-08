# JPV-OS Enforcement Map

This map identifies how governance, security, and People Protection requirements are enforced before merge or deployment.

## Native Gates

| Gate | Enforcement point | Required evidence |
| --- | --- | --- |
| Policy presence | `scripts/jpv-policy-enforcement.cjs` runs as a JPV-native gate. | Required policy files, CODEOWNERS, native enforcement scripts, and production review docs exist. |
| Policy integrity | `scripts/jpv-policy-enforcement.cjs` checks required People Protection, governance, and security terms. | Root policy files preserve required production-readiness language. |
| Repository integrity | `scripts/jpv-enforce.mjs` rejects bypass patterns and rejects any reintroduced `.github/workflows` execution surface. | Native enforcement passes and the retired workflow surface is absent. |
| Code quality | Repository-native typecheck, tests, build, lint, security, and dependency analysis run through JPV verification where configured. | JPV-native verification receipts or documented remediation before release. |
| Deployment validation | Deployment dry runs and provider-direct config validators run for Cloudflare Worker and other serving surfaces. | Provider configs, bindings, release paths, and authoritative provider readback validate before promotion. |

## Human Review Gates

| Gate | Owner | Required review |
| --- | --- | --- |
| CODEOWNER review | `.github/CODEOWNERS` | Policy, governance, security, scripts, docs, and production-readiness changes require accountable review. |
| Production review | Release owner | `docs/production-review-checklist.md` must be completed before a system is promoted as production-ready. |
| People Protection review | Release owner and reviewer | Human impact, informed consent, autonomy, accessibility, exploitation risk, discriminatory automation, surveillance risk, and appeal paths must be reviewed. |
| Security review | Release owner and reviewer | Secret handling, authentication, webhook verification, admin access, audit logging, and least privilege must be reviewed. |

## Enforcement Boundaries

Native automation can block missing or weakened policy controls, but it does not replace accountable review. A passing native gate means the required policy surfaces are present and have not obviously been weakened. It does not mean production approval is complete.

Production approval still requires:

- documented review evidence
- identified owners
- rollback and remediation paths
- passing JPV-native verification
- completed People Protection, governance, and security review
- no unresolved critical risk to human dignity, user autonomy, accessibility, equal treatment, or safety

GitHub Actions and GitHub Issues are retired JPV surfaces. Their absence is compliant and must not be treated as missing verification.

## Failure Handling

If a native enforcement gate fails, the release must stop until the missing policy, review evidence, native verification evidence, or control is restored. Reintroducing a retired GitHub workflow or bypassing the native gate is not an acceptable remediation.
