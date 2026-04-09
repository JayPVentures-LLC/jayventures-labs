# Security Policy

## Scope
This repository contains experimental worker code, website drafts, automation assets, and internal operating documentation for JayPVentures LLC. It is not a production system by default, but security expectations still apply to all code and documentation stored here.

## Supported Content
Security review and responsible disclosure apply to:
- Cloudflare Worker code in `operations/entitlement-system`
- Cloudflare Worker code in `wix/bookings`
- website preview artifacts and trust links
- automation scripts and documentation that influence production workflows

## Reporting a Vulnerability
Report suspected vulnerabilities privately to:
- `jayhere@jaypventuresllc.com`

Include:
- affected file, route, or workflow
- reproduction steps
- impact assessment
- any proof-of-concept details needed to validate the issue

Do not disclose active vulnerabilities publicly until they have been reviewed and remediated.

## Response Expectations
Target handling workflow:
1. Acknowledge receipt of a report.
2. Reproduce and validate the issue.
3. Classify severity and affected systems.
4. Contain, remediate, and verify the fix.
5. Document the change and any follow-up controls.

Response times depend on severity and available context, but validated reports should be treated as an operational priority.

## Secrets and Access
Do not commit live secrets, tokens, API keys, webhook secrets, private keys, or real KV namespace IDs to this repository.

Use:
- `.dev.vars` files for local worker secrets
- platform-managed secrets for deployed environments
- least-privilege credentials for Stripe, Discord, Microsoft 365, and other integrations

## Security Controls Expected In This Repo
- signed webhook validation for external event sources
- KV-backed idempotency for retried webhooks
- authenticated admin routes for override and sync actions
- structured logging for sensitive state changes
- explicit environment validation before worker startup

## Out of Scope
The following are not valid vulnerability reports for this repository alone unless they are caused by code or configuration here:
- generic third-party service outages
- pricing or billing disputes
- speculative issues without a reproducible path
- social engineering requests without a technical exploit path

## Hardening Checklist
Before deployment or launch, verify:
- all placeholder KV IDs and example secrets have been replaced
- Discord bot permissions are limited to required guild actions
- Stripe webhook secrets are environment-specific
- admin override keys are rotated and stored outside source control
- trust pages link to both `GOVERNANCE.md` and this file

