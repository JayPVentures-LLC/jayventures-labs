# Entitlement System

Cloudflare Worker that receives Stripe subscription/payment events, updates entitlement state, handles Discord OAuth, and reconciles Discord roles for both JayPVentures brands.

## Runtime Surface
- `POST /webhook/stripe`: verifies Stripe signature, enforces idempotency, updates entitlement state, and attempts Discord sync.
- `GET /oauth/discord/start`: initiates Discord OAuth flow; redirects user to Discord authorization URL.
- `GET /oauth/discord/callback`: completes OAuth flow, links Discord user to entitlement record, queues role sync.
- `POST /activate`: activates entitlement after payment + Discord OAuth; enqueues `discord-retry` for role sync.
- `POST /admin/override`: admin-only route for manual grants, revocations, or tier changes.
- `POST /admin/discord-sync`: admin-only route for on-demand sync or fallback KV retry drainage.
- `GET /health`: lightweight health endpoint.
- Queue consumer: handles `STRIPE_ENTITLEMENT_SYNCED` (Discord role PUT/DELETE with fail-closed error classification), `discord-retry`, and Azure archive/telemetry fan-out. Permanent failures are ack'd immediately; transient Discord API errors re-throw to trigger Cloudflare retry. Every outcome is written to `METRICS_KV`.

## Delegation Model
- Cloudflare Workers: transaction path, webhook ingress, entitlement decisions, Discord sync orchestration.
- Cloudflare KV: entitlement state and idempotency.
- Cloudflare Queues: retry and archive fan-out.
- Azure Key Vault: optional secret source when direct worker secrets are omitted.
- Azure App Insights: telemetry sink.
- Azure archive endpoint: durable downstream event sink.

## Environment

## Environment Variable Standard

### Core
- `STRIPE_WEBHOOK_SECRET`
- `INTERNAL_SYNC_TOKEN`

### Discord bot
- `DISCORD_BOT_TOKEN`

### Single-guild reflection (queue-driven Discord sync)
- `DISCORD_GUILD_ID` — primary guild for `STRIPE_ENTITLEMENT_SYNCED` reflection
- `DISCORD_ROLE_COMMUNITY_ID` — role ID mapped to `member` tier
- `DISCORD_ROLE_VIP_ID` — role ID mapped to `premium`/`enterprise` tiers

### Discord OAuth
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_OAUTH_REDIRECT_URI`

### Activation
- `PUBLIC_BASE_URL`
- `OAUTH_STATE_SECRET` — HMAC key for OAuth state tokens
- `ACTIVATION_TOKEN_SECRET` — HMAC key for activation tokens

### Multi-guild config (discordGuilds.ts)
- `DISCORD_GUILD_ID_CREATOR` — jaypventures guild
- `DISCORD_GUILD_ID_LABS` — jaypVLabs guild

### Azure (optional telemetry/archival)
- `AZURE_KEY_VAULT_URL`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`
- `APPINSIGHTS_CONNECTION_STRING`
- `AZURE_ARCHIVE_ENDPOINT`

See also: `config/accessTargets.ts` for brand/tier → product routing and `config/discordGuilds.ts` for guild/role mapping.

## Event Flow

### Stripe webhook path
1. Stripe posts an event to `/webhook/stripe`.
2. The worker verifies the signature and writes idempotent entitlement state to KV.
3. A `STRIPE_ENTITLEMENT_SYNCED` event is pushed to the queue.
4. The queue consumer handles the event: permanent failures ack immediately; transient Discord API errors re-throw for retry.
5. Every outcome (success, permanent failure, retry) is written to `METRICS_KV` as an audit record.

### Activation path (payment → Discord OAuth → role sync)
1. Customer completes payment via Stripe.
2. Customer visits `/oauth/discord/start` → redirected to Discord authorization.
3. Discord redirects back to `/oauth/discord/callback` → Discord user linked to entitlement record.
4. Customer POSTs to `/activate` → entitlement activated → `discord-retry` message enqueued.
5. Queue consumer resolves entitlement and syncs Discord role.

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
npm test
npm run typecheck
npm run deploy:dryrun:entitlement
```
