# JayVentures Automation Architecture

## Purpose
This workspace supports a dual-brand operating model:
- `jaypventuresllc`: enterprise services, consulting, governance, and high-ticket offers
- `jaypventures`: creator-facing community, memberships, media, and venture expansion

The architecture keeps customer-facing capture layers simple while pushing durable business logic into versioned worker code and documented automation paths.

## Core Systems

### 1. Entitlement and Access
- Runtime: Cloudflare Worker in `operations/entitlement-system`
- Inbound source: Stripe events
- Persistence: Cloudflare KV (`ENTITLEMENT_KV`, `IDEMPOTENCY_KV`, optional `RETRY_QUEUE_KV`)
- Responsibilities:
  - verify Stripe signatures
  - normalize Stripe metadata into brand and tier entitlements
  - persist user access state across both brands
  - reconcile Discord roles
  - support audited admin overrides and retry handling

### 2. Unified Intake Engine
- Runtime: Cloudflare Worker in `wix/bookings`
- Inbound sources: Bookings, Stripe, Memberstack, admin events
- Persistence: Cloudflare KV for idempotency, metrics, creator data, and Inner Circle member IDs
- Responsibilities:
  - validate intake HMAC signatures
  - normalize events into CRM records
  - route records to SharePoint, Stripe, email, and data lake integrations
  - maintain revenue and booking metrics
  - support Inner Circle and creator portal workflows

### 3. Website and Trust Layer
- Static previews: `website_preview.html`, `jaypventures_dual_brand_preview.html`
- Draft Next.js export: `operations/home_page.tsx`
- Governance artifacts: `GOVERNANCE.md` and referenced `SECURITY.md`
- Responsibilities:
  - present service offers and trust signals
  - route leads into Bookings and intake flows
  - surface governance posture and contact details consistently

## Operating Principles
- Capture at the edge, validate centrally.
- Use idempotency for every external event source.
- Keep brand routing explicit rather than inferred.
- Persist customer access state before attempting side effects.
- Treat Discord role sync as eventually consistent with retries.
- Keep website and automation documentation in the same workspace as implementation.

## High-Level Data Flow
1. A customer books, pays, or joins.
2. The inbound event is verified.
3. The system normalizes the payload into a stable internal model.
4. KV storage is updated first.
5. Downstream integrations run after persistence.
6. Metrics and logs are written for operator visibility.
7. Manual overrides remain available through authenticated admin routes.

## Deployment Boundaries
- Cloudflare Workers host the active automation code.
- Microsoft 365 and SharePoint remain downstream systems of record for selected workflows.
- Website previews in this repo are launch artifacts, not the deployed site itself.

## Verification Strategy
- Unit/integration tests cover worker auth, idempotency, normalization, metrics, backfill, entitlement sync, and retry behavior.
- Launch checklist items that require live infrastructure remain external validation tasks even when the code and copy are ready in-repo.
