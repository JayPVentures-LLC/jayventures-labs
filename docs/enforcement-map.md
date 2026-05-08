# JPV-OS Enforcement Map

This document maps each enforcement gate to the policy requirement it satisfies.

## CI Enforcement Gates

| Gate | Workflow Step | Policy Requirement |
|------|--------------|-------------------|
| Policy file existence | `jpv-policy-enforcement.yml` → `node scripts/jpv-policy-enforcement.cjs` | `GOVERNANCE.md`, `SECURITY.md`, `PEOPLE-PROTECTION.md`, `.github/CODEOWNERS` must exist |
| People protection content | `jpv-policy-enforcement.yml` | `PEOPLE-PROTECTION.md` must include required doctrine sections and meet minimum length |
| Forbidden weakening language | `jpv-policy-enforcement.yml` | `PEOPLE-PROTECTION.md` must not contain patterns that weaken protection guarantees |
| Governance cross-references | `jpv-policy-enforcement.yml` | `README.md` and `GOVERNANCE.md` must reference `PEOPLE-PROTECTION.md` |
| Security cross-references | `jpv-policy-enforcement.yml` | `SECURITY.md` must reference people protection, human exploitation, discriminatory automation, and unauthorized surveillance |
| CODEOWNERS protection | `jpv-policy-enforcement.yml` | `.github/CODEOWNERS` must protect policy and workflow files |
| JPV-OS patterns | `jpv-os-enforcement.yml` → `npm run jpv:enforce` | No `bypass_jpv_os`, `skip_enforcement`, or `DISABLE_JPV_ENFORCEMENT` patterns allowed |
| Required workflow file | `jpv-os-enforcement.yml` | `.github/workflows/jpv-os-enforcement.yml` must exist |
| Brand safety | `enforce-brand.yml` | All source files must pass brand enforcement for `jaypventures_llc` context |
| Discord brand mapping | `ci.yml` → `npm run validate:discord-brand-map` | `jaypventures` maps to creator guild; `jaypventuresllc` maps to labs/institutional guild |
| Tests | `ci.yml` → `npm test` | All unit tests must pass |
| TypeScript | `ci.yml` → `npm run typecheck` | TypeScript must compile without errors |

## Deployment Enforcement Gates

| Gate | Workflow Step | Policy Requirement |
|------|--------------|-------------------|
| Deploy config validation | `deploy-production.yml` → `npm run validate:deploy:*` | Wrangler configs must have no placeholder values |
| Cloudflare secrets | `deploy-production.yml` | Required Discord, Stripe, and admin secrets must be configured in the target environment |
| KV namespace placeholder | `deploy-production.yml` | `YOUR_KV_NAMESPACE_ID` placeholder must be resolved before deploy |

## Enforcement Hierarchy

1. **People Protection** — hard gate, no bypass permitted
2. **Security** — required before any production deployment
3. **Governance** — required for policy and workflow changes
4. **Brand and Encoding** — required for all code and documentation changes
5. **Functional** — tests and typecheck required for all code changes
