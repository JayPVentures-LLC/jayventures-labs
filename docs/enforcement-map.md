# JPV-OS Enforcement Map

## Automated Enforcement Gates

| Gate | Enforcement |
|---|---|
| Policy enforcement | scripts/jpv-policy-enforcement.cjs |
| CI validation | lint, typecheck, tests, build |
| Governance enforcement | npm run jpv:enforce |
| Deployment governance | deployment freeze enforcement |

## Human Review Gates

| Review | Requirement |
|---|---|
| CODEOWNER review | Required |
| Independent approval | Required |
| Security review | Required |
| People Protection review | Required |

## Failure Handling

If governance, security, or People Protection enforcement fails, deployment must stop until remediation is complete.

Bypassing enforcement is not an acceptable remediation path.
