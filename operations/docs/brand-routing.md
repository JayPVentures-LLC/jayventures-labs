# Brand Routing

## Routing Goal
Ensure every user interaction is routed to the correct brand, offer lane, and backend workflow without relying on manual interpretation.

## Brand Definitions

### jaypventuresllc
Use when the interaction concerns:
- consulting
- enterprise systems
- governance or auditability
- strategy sessions
- partnerships tied to JAYPVENTURES LLC

Primary downstream actions:
- route to Microsoft Bookings consultation flow
- store service/lead records in operational systems
- present governance and trust materials

### jaypventures
Use when the interaction concerns:
- creator services
- memberships and community offers
- media, travel, music, or creator-facing ventures
- Inner Circle and creator portal access

Primary downstream actions:
- route through the unified intake engine
- maintain creator metrics and member records
- support recurring offer lanes such as All Ventures Access

## Deterministic Routing Rules
- Bookings service names beginning with `JayPVentures LLC` route to the `JayPVentures LLC` lane.
- Bookings service names beginning with `All Ventures Access` route to the recurring membership lane.
- Stripe entitlement metadata must include `brand` and `tier`; missing metadata is treated as an error.
- Memberstack membership events always route to `All Ventures Access` and infer tier from plan naming.
- Manual admin events must declare an explicit lane.

## UX Routing Rules
- Enterprise consultation CTAs should resolve to the Microsoft Bookings link for `JAYPVENTURESLLCConsultations1@jaypventuresllc.com`.
- Trust links should surface governance documentation anywhere enterprise offers are presented.
- Creator consultation CTAs should point to the same live scheduling system until a separate creator booking flow exists.

## Backend Routing Rules
- Entitlement changes always persist before Discord synchronization.
- Creator metrics and Inner Circle membership remain inside the bookings worker boundary.
- Discord role mappings are brand-specific; roles from one brand should never be reused in the other guild.

## Failure Handling
- Unknown booking names fall back to the `UNKNOWN` lane and still produce a CRM record.
- Duplicate external events are ignored by KV-backed idempotency guards.
- Failed Discord mutations become retry tasks rather than blocking the underlying entitlement update.
- Missing integration credentials in the bookings worker produce explicit `skipped` integration results for operators.
