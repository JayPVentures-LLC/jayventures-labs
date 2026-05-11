# JayPVentures Automation Architecture

## Purpose
This workspace supports a **tri-entity operating model**:
- **JayPVentures LLC** (`jaypventuresllc`): enterprise services, consulting, governance, and high-ticket offers (TIN-aligned revenue)
- **jaypVLabs**: research, education, labs, scholarship-grade products (SSN-aligned unless incorporated)
- **jaypventures**: creator-facing community, memberships, media, and venture expansion (SSN-aligned revenue)

The architecture keeps customer-facing capture layers simple while pushing durable business logic into versioned worker code and documented automation paths.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐               │
│  │ Stripe  │   │ Discord │   │   Wix   │   │ MS 365  │   │ Clients │               │
│  │ Billing │   │   Bot   │   │Bookings │   │SharePt  │   │ (Web)   │               │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘               │
│       │             │             │             │             │                     │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE EDGE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐   ┌──────────────────────────────┐               │
│  │   Entitlement Worker         │   │   Bookings Worker            │               │
│  │   /webhook/stripe            │   │   /intake/*                  │               │
│  │   /oauth/discord/*           │   │   /metrics                   │               │
│  │   /activate                  │   │   /backfill                  │               │
│  │   /admin/override            │   │                              │               │
│  │   /admin/discord-sync        │   │                              │               │
│  └──────────────┬───────────────┘   └──────────────┬───────────────┘               │
│                 │                                   │                               │
│  ┌──────────────┴───────────────────────────────────┴───────────────┐               │
│  │                    Cloudflare KV Storage                          │               │
│  │  ENTITLEMENT_KV │ IDEMPOTENCY_KV │ METRICS_KV │ RETRY_QUEUE_KV   │               │
│  └──────────────────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────────┘
        │
        │ STRIPE_ENTITLEMENT_SYNCED events
        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AZURE MONETIZATION STACK                                   │
│                         (rg-jpv-prod-monetization)                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    jpv-api-gateway (Container App)                            │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │   │
│  │  │ POST           │ │ POST           │ │ GET            │ │ POST           │ │   │
│  │  │ /webhook/stripe│ │ /entitlements/ │ │ /user/access   │ │ /discord/sync  │ │   │
│  │  │                │ │ sync           │ │                │ │                │ │   │
│  │  └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │   │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                    │   │
│  │  │ POST           │ │ POST           │ │ POST           │                    │   │
│  │  │ /intake/       │ │ /intake/labs   │ │ /intake/       │                    │   │
│  │  │ enterprise     │ │                │ │ creator        │                    │   │
│  │  └────────────────┘ └────────────────┘ └────────────────┘                    │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                 │                                                                    │
│                 ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    jpvprodstorage (Storage Account)                           │   │
│  │  ┌────────────────────────┐   ┌────────────────────────┐                     │   │
│  │  │ stripe-events queue    │   │ audit-logs queue       │                     │   │
│  │  └───────────┬────────────┘   └────────────────────────┘                     │   │
│  └──────────────┼───────────────────────────────────────────────────────────────┘   │
│                 │                                                                    │
│                 ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    jpv-event-processor (Azure Function)                       │   │
│  │  Queue-triggered handler for Stripe lifecycle events                         │   │
│  │  • customer.subscription.created/updated → grant entitlement + Discord role  │   │
│  │  • customer.subscription.deleted/paused → revoke entitlement + Discord role  │   │
│  │  • invoice.paid / invoice.payment_failed → audit logging                     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                 │                                                                    │
│                 ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    jpv-entitlements-db (Cosmos DB Serverless)                 │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                 │   │
│  │  │entitlements│ │ customers  │ │audit_events│ │  products  │                 │   │
│  │  │/subject_id │ │/stripe_cust│ │/subject_id │ │/product_id │                 │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    jpv-observability (Application Insights)                   │   │
│  │  Logs • Failures • Latency • Revenue automation visibility                   │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Systems

### 1. Entitlement and Access (Cloudflare Edge)
- Runtime: Cloudflare Worker in `operations/entitlement-system`
- Inbound source: Stripe events
- Persistence: Cloudflare KV (`ENTITLEMENT_KV`, `IDEMPOTENCY_KV`, optional `RETRY_QUEUE_KV`)
- Responsibilities:
  - verify Stripe signatures
  - normalize Stripe metadata into brand and tier entitlements
  - persist user access state across both brands
  - reconcile Discord roles via reflection service
  - support audited admin overrides and retry handling
  - emit `STRIPE_ENTITLEMENT_SYNCED` events to Azure queue

### 2. Azure Monetization Stack
- Resource Group: `rg-jpv-prod-monetization`
- Components:
  - **jpv-api-gateway** (Container App): Public API for Stripe webhooks, entitlement sync, Discord sync, and intake routing
  - **jpv-event-processor** (Azure Function): Queue-triggered Stripe lifecycle event handler
  - **jpvprodstorage** (Storage Account): Queues and audit storage
  - **jpv-entitlements-db** (Cosmos DB Serverless): Entitlements, customers, audit_events, products
  - **jpv-observability** (Application Insights): Logs, failures, latency, revenue visibility
- Responsibilities:
  - durable event processing with retry semantics
  - centralized entitlement state in Cosmos DB
  - Discord role sync with transient error retry
  - lead intake routing by entity (enterprise/labs/creator)
  - audit trail for all consequential actions

### 3. Unified Intake Engine
- Runtime: Cloudflare Worker in `wix/bookings`
- Inbound sources: Bookings, Stripe, Memberstack, admin events
- Persistence: Cloudflare KV for idempotency, metrics, creator data, and Inner Circle member IDs
- Responsibilities:
  - validate intake HMAC signatures
  - normalize events into CRM records
  - route records to SharePoint, Stripe, email, and data lake integrations
  - maintain revenue and booking metrics
  - support Inner Circle and creator portal workflows

### 4. Website and Trust Layer
- Static previews: `website_preview.html`, `jaypventures_dual_brand_preview.html`
- Draft Next.js export: `operations/home_page.tsx`
- Governance artifacts: `GOVERNANCE.md` and referenced `SECURITY.md`
- Responsibilities:
  - present service offers and trust signals
  - route leads into Bookings and intake flows
  - surface governance posture and contact details consistently

---

## Entity Revenue Alignment

| Entity | Brand Key | Revenue Type | Discord Guild | Intake Route |
|--------|-----------|--------------|---------------|--------------|
| JayPVentures LLC | `jaypventuresllc` | TIN-aligned (corporate) | `DISCORD_GUILD_ID_LABS` | `POST /intake/enterprise` |
| jaypVLabs | — | SSN-aligned (individual/research) | `DISCORD_GUILD_ID_LABS` | `POST /intake/labs` |
| jaypventures | `jaypventures` | SSN-aligned (creator/community) | `DISCORD_GUILD_ID_CREATOR` | `POST /intake/creator` |

---

## Discord Role Mapping

| Brand | Guild Purpose | Tier Roles |
|-------|---------------|------------|
| `jaypventures` | Creator ecosystem | community, vip, member |
| `jaypventuresllc` | Labs/institutional | partner, admin, labs, institute, business |

---

## Operating Principles
- Capture at the edge, validate centrally.
- Use idempotency for every external event source.
- Keep brand routing explicit rather than inferred.
- Persist customer access state before attempting side effects.
- Treat Discord role sync as eventually consistent with retries.
- Keep website and automation documentation in the same workspace as implementation.
- Maintain audit trails for all consequential actions (JPV-OS requirement).

---

## High-Level Data Flow

### Stripe → Entitlement → Discord Flow
```
1. Customer subscribes via Stripe
2. Stripe webhook → Cloudflare Worker (signature verified)
3. Worker normalizes event → persists to KV
4. Worker emits STRIPE_ENTITLEMENT_SYNCED → Azure Queue
5. Azure Function processes queue message
6. Function upserts entitlement to Cosmos DB
7. Function syncs Discord role (grant/revoke)
8. Audit record written to Cosmos audit_events
```

### Lead Intake Flow
```
1. Lead submits form (enterprise/labs/creator)
2. Request → jpv-api-gateway Container App
3. Gateway validates required fields
4. Gateway writes lead record to Cosmos customers container
5. Lead routed to appropriate entity based on intake type
```

---

## Deployment Boundaries

### Cloudflare (Edge)
- Workers host the active automation code for webhook verification and edge processing
- KV provides fast, globally distributed state storage
- Handles initial Stripe signature verification and event normalization

### Azure (Core)
- Container Apps host the API gateway for durable processing
- Azure Functions handle queue-triggered event processing
- Cosmos DB provides serverless document storage for entitlements and audit
- Application Insights provides observability and alerting
- Storage Queues provide durable event handoff

### Microsoft 365
- SharePoint remains downstream system of record for selected workflows
- Power Automate handles creator weekly digest and notification flows

### Static Assets
- Website previews in this repo are launch artifacts, not the deployed site itself

---

## Cost Estimate (Azure Monetization Stack)

| Resource | Tier | Est. Monthly Cost |
|----------|------|-------------------|
| Container Apps | Consumption (0–3 replicas) | ~$0–15 |
| Azure Functions | Consumption Y1 | ~$0–5 |
| Storage Account | Standard LRS | ~$1–3 |
| Cosmos DB Serverless | Pay-per-request | ~$2–10 |
| Application Insights | Basic sampling | ~$0–5 |
| **Total** | | **~$3–38/month** |

---

## Verification Strategy
- Unit/integration tests cover worker auth, idempotency, normalization, metrics, backfill, entitlement sync, and retry behavior.
- Launch checklist items that require live infrastructure remain external validation tasks even when the code and copy are ready in-repo.
- Azure deployment validated via `provision-azure-monetization.yml` workflow (validate/deploy/destroy actions).
- Discord brand mapping validated via `validate:discord-brand-map` CI gate.

---

## Required GitHub Secrets

### Cloudflare
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for Workers deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### Azure
| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | Service principal App ID (OIDC federated credential) |
| `AZURE_TENANT_ID` | Azure Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |
| `AZURE_ACR_NAME` | Azure Container Registry name |
| `AZURE_ACR_LOGIN_SERVER` | ACR login server (e.g. `jpvprodacr.azurecr.io`) |

### Stripe
| Secret | Description |
|--------|-------------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe Dashboard → Webhooks |
| `STRIPE_SECRET_KEY` | `sk_live_...` Stripe secret key |

### Discord
| Secret | Description |
|--------|-------------|
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_GUILD_ID` | Discord server (guild) ID |
| `DISCORD_ROLE_COMMUNITY_ID` | Discord community role ID |
| `DISCORD_ROLE_VIP_ID` | Discord VIP role ID |

### Application
| Secret | Description |
|--------|-------------|
| `JPV_JWT_SECRET` | Random 64-char secret for signing access tokens |

---

## Deployment Commands

### Azure Monetization Stack
```bash
# Validate only (dry-run)
gh workflow run provision-azure-monetization.yml -f action=validate

# Deploy to production
gh workflow run provision-azure-monetization.yml -f action=deploy

# Destroy resources
gh workflow run provision-azure-monetization.yml -f action=destroy
```

### Cloudflare Workers
```bash
# Entitlement system
npm run deploy:dryrun:entitlement
npm run deploy:entitlement

# Bookings worker
npm run deploy:dryrun:bookings
npm run deploy:bookings

# Website
npm run deploy:dryrun:website
npm run deploy:website
```
