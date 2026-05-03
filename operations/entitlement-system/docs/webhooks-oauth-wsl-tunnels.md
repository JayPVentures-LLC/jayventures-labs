# Webhooks, OAuth, WSL, and Tunnels

This repo treats webhooks, OAuth, WSL, and tunnels as separate layers. They may touch during development, but they must not be collapsed into one responsibility.

## Production boundary

Production runs on Cloudflare Workers and stable domain routes. WSL and tunnels are local development tools only.

Canonical production routes:

| Route | Purpose | Trust model |
| --- | --- | --- |
| `/webhooks/stripe` | Stripe event ingress | Machine-to-machine, signature verified |
| `/auth/discord/start` | Start Discord OAuth | User-initiated authorization |
| `/auth/discord/callback` | Complete Discord OAuth | Code exchange and identity confirmation |
| `/activate` | Bind paid entitlement to verified Discord identity | Human-in-the-loop activation |
| `/admin/audit` | Operator visibility | Read-only, role constrained |

## Stripe webhook flow

Stripe webhooks prove that a Stripe-side event happened. They do not log a user in and they do not prove Discord identity.

Expected flow:

1. Stripe sends `checkout.session.completed` or a supported subscription event to `/webhooks/stripe`.
2. The Worker verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
3. The ingress handler normalizes the event into a minimal internal payload.
4. The Worker enforces idempotency before side effects.
5. Entitlement state is written to KV/D1.
6. A queue job is emitted for downstream Discord role synchronization.

Webhook handlers must remain narrow: verify, normalize, persist minimal state, enqueue, return.

## Discord OAuth flow

Discord OAuth proves which Discord user authorized the app. It does not prove payment.

Expected flow:

1. User starts at `/auth/discord/start`.
2. App redirects to Discord with a scoped authorization request and CSRF `state`.
3. Discord returns to `/auth/discord/callback` with an authorization code.
4. Worker exchanges the code server-side.
5. Worker resolves the Discord user ID.
6. Worker binds that Discord user ID to an existing entitlement subject/customer when activation rules pass.

The binding layer should connect `stripe_customer_id`, internal `jpvos_subject_id`, and `discord_user_id` only after both payment state and Discord identity have been independently validated.

## Local WSL and tunnel flow

WSL is the developer runtime. A tunnel is the temporary public network bridge.

Local-only pattern:

```text
WSL dev server / wrangler dev
  -> cloudflared tunnel or ngrok public URL
  -> Stripe webhook endpoint for testing
  -> Discord OAuth redirect URI for testing
```

Do not put tunnel URLs in production configuration. Do not treat a tunnel as a production ingress layer.

## Required environment separation

Use separate values for local, preview, and production.

Required secret bindings:

- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_COMMUNITY_ROLE_ID`
- `DISCORD_VIP_ROLE_ID`
- `OAUTH_STATE_SECRET`

Required public configuration:

- `PUBLIC_BASE_URL`
- `DISCORD_OAUTH_REDIRECT_URI`
- `ENTITLEMENT_ACTIVATION_URL`

## Non-negotiables

- Webhooks are signed machine events.
- OAuth is user authorization.
- WSL is a local runtime.
- Tunnels are temporary development connectivity.
- Production must use Cloudflare Workers routes, custom domains, and secret-bound configuration.
- Payment state and Discord identity must be validated independently before role assignment.
