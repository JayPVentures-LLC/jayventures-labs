# Sensitive Identifier Handling

## Purpose

This standard defines how sensitive identifiers must be handled across JPV-OS repositories and runtime systems.

## Sensitive identifiers

Sensitive identifiers include phone numbers, IMEIs, device IDs, hardware serials, access tokens, API keys, webhook secrets, payment provider secrets, Discord bot tokens, raw environment values, full device fingerprints, and personal identifiers from identity, billing, or security systems.

## Repository rule

Sensitive identifiers must not be committed to Git.

Repositories may contain blank templates, schema examples, placeholder values, policy documentation, and validation logic without real secrets.

Repositories must not contain `.env` files with real values, production credentials, personal device identifiers, phone numbers, IMEIs, raw exported identity data, or logs containing sensitive runtime values.

## Runtime storage

Real values must be stored only in approved runtime systems such as a secret manager, protected cloud runtime variables, identity provider configuration, encrypted operational database, or restricted security tooling.

## Sanitization rule

Before migration from a legacy repository, remove or replace all literal sensitive values with neutral placeholders.

Acceptable placeholders:

```text
ALLOWED_DEVICE_IDS=
ALLOWED_PHONES=
ALLOWED_IMEIS=
STRIPE_SECRET_KEY=
DISCORD_BOT_TOKEN=
WEBHOOK_SECRET=
```

## Incident rule

If sensitive identifiers are found in Git history: remove them from current HEAD, rotate or revoke live credentials, treat personal identifiers as exposed, document remediation, avoid copying values into new repositories, and preserve only sanitized schema or policy concepts.

## JPV-OS requirement

Sensitive identifier handling must preserve human dignity, privacy, consent, portability, and access integrity. Security controls must not become covert tracking systems.
