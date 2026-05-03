# Phase 1 Bot Architecture: Entitlement & Access System

## Brands Supported
- JayPVentures LLC (enterprise, high-ticket)
- jaypventures (community, creator, membership)

## Core Components
1. **Stripe Webhook Handler (Cloudflare Worker)**
	 - Receives payment, subscription, and cancellation events
	 - Verifies Stripe signature
	 - Updates entitlement state in KV
	 - Triggers Discord role sync
	 - Logs all events and failures
2. **KV Entitlement Storage Schema**
	 - Stores user entitlements by brand, tier, and Discord ID/email
	 - Tracks status, expiration, and override flags
3. **Discord Role Sync Service**
	 - Assigns/removes roles based on entitlement state
	 - Handles Discord API failures with retry/queue
	 - Supports admin override for manual role sync
4. **Entitlement Validation Middleware**
	 - Protects API routes and resources
	 - Validates entitlement and tier for each brand
	 - Supports admin override and logging

## Folder Structure

```
/entitlement-system
	/workers
		stripeWebhook.ts           # Cloudflare Worker: Stripe event handler
	/services
		kvEntitlement.ts          # KV schema, CRUD, and logic
		discordRoleSync.ts        # Discord role sync logic, retry, admin override
		logger.ts                 # Centralized logging utility
	/middleware
		entitlementCheck.ts       # Route middleware for entitlement validation
	/config
		env.ts                    # Environment variable loader and type definitions
		discordRoles.ts           # Brand/tier → Discord role mapping
		stripeEvents.ts           # Supported Stripe event types
	/types
		entitlement.ts            # Entitlement, tier, and user type definitions
		stripe.ts                 # Stripe event type definitions
		discord.ts                # Discord API types
	/admin
		override.ts               # Admin override logic and API
	/tests
		...                       # Unit/integration tests for all modules
	README.md                   # System overview and setup
```

## File Responsibilities
- **stripeWebhook.ts**: Entry point for Stripe webhooks, signature verification, event routing, error handling.
- **kvEntitlement.ts**: CRUD for entitlements, schema enforcement, tier logic, expiration, override support.
- **discordRoleSync.ts**: Assign/remove Discord roles, handle API errors, retry queue, admin-triggered sync.
- **logger.ts**: Structured logging for all actions, errors, and admin events.
- **entitlementCheck.ts**: Middleware for protected routes, checks entitlement/tier, supports admin bypass.
- **env.ts**: Loads and validates all required environment variables.
- **discordRoles.ts**: Maps brands/tiers to Discord role IDs.
- **stripeEvents.ts**: Enumerates supported Stripe event types and validation.
- **entitlement.ts**: Types for entitlements, users, tiers, overrides.
- **stripe.ts**: Types for Stripe events and payloads.
- **discord.ts**: Types for Discord API requests/responses.
- **override.ts**: Admin API for manual entitlement/role overrides, with audit logging.

## Environment Variables
- `STRIPE_SECRET_KEY` (Stripe API key)
- `STRIPE_WEBHOOK_SECRET` (Stripe webhook signing secret)
- `DISCORD_BOT_TOKEN` (Discord bot token)
- `DISCORD_GUILD_ID` (Discord server ID)
- `DISCORD_ROLE_MAP` (JSON: brand/tier → role ID)
- `KV_NAMESPACE` (Cloudflare KV namespace binding)
- `ADMIN_OVERRIDE_KEY` (Admin override API key)
- `LOG_LEVEL` (logging verbosity)

## Event Flow: Stripe → KV → Discord
1. **Stripe Event**: Payment, subscription, or cancellation event POSTed to Cloudflare Worker.
2. **Webhook Handler**: Verifies signature, parses event, determines user/brand/tier.
3. **KV Update**: Updates entitlement record (active/inactive, tier, expiration, override flag).
4. **Discord Sync**: Triggers role assignment/removal via Discord API based on new entitlement state.
5. **Logging**: All actions and errors logged for audit.
6. **Admin Override**: Admin can trigger manual entitlement or role changes via secure API.

## Failure Handling & Retry Logic
- **Stripe Webhook**: On failure, returns 500 to Stripe (Stripe will retry automatically).
- **KV Write Failure**: Logs error, returns 500, triggers alert if persistent.
- **Discord API Failure**: Adds to retry queue (with exponential backoff), logs error, notifies admin if repeated.
- **Admin Override**: All manual changes are logged with user, timestamp, and reason.

## Admin Override Capability
- Secure API endpoint (protected by `ADMIN_OVERRIDE_KEY`)
- Allows manual entitlement or Discord role changes
- All overrides are logged and auditable
- Supports both brands and all tiers

## Tier-Based Access
- Entitlement schema and Discord role mapping support multiple tiers per brand
- Middleware enforces tier requirements for protected resources

---

This architecture is ready for implementation. Let me know if you want to generate code for any specific module or the full scaffold next.
