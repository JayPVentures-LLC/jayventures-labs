# Entitlement System

Cloudflare Worker that receives Stripe subscription/payment events, updates entitlement state, and reconciles Discord roles for both JayPVentures brands.

## Runtime Surface
- `POST /webhook/stripe`: verifies Stripe signature, enforces idempotency, updates entitlement state, and attempts Discord sync.
- `POST /admin/override`: admin-only route for manual grants, revocations, or tier changes.
- `POST /admin/discord-sync`: admin-only route for on-demand sync or fallback KV retry drainage.
- `GET /health`: lightweight health endpoint.
- Queue consumer: handles Cloudflare Queue messages for Discord retries and Azure archive/telemetry fan-out.

## Delegation Model
- Cloudflare Workers: transaction path, webhook ingress, entitlement decisions, Discord sync orchestration.
- Cloudflare KV: entitlement state and idempotency.
- Cloudflare Queues: retry and archive fan-out.
- Azure Key Vault: optional secret source when direct worker secrets are omitted.
- Azure App Insights: telemetry sink.
- Azure archive endpoint: durable downstream event sink.

## Environment

## Environment Variable Standard

### Shared
- `INTERNAL_SYNC_TOKEN`

### Discord bot
- `DISCORD_BOT_TOKEN`

### jaypventures Discord
- `DISCORD_GUILD_ID_CREATOR`
- `DISCORD_ROLE_CREATOR_COMMUNITY_ID`
- `DISCORD_ROLE_CREATOR_VIP_ID`

### jaypVLabs Discord
- `DISCORD_GUILD_ID_LABS`
- `DISCORD_ROLE_LABS_MEMBER_ID`
- `DISCORD_ROLE_LABS_RESEARCHER_ID`
- `DISCORD_ROLE_LABS_STUDENT_ID`

### Microsoft Teams / JayPVentures LLC
- `MS_TENANT_ID`
- `MS_CLIENT_ID`
- `MS_CLIENT_SECRET`
- `MS_TEAM_ID_LLC`
- `MS_GROUP_ID_LLC_CLIENTS`
- `MS_GROUP_ID_LLC_PARTNERS`
- `MS_GROUP_ID_LLC_ENTERPRISE`

See also: `config/accessTargets.ts` for access routing and product mapping.

## Event Flow
1. Stripe posts an event to `/webhook/stripe`.
2. The worker verifies the signature and writes idempotent entitlement state to KV.
3. Discord sync runs inline for the first attempt.
4. Failed Discord work is pushed to the worker event queue.
5. Archive envelopes are also pushed to the queue.
6. The queue consumer forwards archive/telemetry events to Azure and retries Discord sync asynchronously.

## Local Development
1. Copy `.dev.vars.example` to `.dev.vars`.
2. Replace placeholder KV IDs and queue names in `wrangler.toml`.
3. Supply either direct secrets or Key Vault secret names plus Azure credentials.
4. Run from the repo root:

```bash
npm run dev:entitlement
```

## Verification
```bash
npm run test:entitlement
```
