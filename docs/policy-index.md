# JPV-OS Policy Index

This index is the release-facing map for the policy documents that govern this repository. It does not replace the source policies; it points reviewers to the required authorities before code, automation, or documentation is treated as production-ready.

## Required Policy Layers

| Policy | Purpose | Required before production |
| --- | --- | --- |
| [`GOVERNANCE.md`](../GOVERNANCE.md) | Defines accountability, oversight, auditability, and operational decision controls. | Yes |
| [`SECURITY.md`](../SECURITY.md) | Defines vulnerability handling, secret boundaries, integration safety, and secure operations. | Yes |
| [`PEOPLE-PROTECTION.md`](../PEOPLE-PROTECTION.md) | Defines human dignity, informed consent, autonomy, accessibility, anti-exploitation, anti-discrimination, and AI/automation limits. | Yes |
| [`docs/production-review-checklist.md`](production-review-checklist.md) | Converts the policy layers into a pre-production review checklist. | Yes |
| [`docs/enforcement-map.md`](enforcement-map.md) | Maps policy requirements to automated and human enforcement points. | Yes |

## Review Standard

No system, workflow, automation, entitlement path, AI-assisted process, monetization surface, or deployment artifact may be described as production-ready unless governance, security, and People Protection review are complete.

Reviewers must confirm:

- the affected people and foreseeable harms are identified
- consent, notice, autonomy, accessibility, and appeal paths are meaningful
- automation does not remove accountable human ownership
- security controls protect both systems and the people affected by those systems
- deployment, rollback, logging, and evidence requirements are documented
- CI policy enforcement and CODEOWNER review are satisfied

## Source of Truth

When there is a conflict between a summary document and a root policy file, the root policy file controls. The required root policy files are `GOVERNANCE.md`, `SECURITY.md`, and `PEOPLE-PROTECTION.md`.
