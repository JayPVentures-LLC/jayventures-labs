export const governanceMarkdown = `# GOVERNANCE.md

## JayPVentures LLC Governance Principles

JayPVentures LLC operates under a governance-by-design model intended to keep systems auditable, resilient, and aligned with long-term trust.

### Core principles
- Systemic integrity: important actions and controls should remain traceable and reviewable.
- Adaptive oversight: human and AI oversight should scale with the risk and impact of the work.
- Transparency: governance logic and review paths should be understandable to operators and stakeholders.
- Resilience: controls should adapt as threats, tools, and regulations evolve.
- Auditability: evidence, routing, and administrative actions should support later review.

### Risk tiers
- Tier 1: existential risks
- Tier 2: strategic risks
- Tier 3: operational risks
- Tier 4: peripheral risks

### Responsible disclosure
Security vulnerabilities or governance issues can be reported confidentially to jayhere@jaypventuresllc.com.
`;

export const securityMarkdown = `# SECURITY.md

## Scope
This security policy applies to the public website, entitlement system, bookings worker, and related automation surfaces in the JayPVentures ecosystem.

## Security expectations
- Signed webhooks for external event sources
- Idempotency on retried external events
- Authenticated admin routes for privileged operations
- Structured logging for sensitive state changes
- Environment validation before startup
- No committed live secrets or private credentials
- Least-privilege credentials across Cloudflare, Stripe, Discord, Microsoft 365, and related systems

## Reporting
Report vulnerabilities confidentially to jayhere@jaypventuresllc.com.
Include reproduction steps, affected surfaces, and any evidence that helps triage safely.

## Disclosure process
JayPVentures LLC follows a review-first disclosure model: detect, assess, contain, remediate, verify, and then document.
`;

export const privacySummary = [
  "JayPVentures LLC collects only the information needed to operate bookings, memberships, inquiries, and related digital services.",
  "Submitted information may be processed through Cloudflare, Stripe, Microsoft 365, and other infrastructure providers directly involved in delivery, analytics, or support.",
  "Operational data may be retained for service continuity, fraud prevention, auditing, legal compliance, and performance analysis.",
  "For privacy requests or questions, contact venture@jaypventuresllc.com.",
];

export const termsSummary = [
  "Public site content is informational and subject to change as the ecosystem evolves.",
  "Consultative engagements, memberships, digital products, and custom services may carry additional terms at purchase or intake.",
  "JayPVentures LLC may refuse, pause, or terminate service where abuse, payment failure, security risk, or policy conflict is present.",
  "Use of gated member or admin surfaces is restricted to authorized users and may be logged for operational and security purposes.",
];
