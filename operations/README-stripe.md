# Stripe Integration README

This directory contains:
- stripe_control_map.yaml: Source of truth for all Stripe accounts (primary and duplicates)
- stripe_integration_checklist.md: Step-by-step checklist for Stripe cleanup and integration
- stripeAccount.ts: Utility for loading and using the control map in Node.js/TypeScript

**Operational Rule:**
Only the account marked as `primary_llc` in the control map should be wired to production webhooks and secrets. All others must be reviewed and archived before any integration.

**Automation:**
- The install-hooks.ps1 script now checks the control map and prints the primary Stripe account for wiring.
- Use stripeAccount.ts in any Node.js automation to enforce correct account usage.

**Next Steps:**
- Complete the checklist in stripe_integration_checklist.md
- Use the control map for all future Stripe automation, secrets, and deployment scripts.
