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
      label: "Book a Discovery Call",
      type: "booking",
      destination: env.MICROSOFT_BOOKINGS_URL,
    },
    ecosystemOverview: {
      label: "Explore the Ecosystem",
      type: "application",
      destination: "/ventures",
    },
    servicesOverview: {
      label: "View Services",
      type: "application",
      destination: "/services",
    },
    pricingOverview: {
      label: "View Pricing",
      type: "application",
      destination: "/pricing",
    },
    trustCenter: {
      label: "Review Trust Center",
      type: "internal_trust_doc",
      destination: "/trust",
    },
    governanceDoc: {
      label: "Open GOVERNANCE.md",
      type: "internal_trust_doc",
      destination: "/GOVERNANCE.md",
    },
    securityDoc: {
      label: "Open SECURITY.md",
      type: "internal_trust_doc",
      destination: "/SECURITY.md",
    },
    contactRouting: {
      label: "Open Contact Routing",
      type: "application",
      destination: "/contact",
    },
    enterpriseApplication: {
      label: "Apply for Enterprise Build",
      type: "application",
      destination: "/contact#apply-enterprise",
    },
    creatorApplication: {
      label: "Apply for Creator Build",
      type: "application",
      destination: "/contact#apply-creator",
    },
    musicApplication: {
      label: "Apply for Music Build",
      type: "application",
      destination: "/contact#apply-music",
    },
    travelApplication: {
      label: "Apply for Travel Build",
      type: "application",
      destination: "/contact#apply-travel",
    },
    membershipCore: {
      label: "Join Core",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_CORE_URL,
    },
    membershipPlus: {
      label: "Join Plus",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_PLUS_URL,
    },
    membershipInnerCircle: {
      label: "Join Inner Circle",
      type: "stripe_checkout",
      destination: env.STRIPE_ALL_VENTURES_INNER_CIRCLE_URL,
    },
    creatorPortal: {
      label: "Open Creator Portal",
      type: "portal_gate",
      destination: env.CREATOR_PORTAL_URL,
      note: "Gated entry for approved creator and member access.",
    },
    innerCirclePortal: {
      label: "Open Inner Circle Portal",
      type: "portal_gate",
      destination: env.INNER_CIRCLE_PORTAL_URL,
      note: "Gated premium access for Inner Circle members and authorized operators.",
    },
  };
}
