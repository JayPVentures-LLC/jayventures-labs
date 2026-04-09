# Entitlement System Backbone Scaffold

This directory contains the core infrastructure for dual-brand entitlement, payment, and access control.

## Structure
- workers/: Cloudflare Worker entrypoints
- routes/: HTTP route handlers
- services/: Business logic and integrations
- middleware/: Route protection and entitlement checks
- utils/: Shared utilities (logging, signature, retry)
- types/: Shared models and types
- config/: Environment and mapping config
- admin/: Admin override endpoints

## Implementation Order
1. workers/stripeWebhook.ts
2. routes/webhook.route.ts
3. services/stripe.service.ts
4. services/entitlement.service.ts
5. services/discord.service.ts
6. middleware/entitlementCheck.ts
7. admin/override.ts
8. utils/logger.ts
9. utils/verify-signature.ts
10. utils/retry-queue.ts
11. config/env.ts
12. config/discordRoles.ts
13. config/stripeEvents.ts
14. types/*.ts

Start with Stripe webhook ingestion, entitlement update, and Discord sync, then build out middleware and admin controls.
