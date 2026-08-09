# JPV-OS Production Binding Readiness Gate

## Purpose

Prevent repeated production deployment cycles from failing late by validating external runtime bindings before promotion.

## Gate States

- `READY`
- `WAITING_EXTERNAL_BINDING`
- `FAILED_VALIDATION`

## Required Binding Inventory

### Cloudflare

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_ENTITLEMENTS_KV_ID

### Azure / Entitlement Runtime

- AZURE_KEY_VAULT_URL
- AZURE_TENANT_ID
- AZURE_CLIENT_ID
- APPINSIGHTS_CONNECTION_STRING
- AZURE_ARCHIVE_ENDPOINT
- ENTITLEMENT_KV_ID
- ENTITLEMENT_KV_PREVIEW_ID
- IDEMPOTENCY_KV_ID
- IDEMPOTENCY_KV_PREVIEW_ID
- RETRY_QUEUE_KV_ID
- RETRY_QUEUE_KV_PREVIEW_ID
- ENTITLEMENT_EVENTS_QUEUE

### Identity / External Services

- MEMBERSTACK_JWT_PUBLIC_KEY

## Validation Rules

1. No production placeholder values may exist.
2. Required bindings must exist before deployment begins.
3. Secrets remain external to source control.
4. Deployment receipts must record validation state, commit SHA, and gate result.
5. Endpoint verification runs only after successful deployment validation.

## Receipt Format

```json
{
  "gate": "production-binding-readiness",
  "state": "READY|WAITING_EXTERNAL_BINDING|FAILED_VALIDATION",
  "commit": "sha",
  "timestamp": "iso-8601",
  "missing_bindings": []
}
```

## Transition Rule

`WAITING_EXTERNAL_BINDING` is a blocking state. Once bindings become valid, the gate automatically transitions to deployment validation.
