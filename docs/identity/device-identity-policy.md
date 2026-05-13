# Device Identity Policy

## Purpose

This document defines the safe device identity reference model for JPV-OS systems.

Device identity may be used only to support security, access integrity, fraud reduction, account recovery, and protected operational routing. It must not be used for behavioral surveillance, coercive pricing, social scoring, unrelated profiling, or hidden tracking.

## Allowed concept

A device identity record may describe whether a device is recognized, trusted, pending review, blocked, or revoked.

Allowed fields are schema-level placeholders only:

```json
{
  "device_record_id": "generated_internal_identifier",
  "account_id": "internal_account_reference",
  "device_label": "user_visible_label",
  "trust_status": "trusted | pending_review | revoked | blocked",
  "verification_method": "mfa | passkey | admin_review | recovery_flow",
  "last_verified_at": "ISO-8601 timestamp",
  "risk_review_required": true,
  "notes": "non-sensitive operational note"
}
```

## Prohibited committed values

The following must never be committed to Git:

- real device IDs
- IMEIs
- phone numbers
- hardware serial numbers
- authentication tokens
- webhook secrets
- Discord bot tokens
- Stripe keys
- raw `.env` values
- full device fingerprints
- personal identifiers copied from runtime systems

## Storage rule

Real device identity values, when required, must live only in protected runtime configuration, a proper secret manager, or a controlled identity/security system.

Git repositories may contain schemas, templates, and documentation only.

## Review rule

Any future device identity implementation must include least-privilege access, audit logging, deletion or revocation paths, human review for lockout or denial, and a support or appeal path.

## JPV-OS boundary

Device identity exists to protect access integrity. It must not become a surveillance or exploitation layer.
