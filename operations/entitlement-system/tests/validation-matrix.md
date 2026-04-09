# Multi-Guild Entitlement System: Test Plan & Validation Matrix

## Test Cases

| # | Scenario | Trigger | Expected Entitlement Result | Expected Discord Role Result | Expected Logs | Retry Behavior | Pass/Fail Criteria |
|---|----------|---------|----------------------------|-----------------------------|---------------|---------------|-------------------|
| 1 | JayPVentures LLC entitlement only | Stripe event (LLC) | Entitlement for LLC only, correct tier/status | Roles added/removed in LLC guild only | Webhook received, entitlement updated, LLC sync success | Retry Discord sync on failure | Roles match entitlement, logs show success |
| 2 | jaypventures entitlement only | Stripe event (creator) | Entitlement for creator only, correct tier/status | Roles added/removed in creator guild only | Webhook received, entitlement updated, creator sync success | Retry Discord sync on failure | Roles match entitlement, logs show success |
| 3 | Both entitlements on one user | Stripe event for both brands | Both entitlements present, correct tiers/status | Roles synced in both guilds | Webhook received, entitlement updated, both syncs success | Retry Discord sync on failure | Both guilds reflect correct roles |
| 4 | Tier upgrade | Stripe event (upgrade) | Entitlement tier updated | Old tier roles removed, new tier roles added | Entitlement updated, sync success | Retry Discord sync on failure | Only new tier roles present |
| 5 | Tier downgrade | Stripe event (downgrade) | Entitlement tier updated | Old tier roles removed, new tier roles added | Entitlement updated, sync success | Retry Discord sync on failure | Only new tier roles present |
| 6 | Cancellation | Stripe event (cancel) | Entitlement status inactive | All brand roles removed | Entitlement updated, sync success | Retry Discord sync on failure | No brand roles present |
| 7 | Expiry | Time-based expiry | Entitlement status expired | All brand roles removed | Entitlement expired, sync success | Retry Discord sync on failure | No brand roles present |
| 8 | Duplicate Stripe event | Same event sent twice | No duplicate entitlement update | No duplicate role sync | Duplicate event log | No retry | No errors, idempotency preserved |
| 9 | Missing Discord member | Stripe event for user not in guild | Entitlement updated | Sync skipped, error logged | Member not found log | Retry not attempted | Entitlement present, no crash |
|10 | Missing role mapping | Stripe event with unmapped tier | Entitlement updated | Sync skipped, error logged | Role mapping missing log | Retry not attempted | Entitlement present, no crash |
|11 | Discord API failure | Stripe event, Discord API returns error | Entitlement updated | Sync error logged, retry recommended | Discord API error log | Retry on next attempt | Entitlement present, error logged |
|12 | Entitlement write failure | Stripe event, KV write fails | No entitlement update | No sync attempted | Entitlement update failed log | Stripe retries webhook | No roles changed, error logged |

## Notes
- Each test should use controlled user/test data.
- Validate logs for each step.
- Simulate Discord API failures and rate limits.
- Simulate KV failures for entitlement write.
- Confirm idempotency by replaying Stripe events.
- Confirm correct role removal on downgrade/cancel/expiry.
- Confirm multi-guild sync for users with both entitlements.
- Confirm no-op syncs are skipped and logged.
