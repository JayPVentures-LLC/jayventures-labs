# JayPVentures Unified Intake Engine

## Endpoint
POST /webhook/intake

## Required Header
x-jvp-signature is the hex HMAC SHA256 of the raw request body

## Local Test
Run the local worker and send a POST request to /webhook/intake.

## Envelope Example Bookings
{
  "source": "bookings",
  "eventType": "booking.created",
  "idempotencyKey": "bookings:created:BOOKING_ID_123",
  "occurredAt": "2026-02-10T00:00:00Z",
  "payload": {
    "serviceName": "JayPVentures LLC - Strategy Session 60 Minutes",
    "customerName": "Test Client",
    "customerEmail": "test@email.com",
    "startDateTime": "2026-02-10T10:00:00Z",
    "endDateTime": "2026-02-10T11:00:00Z",
    "servicePrice": "$350",
    "bookingId": "BOOKING_ID_123"
  }
}

## Envelope Example Stripe
{
  "source": "stripe",
  "eventType": "payment.succeeded",
  "idempotencyKey": "stripe:evt_123",
  "occurredAt": "2026-02-10T00:00:00Z",
  "payload": {
    "id": "evt_123",
    "data": {
      "object": {
        "customer": "cus_123",
        "amount_received": 3900,
        "customer_details": { "email": "test@email.com" }
      }
    }
  }
}

## Envelope Example Memberstack
{
  "source": "memberstack",
  "eventType": "subscription.created",
  "idempotencyKey": "memberstack:sub_123",
  "occurredAt": "2026-02-10T00:00:00Z",
  "payload": {
    "id": "mem_123",
    "email": "test@email.com",
    "tier": "Plus",
    "name": "Test Member"
  }
}

## Integration Environment
Set these environment variables when running the worker locally or in production.

- ENVIRONMENT
- INTAKE_HMAC_SECRET
- SHAREPOINT_SITE_ID
- SHAREPOINT_LIST_ID
- SHAREPOINT_MEMBERS_LIST_ID
- SHAREPOINT_ACCESS_TOKEN
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- MEMBERSTACK_WEBHOOK_SECRET
- MEMBERSTACK_JWT_PUBLIC_KEY
- EMAIL_API_KEY
- DATALAKE_ENDPOINT
- DATALAKE_TOKEN
- INNER_CIRCLE_MEMBER_KV
- ADMIN_UPLOAD_TOKEN

EMAIL_API_KEY is used as the email webhook endpoint URL in this package.

## Idempotency KV
Bind IDEMPOTENCY_KV to a Cloudflare KV namespace to prevent duplicate processing.

## Inner Circle Portal
Routes:
- /inner-circle
- /inner-circle/metrics

Inner Circle access requires Authorization Bearer token or jvp_token cookie.
Only Inner Circle tier claims are allowed. The portal returns no financial totals.

## Creator Command Center
Routes:
- /creator
- /creator/metrics
- /creator/upload

Creator data is read from CREATOR_DATA_KV using key creator:last60.
Upload accepts an array of JSON rows and replaces creator:last60.

Creator metrics supports an admin bearer token using ADMIN_UPLOAD_TOKEN for automation callers.

## Inner Circle Backfill
Route:
- /inner-circle/backfill

Admin-only endpoint to generate Inner Circle IDs from a list of members.
Provide the ADMIN_UPLOAD_TOKEN as a bearer token.

Example payload:
```
[
  { "memberId": "mem_123", "email": "inner@jaypventures.com", "name": "Jay P", "tier": "Inner Circle" },
  { "memberKey": "mem_456", "email": "vip@jaypventures.com", "name": "VIP Client" }
]
```

## Backfill Script (CSV)
CSV headers supported: memberId, memberKey, email, name, tier.

```
set JVP_BASE_URL=http://127.0.0.1:8787
set ADMIN_UPLOAD_TOKEN=your-admin-token
node --experimental-strip-types scripts/backfill-inner-circle.ts .\members.csv
```

## Data Operations
### Backfill Dry Run
Use `?dryRun=true` or include `"dryRun": true` in the JSON body to validate without writing KV or SharePoint.
Dry run returns a preview of normalized records and validation errors.

Example (query param):

```
set JVP_BASE_URL=http://127.0.0.1:8787
set ADMIN_UPLOAD_TOKEN=your-admin-token
curl -X POST "%JVP_BASE_URL%/inner-circle/backfill?dryRun=true" -H "Authorization: Bearer %ADMIN_UPLOAD_TOKEN%" -H "Content-Type: application/json" -d @members.json
```

Example (body field):

```
{
  "dryRun": true,
  "records": [
    { "memberId": "mem_123", "email": "inner@jaypventures.com", "name": "Jay P", "tier": "Inner Circle" }
  ]
}
```

### Backfill Script (JSON)
Provide a JSON array of rows with keys: memberId, memberKey, email, name, tier.

```
set JVP_BASE_URL=http://127.0.0.1:8787
set ADMIN_UPLOAD_TOKEN=your-admin-token
node --experimental-strip-types scripts/backfill-inner-circle.ts .\members.json
```

### Memberstack Export Helper (PowerShell)
Exports Memberstack members to CSV, transforms to JSON, and calls the backfill endpoint.

```
$env:JVP_BASE_URL = "http://127.0.0.1:8787"
$env:ADMIN_UPLOAD_TOKEN = "your-admin-token"
$env:MEMBERSTACK_API_KEY = "your-memberstack-api-key"
$env:MEMBERSTACK_API_URL = "https://api.memberstack.com/v1/members?page={page}&pageSize={pageSize}"
pwsh -File .\scripts\memberstack-backfill.ps1
```

Export directly to JSON (no CSV):

```
$env:JVP_BASE_URL = "http://127.0.0.1:8787"
$env:ADMIN_UPLOAD_TOKEN = "your-admin-token"
$env:MEMBERSTACK_API_KEY = "your-memberstack-api-key"
$env:MEMBERSTACK_API_URL = "https://api.memberstack.com/v1/members?page={page}&pageSize={pageSize}"
pwsh -File .\scripts\memberstack-backfill.ps1 -ExportJson .\members.json
```

Export JSON only (no backfill call):

```
$env:MEMBERSTACK_API_KEY = "your-memberstack-api-key"
$env:MEMBERSTACK_API_URL = "https://api.memberstack.com/v1/members?page={page}&pageSize={pageSize}"
pwsh -File .\scripts\memberstack-backfill.ps1 -ExportJson .\members.json -ExportJsonOnly
```

If you already exported a CSV manually:

```
$env:ADMIN_UPLOAD_TOKEN = "your-admin-token"
pwsh -File .\scripts\memberstack-backfill.ps1 -SkipExport -ExportCsv .\members.csv
```

If you already have a JSON file:

```
$env:ADMIN_UPLOAD_TOKEN = "your-admin-token"
pwsh -File .\scripts\memberstack-backfill.ps1 -InputJson .\members.json
```

## Stripe and AVA Future Proofing
Stripe metadata includes lane, tier, event type, and idempotency key for All Ventures Access workflows.

## Local MRR Test Harness
This script posts subscription.created, subscription.updated, subscription.cancelled, and booking.created events, then reads /metrics after each step.

Run the worker in one terminal:

```
npx wrangler dev src/index.ts --local --var ENVIRONMENT="local" --var INTAKE_HMAC_SECRET="localdevsecret"
```

Run the test in another terminal:

```
set JVP_BASE_URL=http://127.0.0.1:8787
set INTAKE_HMAC_SECRET=localdevsecret
node --experimental-strip-types scripts/test-events.ts
```

Expected metrics behavior:
- oneTimeRevenue increases after booking.created
- newMRR increases after subscription.created and subscription.updated
- totalMRR increases on created, adjusts on updated, and returns to 0 on cancelled

## Local Inner Circle Test Site
Open local-test-site.html in a browser and point it at your local worker URL.
Provide a valid Inner Circle JWT in the token field to load /inner-circle/metrics.
