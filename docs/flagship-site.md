# Flagship Site

The flagship site is the enterprise-first public website for `jaypventuresllc.com`. It is implemented as a dedicated Cloudflare Worker app in `apps/flagship-site` and keeps the creator/member and entitlement surfaces separate from the public marketing shell.

## Architectural Intent
- Root domain is the primary public presence.
- JayPVentures LLC remains the authority layer.
- `jaypventures` remains the proof and creator layer.
- Membership conversion routes through Stripe Checkout.
- Consultative and time-based offers route through Microsoft Bookings.
- Gated creator/member/admin surfaces remain outside the public site and are linked only as teaser or portal-gate destinations.

## Public Routes
- `/`
- `/services`
- `/pricing`
- `/ventures`
- `/creator`
- `/all-ventures-access`
- `/music`
- `/travel`
- `/partnerships`
- `/insights`
- `/insights/:slug`
- `/trust`
- `/contact`
- `/privacy`
- `/terms`
- `/GOVERNANCE.md`
- `/SECURITY.md`

## Content Modules
- `src/content/brands.ts`: shared dual-entity brand definitions
- `src/content/ctaMap.ts`: global CTA contract
- `src/content/offers.ts`: public offer schema and routeable offer definitions
- `src/content/memberships.ts`: membership tier exports and checkout routing
- `src/content/insights.ts`: code-managed editorial content
- `src/content/site.ts`: site metadata, navigation, proof points, trust pillars, venture signals
- `src/content/trust.ts`: public trust and policy summaries

## CTA Contract
The global CTA contract is defined in `src/content/ctaMap.ts`. Every public CTA should resolve to one of these types:
- `booking`
- `stripe_checkout`
- `application`
- `portal_gate`
- `internal_trust_doc`

This keeps routing explicit and prevents the public site from inventing ad hoc conversion behavior.

## Environment Values
The site Worker uses these variables in `apps/flagship-site/wrangler.toml`:
- `SITE_ORIGIN`
- `MICROSOFT_BOOKINGS_URL`
- `STRIPE_ALL_VENTURES_CORE_URL`
- `STRIPE_ALL_VENTURES_PLUS_URL`
- `STRIPE_ALL_VENTURES_INNER_CIRCLE_URL`
- `CREATOR_PORTAL_URL`
- `INNER_CIRCLE_PORTAL_URL`

The Stripe and portal URLs are intentionally placeholder values until the live checkout and gated destinations are finalized.

## Commands
- Local dev: `npm run dev:website`
- Dry-run packaging: `npm run deploy:dryrun:website`
- Deploy validation: `npm run validate:deploy:website`

## GitHub Actions
- CI validates the website packaging in `.github/workflows/ci.yml`
- Manual deploy flow lives in `.github/workflows/deploy-website.yml`
- Production environment remains `cloudflare-production`

## Canva Handoff
The repo now contains the structural system for the flagship site. The downstream Canva deliverables should be produced from this system, not the other way around.

Recommended Canva outputs:
- dual-brand master deck
- enterprise brand kit
- creator brand kit
- OG image set for root routes
- favicon and app icon set
- social promo tiles for Services, Ventures, Creator, and All Ventures Access
- partnership and pitch one-pagers

Keep visible labels as `JayPVentures LLC` / `jaypventures`, and keep machine slugs as `jaypventures`.
