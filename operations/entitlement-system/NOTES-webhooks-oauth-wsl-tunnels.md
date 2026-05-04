# JayPV Entitlement System Notes: Webhooks, OAuth, WSL, and Tunnels

## Purpose

This note captures the current architecture decisions, route boundaries, local development model, production model, and required configuration for the JayPV entitlement flow.

The core rule is simple: webhooks, OAuth, WSL, and tunnels are separate layers. They may interact during development, but they do not share trust responsibilities.

## Clean Definitions

### Webhooks

Webhooks are machine-to-machine event delivery.

Example: Stripe sends an HTTP request to the system when a payment, checkout, or subscription event happens.

Webhook responsibilities:

- receive external service events
- verify the sender signature
- normalize the event into an internal shape
- enforce idempotency
- write entitlement state
- enqueue downstream work

Webhooks do not log users in. Webhooks do not prove Discord identity. Webhooks do not directly assign roles.

### OAuth

OAuth is user authorization and identity confirmation.

Example: Discord OAuth confirms which Discord account the user controls.

OAuth responsibilities:

- redirect the user to Discord
- require a signed state value
- exchange the authorization code server-side
- fetch the Discord user identity
- temporarily store verified Discord identity
- hand off to activation

OAuth does not create payment entitlement. OAuth does not prove that a user paid. OAuth does not directly grant access.

### WSL

WSL is the local Linux runtime on Windows.

WSL responsibilities:

- local development
- running dev servers
- running Wrangler, Node, TypeScript, and test tooling

WSL is not production infrastructure.

### Tunnels

Tunnels expose a local dev server to the public internet temporarily.

Examples:

- Cloudflare Tunnel
- ngrok

Tunnel responsibilities:

- let Stripe hit a local webhook endpoint during testing
- let Discord redirect to a local OAuth callback during testing

Tunnels are temporary development bridges. Tunnels must not be used as production ingress.

## Production Architecture

Production should run through Cloudflare Workers using stable custom domains.

Canonical production API base:

```text
https://api.jaypventuresllc.com
```

Core production routes:

```text
/webhooks/stripe
/auth/discord/start
/auth/discord/callback
/activate
/admin/audit
```

Route responsibility table:

| Route | Purpose | Trust Model |
| --- | --- | --- |
| `/webhooks/stripe` | Stripe event ingress | Signed machine event |
| `/auth/discord/start` | Begin Discord OAuth | User-initiated authorization |
| `/auth/discord/callback` | Complete Discord OAuth | Server-side token exchange |
| `/activate` | Bind entitlement to Discord identity | Payment + identity gate |
| `/admin/audit` | Operator visibility | Read-only, role constrained |

## Intended End-to-End Flow

```text
Stripe Checkout
  -> Stripe webhook
  -> /webhooks/stripe
  -> verify Stripe signature
  -> normalize event
  -> idempotency check
  -> write entitlement state
  -> enqueue entitlement event

User
  -> /auth/discord/start
  -> Discord OAuth
  -> /auth/discord/callback
  -> verify state
  -> exchange code server-side
  -> fetch Discord identity
  -> store temporary verified identity

User
  -> /activate
  -> confirm verified Discord identity
  -> confirm paid entitlement
  -> bind Stripe customer/internal subject to Discord user
  -> enqueue DISCORD_ROLE_SYNC
  -> Discord bot grants role
```

## Trust Boundaries

The system must keep these boundaries intact:

```text
Stripe = financial truth
Discord = community identity truth
JPV subject = internal control identity
Cloudflare Worker = enforcement boundary
Queue = side-effect boundary
Discord bot = role execution boundary
```

No one layer should pretend to be another layer.

## Current Files Added

The following files have been added to `jaypventures/jayventures-labs`:

```text
operations/entitlement-system/docs/webhooks-oauth-wsl-tunnels.md
operations/entitlement-system/routes/oauth.route.ts
operations/entitlement-system/routes/activate.route.ts
operations/entitlement-system/NOTES-webhooks-oauth-wsl-tunnels.md
```

### `docs/webhooks-oauth-wsl-tunnels.md`

Architecture explanation and implementation boundary guide.

### `routes/oauth.route.ts`

Adds Discord OAuth route logic:

```text
/auth/discord/start
/auth/discord/callback
```

It includes:

- signed OAuth `state`
- 10-minute state expiry
- Discord authorization redirect
- server-side token exchange
- Discord user fetch
- temporary KV record for verified identity

Temporary KV key pattern:

```text
discord:oauth:{discord_user_id}
```

### `routes/activate.route.ts`

Adds activation route logic:

```text
/activate
```

It includes:

- Discord identity verification check
- entitlement lookup
- Stripe customer to Discord user binding
- queue event emission for Discord role sync

Binding KV key pattern:

```text
binding:{discord_user_id}
```

Queue event emitted:

```text
DISCORD_ROLE_SYNC
```

## Required Worker Mounting

The routes have been created, but the Worker entry must mount them.

Add this to the main Worker/Hono app:

```ts
import { oauthRoute } from './routes/oauth.route';
import { activateRoute } from './routes/activate.route';

app.route('/auth', oauthRoute);
app.route('/activate', activateRoute);
```

Expected mounted routes after this change:

```text
/auth/discord/start
/auth/discord/callback
/activate
```

## Required Wrangler Configuration

Add public configuration to `wrangler.toml`:

```toml
[vars]
PUBLIC_BASE_URL = "https://api.jaypventuresllc.com"
DISCORD_OAUTH_REDIRECT_URI = "https://api.jaypventuresllc.com/auth/discord/callback"
ENTITLEMENT_ACTIVATION_URL = "https://api.jaypventuresllc.com/activate"
```

Do not put secrets in `wrangler.toml`.

## Required Secrets

Set these with Wrangler secrets:

```powershell
# Discord bot (shared)
npx wrangler secret put DISCORD_BOT_TOKEN

# jaypventures Discord
npx wrangler secret put DISCORD_GUILD_ID_CREATOR
npx wrangler secret put DISCORD_ROLE_CREATOR_COMMUNITY_ID
npx wrangler secret put DISCORD_ROLE_CREATOR_VIP_ID

# jaypVLabs Discord
npx wrangler secret put DISCORD_GUILD_ID_LABS
npx wrangler secret put DISCORD_ROLE_LABS_MEMBER_ID
npx wrangler secret put DISCORD_ROLE_LABS_RESEARCHER_ID
npx wrangler secret put DISCORD_ROLE_LABS_STUDENT_ID
```

For Microsoft Teams / JayPVentures LLC, add these after Entra app registration:

```powershell
npx wrangler secret put MS_TENANT_ID
npx wrangler secret put MS_CLIENT_ID
npx wrangler secret put MS_CLIENT_SECRET
npx wrangler secret put MS_TEAM_ID_LLC
npx wrangler secret put MS_GROUP_ID_LLC_CLIENTS
npx wrangler secret put MS_GROUP_ID_LLC_PARTNERS
npx wrangler secret put MS_GROUP_ID_LLC_ENTERPRISE
```

## Local Development Model

Use WSL for local runtime and a tunnel for temporary public access.

Example local pattern:

```text
WSL
  -> wrangler dev
  -> cloudflared tunnel or ngrok
  -> temporary public URL
  -> Stripe webhook endpoint for testing
  -> Discord OAuth callback for testing
```

Local testing examples:

```text
https://temporary-tunnel-url/webhooks/stripe
https://temporary-tunnel-url/auth/discord/callback
```

Never commit tunnel URLs to production config.

## Production Model

Production pattern:

```text
Cloudflare Worker
  -> api.jaypventuresllc.com
  -> bound KV namespaces
  -> bound Queues
  -> secret-bound Stripe/Discord credentials
```

Production must not depend on:

- WSL
- local laptop uptime
- ngrok URLs
- temporary cloudflared tunnel URLs
- frontend-held secrets

## Role Assignment Rule

Discord role assignment must only happen after both conditions are true:

```text
payment entitlement verified == true
Discord identity verified == true
```

Then and only then:

```text
Stripe customer/internal JPV subject -> Discord user ID -> role sync queue event
```

The webhook cannot directly assign the role.

OAuth cannot directly assign the role.

The frontend cannot assign the role.

## Recommended Next Hardening

The current activation route accepts `customer_id` as a query parameter for early wiring. This should be replaced with a signed activation token.

Preferred next model:

```text
Stripe success -> signed activation token -> /activate?token=...
```

The token should contain:

```json
{
  "customer_id": "cus_...",
  "entitlement_id": "...",
  "issued_at": 1234567890,
  "expires_at": 1234567990,
  "nonce": "..."
}
```

The token must be signed server-side and verified inside `/activate` before binding.

Reason: raw `customer_id` in a query string is weaker and should not be treated as final production posture.

## Repo-by-Repo Alignment Plan

### `jayventures-labs`

Role: system authority and implementation lab.

Needs:

- mount OAuth route
- mount activation route
- add signed activation token service
- add tests for OAuth state verification
- add tests for activation denial cases
- add queue consumer test for `DISCORD_ROLE_SYNC`

### `JayPVentures-LLC/automation-core`

Role: side-effect execution and automation consumer.

Needs:

- Discord role sync consumer
- no raw webhook ingress
- queue-only processing
- audit logging for every role grant/revoke

### `JayPVentures-LLC/jaypventuresllc.com`

Role: enterprise/public funnel.

Needs:

- redirect users to Stripe Checkout
- redirect successful checkout to activation
- no webhook handling
- no OAuth token handling
- no secret handling

### `JayPVentures-LLC/website-design`

Role: UI/front-end patterning.

Needs:

- UI states for connect Discord
- UI states for activation success/failure
- no server trust logic in frontend

### `jaypventures/jaypventuresllc`

Role: enterprise policy and operating model.

Needs:

- identity binding policy doc
- system boundary doc
- environment governance doc

### `JayPVentures-LLC/jpv-discussions`

Role: public discussion/community repo.

Needs:

- privacy-safe explanation
- no secrets
- no implementation internals
- explain consent-based OAuth and minimal entitlement identifiers

## Non-Negotiables

- Webhooks are signed machine events.
- OAuth is user authorization.
- WSL is local runtime only.
- Tunnels are temporary development connectivity only.
- Production uses Cloudflare Workers and custom domains.
- No frontend secret handling.
- No direct webhook-to-role assignment.
- No OAuth-only role assignment.
- No entitlement activation until payment and Discord identity are both verified.
- Every role sync should be auditable.
- Every side effect should be queue-driven.

## Mental Model

Use this when explaining the system quickly:

```text
Webhooks tell me what happened.
OAuth tells me who the user is.
Activation decides whether those two facts are allowed to bind.
Queues handle the side effects.
Discord bot executes the role change.
WSL and tunnels are just local development plumbing.
```

## Current Status

Completed:

- architecture note created
- OAuth route file created
- activation route file created
- storage note file created

Still required:

- mount routes in Worker entry
- update `wrangler.toml` public vars
- set Wrangler secrets
- replace raw `customer_id` activation with signed activation token
- implement Discord role sync consumer in `automation-core`
- add tests and audit logging
