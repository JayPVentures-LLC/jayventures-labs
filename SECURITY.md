# Security Policy

## Scope

This repository contains experimental worker code, website drafts, automation assets, governance enforcement workflows, and internal operating documentation for JayPVentures LLC.

It is not a production system by default, but security expectations still apply to all code, workflows, integrations, automation, and operational documentation stored here.

Security in JPV-OS includes both technical hardening and protection against harmful operational outcomes.

## Governance Relationship

This repository operates under three required policy layers:

- `GOVERNANCE.md`
- `SECURITY.md`
- `PEOPLE-PROTECTION.md`

Security protects systems from compromise.
Governance protects decision integrity.
People Protection protects the humans affected by those systems.

No system may be considered production-ready unless all three policy layers are satisfied.

## Supported Content

Security review and responsible disclosure apply to:

- Cloudflare Worker code in `operations/entitlement-system`
- Cloudflare Worker code in `wix/bookings`
- website preview artifacts and trust links
- automation scripts and documentation influencing production workflows
- CI/CD enforcement workflows
- entitlement logic
- identity and access routing
- operational override actions
- AI-assisted workflow logic

## Reporting a Vulnerability

Report suspected vulnerabilities privately to:

- `jayhere@jaypventuresllc.com`

Include:

- affected file, route, workflow, or integration
- reproduction steps
- impact assessment
- operational risk description
- proof-of-concept details required for validation

Do not disclose active vulnerabilities publicly until they have been reviewed and remediated.

## Response Expectations

Target handling workflow:

1. Acknowledge receipt of the report.
2. Reproduce and validate the issue.
3. Classify severity and affected systems.
4. Contain, remediate, and verify the fix.
5. Document changes and follow-up controls.
6. Review whether governance or people-protection controls also require updates.

Validated reports must be treated as an operational priority.

## People Protection Security Boundary

Security includes protection from:

- human exploitation
- coercive access patterns
- manipulative automation
- discriminatory automation
- unsafe dependency models
- unauthorized surveillance
- unsafe identity decisions
- unsafe entitlement decisions
- administrator misuse
- partner misuse
- emergency-authority abuse

A system that is technically hardened but unsafe for people is not considered production-ready.

Security reviews must evaluate how technical decisions affect users, creators, workers, students, administrators, and vulnerable groups.

## Secrets and Access

Do not commit:

- live secrets
- tokens
- API keys
- webhook secrets
- private keys
- production signing keys
- real KV namespace IDs
- production database credentials
- privileged admin credentials

Use:

- `.dev.vars` files for local worker secrets
- platform-managed secrets for deployed environments
- least-privilege credentials for Stripe, Discord, Microsoft 365, Cloudflare, GitHub, and other integrations
- isolated development credentials wherever possible

## Security Controls Expected In This Repo

- signed webhook validation for external event sources
- KV-backed idempotency for retried webhooks
- authenticated admin routes for override and sync actions
- structured logging for sensitive state changes
- explicit environment validation before worker startup
- CI enforcement for governance/security/people-protection files
- documented rollback paths for production-impacting changes
- reason-code logging for high-impact automated decisions where applicable

## Out of Scope

The following are not valid vulnerability reports for this repository alone unless they are caused by code or configuration here:

- generic third-party service outages
- pricing or billing disputes
- speculative issues without a reproducible path
- social engineering requests without a technical exploit path
- unrelated vendor-side outages

## Hardening Checklist

Before deployment or launch, verify:

- placeholder KV IDs and example secrets are replaced
- Discord bot permissions are limited to required guild actions
- Stripe webhook secrets are environment-specific
- admin override keys are rotated and stored outside source control
- trust pages link to `GOVERNANCE.md`, `SECURITY.md`, and `PEOPLE-PROTECTION.md`
- production workflows require successful CI validation
- branch protection is enabled
- secret scanning is enabled
- Dependabot is enabled
- CODEOWNER review requirements are enabled
- signed commits are enforced where supported

## Enforcement Standard

Security requirements are enforced through:

- CI validation workflows
- repository branch protection
- CODEOWNERS review
- audit logging
- environment separation
- least-privilege access design
- operational review checklists
- deployment verification requirements

If security expectations exist only as documentation and are not operationally enforced, the repository is not considered hardened.
