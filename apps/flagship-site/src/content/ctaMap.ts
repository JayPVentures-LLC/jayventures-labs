import type { CtaLink } from "./types";
import type { Env } from "../config/env";

export type GlobalCtaKey =
  | "enterpriseDiscovery"
  | "ecosystemOverview"
  | "servicesOverview"
  | "pricingOverview"
  | "trustCenter"
  | "governanceDoc"
  | "securityDoc"
  | "contactRouting"
  | "enterpriseApplication"
  | "creatorApplication"
  | "musicApplication"
  | "travelApplication"
  | "membershipCore"
  | "membershipPlus"
  | "membershipInnerCircle"
  | "creatorPortal"
  | "innerCirclePortal";

export function buildCtaMap(env: Env): Record<GlobalCtaKey, CtaLink> {
  return {
    enterpriseDiscovery: {
      label: "Schedule Consultation",
      type: "booking",
      destination: env.MICROSOFT_BOOKINGS_URL,
    },
    ecosystemOverview: {
      label: "View Ventures",
      type: "application",
      destination: "/ventures",
    },
    servicesOverview: {
      label: "Review Services",
      type: "application",
      destination: "/services",
    },
    pricingOverview: {
      label: "Review Pricing",
      type: "application",
      destination: "/pricing",
    },
    trustCenter: {
      label: "Review Trust Center",
      type: "internal_trust_doc",
      destination: "/trust",
    },
    governanceDoc: {
      label: "Read GOVERNANCE.md",
      type: "internal_trust_doc",
      destination: "/GOVERNANCE.md",
    },
    securityDoc: {
      label: "Read SECURITY.md",
      type: "internal_trust_doc",
      destination: "/SECURITY.md",
    },
    contactRouting: {
      label: "Open Contact Routing",
      type: "application",
      destination: "/contact",
    },
    enterpriseApplication: {
      label: "Request Enterprise Scope",
      type: "application",
      destination: "/contact#apply-enterprise",
    },
    creatorApplication: {
      label: "Request Creator Scope",
      type: "application",
      destination: "/contact#apply-creator",
    },
    musicApplication: {
      label: "Request Music Scope",
      type: "application",
      destination: "/contact#apply-music",
    },
    travelApplication: {
      label: "Request Travel Scope",
      type: "application",
      destination: "/contact#apply-travel",
    },
    membershipCore: {
      label: "Subscribe to Core",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_CORE_URL,
    },
    membershipPlus: {
      label: "Subscribe to Plus",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_PLUS_URL,
    },
    membershipInnerCircle: {
      label: "Subscribe to Inner Circle",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_INNER_CIRCLE_URL,
    },
    creatorPortal: {
      label: "Access Creator Portal",
      type: "portal_gate",
      destination: env.CREATOR_PORTAL_URL,
      note: "Restricted to approved creator and member access.",
    },
    innerCirclePortal: {
      label: "Access Inner Circle Portal",
      type: "portal_gate",
      destination: env.INNER_CIRCLE_PORTAL_URL,
      note: "Restricted premium access for Inner Circle members and authorized operators.",
    },
  };
}
