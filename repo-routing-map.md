# Repository Routing Map

## Execution Boundary

- Primary repository: `JayPVentures-LLC/jayventures-labs`
- Scope: governance, labs, non-production support systems, and controlled production workflows declared in `/home/runner/work/jayventures-labs/jayventures-labs/deployment-registry.json`
- JPV Nexus production source of truth: `jaypVLabs/JPV-OS`
- Rule: production Nexus deploy routing from this repository is denied.

## Intent Normalization Routing

All commands require registry-backed resolution from `/home/runner/work/jayventures-labs/jayventures-labs/deployment-registry.json` and intent contract checks from `/home/runner/work/jayventures-labs/jayventures-labs/governance/jpv-os/intent-normalization-contract.json`.

| Intent command | Resolved action | Repository | Branch | Workflow | Approval gate |
|---|---|---|---|---|---|
| Deploy Nexus | Route to Nexus production deploy | `jaypVLabs/JPV-OS` | `main` | managed externally | Required |
| Fix it | Open blocker remediation workflow for active context | registry selected | policy-selected | `ci.yml` + domain-specific workflow | Required if production-affecting |
| Do it | Execute approved pending task | current context | current context | policy-selected workflow | Required |
| Next | Select highest-priority blocked item | current context | current context | none (planning action) | Not required |
| Check it | Validate health checks + readiness gates | registry selected | current context | `ci.yml` | Not required |
| Release | Trigger release workflow for resolved target | registry selected | release branch or `main` | deploy workflow | Required |
| Approve | Execute approved queue batch | context-backed | context-backed | queue executor | Required |
| Merge | Merge validated branch | context-backed | protected branch | GitHub merge controls | Required |
| Validate | Run validation matrix + public readiness gate | context-backed | current context | `ci.yml` | Not required |
| Rollback | Roll back to recorded rollback target | registry selected | protected branch | deploy workflow | Required |
| Summarize | Generate executive replay | context-backed | N/A | reporting pipeline | Not required |
| show money blockers | List revenue-impacting blockers | context-backed | N/A | revenue analysis workflow | Not required |
| protect revenue | Prioritize actions preventing revenue risk | context-backed | N/A | revenue protection workflow | Required |
| publish offer | Publish approved offer stack | context-backed | release branch | offer publish workflow | Required |
| check checkout | Validate checkout + entitlement linkage | context-backed | current context | checkout validation workflow | Not required |
| show unpaid opportunities | Surface leads/opportunities lacking monetization routing | context-backed | N/A | opportunity report workflow | Not required |

## Safety and Governance Requirements

- Public release requires passing `/home/runner/work/jayventures-labs/jayventures-labs/governance/jpv-os/public-readiness-gate.json` checks.
- Operator safety events can automatically activate recovery mode via `/home/runner/work/jayventures-labs/jayventures-labs/governance/jpv-os/operator-safety-policy.json`.
- Decision and friction automation rules are enforced through `/home/runner/work/jayventures-labs/jayventures-labs/governance/jpv-os/decision-and-friction-policy.json`.
