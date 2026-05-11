# JPV-OS Azure Monetization Stack

Cost-controlled Azure serverless infrastructure for JayPVentures LLC, jaypVLabs, and jaypventures.

## Architecture

| Resource | Name | Purpose |
|---|---|---|
| Resource Group | `rg-jpv-prod-monetization` | Logical container for all resources |
| Container App | `jpv-api-gateway` | Public API (Stripe webhooks, entitlements, Discord sync, intake routing) |
| Azure Function | `jpv-event-processor` | Queue-triggered Stripe lifecycle event handler |
| Storage Account | `jpvprodstorage` | Queues, logs, audit storage |
| Queue | `stripe-events` | Durable event handoff webhook → processor |
| Cosmos DB Serverless | `jpv-entitlements-db` | Entitlements, customers, audit_events, products |
| Application Insights | `jpv-observability` | Logs, failures, latency, revenue visibility |

## API Endpoints (`jpv-api-gateway`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/webhook/stripe` | Verify Stripe signature → audit record → queue push |
| `POST` | `/entitlements/sync` | Recalculate entitlements from Stripe subscription data |
| `GET` | `/user/access` | Signed JWT → active products, tier, expiration, access scope |
| `POST` | `/discord/sync` | Assign/remove Discord roles from entitlement tier |
| `POST` | `/intake/enterprise` | JayPVentures LLC enterprise leads (TIN-aligned) |
| `POST` | `/intake/labs` | jaypVLabs research/education leads (SSN-aligned) |
| `POST` | `/intake/creator` | jaypventures creator community leads (SSN-aligned) |

## Deployment

### Prerequisites

Add the following GitHub Secrets (Settings → Secrets → Actions):

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Service principal App ID (OIDC federated credential) |
| `AZURE_TENANT_ID` | Azure Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |
| `AZURE_ACR_NAME` | Azure Container Registry name (without `.azurecr.io`) |
| `AZURE_ACR_LOGIN_SERVER` | ACR login server (e.g. `jpvprodacr.azurecr.io`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe Dashboard → Webhooks |
| `STRIPE_SECRET_KEY` | `sk_live_...` Stripe secret key |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_GUILD_ID` | Discord server (guild) ID |
| `DISCORD_ROLE_COMMUNITY_ID` | Discord community role ID |
| `DISCORD_ROLE_VIP_ID` | Discord VIP role ID |
| `JPV_JWT_SECRET` | Random 64-char secret for signing access tokens |

### Run Deployment

```bash
# Via GitHub Actions UI:
# Actions → "Provision Azure Monetization Stack" → Run workflow → action: deploy

# Or via GitHub CLI:
gh workflow run provision-azure-monetization.yml -f action=deploy
```

### Validate Only (dry-run)

```bash
gh workflow run provision-azure-monetization.yml -f action=validate
```

## Cost Estimate (within $200 Azure credit)

| Resource | Tier | Est. Monthly Cost |
|---|---|---|
| Container Apps | Consumption (0–3 replicas) | ~$0–15 |
| Azure Functions | Consumption Y1 | ~$0–5 |
| Storage Account | Standard LRS | ~$1–3 |
| Cosmos DB Serverless | Pay-per-request | ~$2–10 |
| Application Insights | Basic sampling | ~$0–5 |
| **Total** | | **~$3–38/month** |

## Entity Revenue Alignment

| Entity | Revenue Type | Intake Route |
|---|---|---|
| JayPVentures LLC | TIN-aligned (corporate) | `POST /intake/enterprise` |
| jaypVLabs | SSN-aligned (individual/research) | `POST /intake/labs` |
| jaypventures | SSN-aligned (creator/community) | `POST /intake/creator` |
