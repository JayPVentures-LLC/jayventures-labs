# jayventures-labs

Enterprise workspace for JayPVentures LLC systems, flagship website delivery, creator/member surfaces, Cloudflare Workers, Azure Function Apps, and operating documentation.

---

## Organization Repositories

| Repo | Visibility | Purpose |
|------|-----------|---------|
| [jayventures-labs](https://github.com/JayPVentures-LLC/jayventures-labs) | Private | This repo — monorepo for all active systems and automation |
| [jpv-discussions](https://github.com/JayPVentures-LLC/jpv-discussions) | Public | Community hub for ideas, feedback, and open conversation |
| [automation-core](https://github.com/JayPVentures-LLC/automation-core) | Internal | Standalone entitlement/Discord worker (production mirror) |

---

## Repository Tree

```
jayventures-labs/
├── apps/
│   └── flagship-site/              # Cloudflare Worker — jaypventuresllc.com
│       └── src/
│           ├── config/env.ts
│           ├── content/            # Brands, CTA, insights, memberships, offers, trust
│           ├── lib/render.ts
│           ├── pages/index.tsx
│           └── index.ts            # Worker entry point
│
├── docs/
│   ├── architecture.md             # System architecture and operating principles
│   ├── flagship-site.md
│   ├── github-setup.md
│   ├── github-settings-checklist.md
│   └── operations/
│       ├── azure-deployment-lane.md
│       └── azure-secrets-template.md
│
├── experiments/
│   └── universal-ui/               # Design system tokens and brand governance
│
├── functions/
│   └── jpv-event-processor/        # Azure Function App — Stripe → Cosmos → Discord
│       ├── function_app.py         # Queue trigger: stripe-events → entitlement upsert → Discord sync → audit
│       ├── host.json               # Queue: 5s poll, 5min visibility, batch 8, maxDequeue 5
│       ├── local.settings.example.json
│       ├── requirements.txt        # Pinned: azure-functions, azure-cosmos, requests, stripe
│       └── shared/
│           ├── entitlement_mapper.py   # Stripe event → entitlement record (entity/tier)
│           ├── discord_sync.py         # PUT/DELETE Discord role via API v10
│           └── audit.py                # Builds Cosmos audit_events document
│
├── JayPV-Operations/
│   └── infra/azure/                # Azure subscription + MFA provisioning scripts
│
├── operations/
│   ├── entitlement-system/         # Cloudflare Worker — Stripe webhooks + Discord roles
│   │   ├── config/
│   │   │   ├── accessTargets.ts    # Brand/tier → product mapping
│   │   │   ├── discordGuilds.ts    # Guild config keyed by Brand/Tier
│   │   │   ├── env.ts              # Env interface (Cloudflare bindings)
│   │   │   └── stripeEvents.ts     # Supported Stripe event types
│   │   ├── routes/
│   │   │   ├── activate.route.ts   # POST /activate — entitlement activation
│   │   │   ├── oauth.route.ts      # GET /oauth/discord/start + /callback
│   │   │   ├── discord-sync.route.ts
│   │   │   ├── admin.audit.route.ts
│   │   │   └── webhook.route.ts
│   │   ├── services/
│   │   │   ├── discordSync.service.ts    # syncDiscordRole + DiscordReflectionError
│   │   │   ├── entitlement.service.ts
│   │   │   ├── audit.service.ts
│   │   │   └── ...
│   │   ├── workers/
│   │   │   └── stripeWebhook.ts    # Worker fetch + queue consumer
│   │   └── wrangler.toml
│   ├── docs/
│   │   ├── automation-map.md
│   │   ├── bot-architecture.md
│   │   └── brand-routing.md
│   └── jpv_os_enforcement/         # JPV-OS brand enforcement engine
│
├── scripts/
│   ├── provision-entitlement-worker.ps1  # Guided METRICS_KV + secrets + dry-run deploy
│   ├── set-azure-secrets.ps1
│   ├── set-azure-secrets-org.ps1
│   ├── setup-dev-vars.ps1
│   └── validate-deploy-config.mjs        # Pre-deploy placeholder validation
│
├── tests/
│   ├── entitlement-system.test.ts  # 19 tests: queue, Discord sync, activation flow
│   ├── flagship-site.test.ts
│   └── wix-bookings.test.ts
│
├── wix/
│   └── bookings/                   # Cloudflare Worker — Unified Intake Engine
│       └── src/
│           ├── core/               # CRM, metrics, idempotency, SharePoint, Stripe
│           ├── routes/             # intake, inner-circle, creator portal
│           └── index.ts            # Worker entry point
│
├── .github/workflows/
│   ├── ci.yml                      # Test + typecheck on every push
│   ├── deploy-workers.yml          # Validate → deploy entitlement + bookings workers
│   ├── deploy-website.yml
│   ├── enforce-brand.yml
│   ├── jpv-os-enforcement.yml
│   └── stripe-audit.yml
│
├── GOVERNANCE.md
├── SECURITY.md
├── package.json                    # Root — all workers share this package
├── tsconfig.json
└── vitest.config.ts
```

---

## Active Systems

### 1. Entitlement System
**Location:** `operations/entitlement-system`
**Runtime:** Cloudflare Worker (`jpv-entitlement-worker`)
**Entry point:** `workers/stripeWebhook.ts`

**Routes:**
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/webhook/stripe` | Stripe signature verify → KV entitlement upsert → Discord sync |
| `GET` | `/oauth/discord/start` | Initiate Discord OAuth flow |
| `GET` | `/oauth/discord/callback` | Complete OAuth → link Discord user → queue role sync |
| `POST` | `/activate` | Activate entitlement after payment + OAuth |
| `POST` | `/admin/override` | Admin manual grant/revoke/tier change |
| `POST` | `/admin/discord-sync` | Admin on-demand Discord sync or KV retry drain |
| `GET` | `/health` | Lightweight health check |

**Queue consumer:** handles `STRIPE_ENTITLEMENT_SYNCED` (Discord role PUT/DELETE), `discord-retry`, and Azure archive/telemetry fan-out.

**KV bindings:** `ENTITLEMENT_KV`, `IDEMPOTENCY_KV`, `RETRY_QUEUE_KV`, `METRICS_KV`

**Architecture:**
- Stripe is billing truth
- KV is entitlement state
- Queue is execution authority
- Discord is a downstream reflection — no cross-layer leakage

---

### 2. Azure Function App Processor
**Location:** `functions/jpv-event-processor`
**Runtime:** Python 3, Azure Functions
**Deployment target:** `jpv-prod-event-processor` in `rg-jpv-prod-monetization`

The Logic App stays thin (receive Stripe webhook → push to `stripe-events` queue → stop). This Function App is the processor that closes the revenue loop:

```
Stripe → Logic App (ingest) → Azure Queue (stripe-events)
      → Function App → Cosmos DB (entitlements)
                     → Discord (role sync)
                     → Cosmos DB (audit_events)
```

**Supported Stripe events:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

**Required env vars:**
- `COSMOS_ENDPOINT`, `COSMOS_KEY`
- `DISCORD_BOT_TOKEN`
- `DISCORD_CREATOR_GUILD_ID`, `DISCORD_LABS_GUILD_ID`, `DISCORD_ENTERPRISE_GUILD_ID`
- `DISCORD_ROLE_COMMUNITY_ID`, `DISCORD_ROLE_VIP_ID`, `DISCORD_ROLE_LABS_MEMBER_ID`, `DISCORD_ROLE_ENTERPRISE_CLIENT_ID`
- `AzureWebJobsStorage`

---

### 3. Flagship Website
**Location:** `apps/flagship-site`
**Runtime:** Cloudflare Worker
**Entry point:** `src/index.ts`
**Domain:** `jaypventuresllc.com`

**Public routes:** `/`, `/services`, `/pricing`, `/ventures`, `/creator`, `/all-ventures-access`, `/music`, `/travel`, `/partnerships`, `/insights`, `/insights/:slug`, `/trust`, `/contact`, `/privacy`, `/terms`, `/GOVERNANCE.md`, `/SECURITY.md`

---

### 4. Unified Intake Engine
**Location:** `wix/bookings`
**Runtime:** Cloudflare Worker
**Entry point:** `src/index.ts`

**Routes:** `POST /webhook/intake`, `GET /metrics`, `GET /inner-circle`, `GET /inner-circle/metrics`, `POST /inner-circle/backfill`, `GET /creator`, `GET /creator/metrics`, `POST /creator/upload`

---

## Local Development

```bash
# Install dependencies
npm install

# Copy dev secrets templates
pwsh scripts/setup-dev-vars.ps1

# Fill in real values in .dev.vars files and wrangler.toml KV IDs

# Run tests
npm test

# Typecheck
npm run typecheck

# Start a worker locally
npm run dev:website
npm run dev:entitlement
# For bookings, run wrangler dev directly:
#   npx wrangler dev --config wix/bookings/wrangler.toml --env production

# Validate packaging without deploying
npm run deploy:dryrun:website
npm run deploy:dryrun:entitlement
npm run deploy:dryrun:bookings
```

---

## Deployment

### Entitlement Worker — First-time provisioning

Use the guided PowerShell script to create the KV namespace and set all required secrets:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/provision-entitlement-worker.ps1
```

The script prompts for each value interactively and runs a dry-run to validate before live deploy.

**Manual steps (if not using the script):**

```bash
# 1. Create METRICS_KV namespace
npx wrangler kv namespace create METRICS_KV
# Update the returned ID in operations/entitlement-system/wrangler.toml

# 2. Set Worker secrets
npx wrangler secret put DISCORD_BOT_TOKEN --name jpv-entitlement-worker
npx wrangler secret put DISCORD_GUILD_ID --name jpv-entitlement-worker
npx wrangler secret put DISCORD_ROLE_COMMUNITY_ID --name jpv-entitlement-worker
npx wrangler secret put DISCORD_ROLE_VIP_ID --name jpv-entitlement-worker
npx wrangler secret put DISCORD_CLIENT_ID --name jpv-entitlement-worker
npx wrangler secret put DISCORD_CLIENT_SECRET --name jpv-entitlement-worker
npx wrangler secret put DISCORD_OAUTH_REDIRECT_URI --name jpv-entitlement-worker
npx wrangler secret put PUBLIC_BASE_URL --name jpv-entitlement-worker
npx wrangler secret put OAUTH_STATE_SECRET --name jpv-entitlement-worker
npx wrangler secret put ACTIVATION_TOKEN_SECRET --name jpv-entitlement-worker
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name jpv-entitlement-worker
npx wrangler secret put INTERNAL_SYNC_TOKEN --name jpv-entitlement-worker

# 3. Deploy
npx wrangler deploy --config operations/entitlement-system/wrangler.toml
```

### Azure Function App

```bash
cd functions/jpv-event-processor
cp local.settings.example.json local.settings.json
# Fill in all values in local.settings.json

# Deploy to Azure
func azure functionapp publish jpv-prod-event-processor
```

### CI/CD Workflows

All deployments run through `.github/workflows/deploy-workers.yml` which enforces the pattern:
`validate:deploy:<target>` → secret inject → wrangler deploy

---

## Trust and Governance

- [GOVERNANCE.md](GOVERNANCE.md)
- [SECURITY.md](SECURITY.md)
- [docs/architecture.md](docs/architecture.md)
- [operations/entitlement-system/README.md](operations/entitlement-system/README.md)

---

## Promotion Policy

Code and documentation in this repository remain experimental until deployed, verified, and promoted into a dedicated production repository or platform environment. The `automation-core` repo is the production mirror for the entitlement worker.
