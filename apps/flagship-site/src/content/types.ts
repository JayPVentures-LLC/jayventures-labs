export type BrandMode = "llc" | "creator";

export type CtaType =
  | "booking"
  | "stripe_checkout"
  | "application"
  | "portal_gate"
  | "internal_trust_doc";

export type PublicRoute =
  | "/"
  | "/services"
  | "/pricing"
  | "/ventures"
  | "/creator"
  | "/all-ventures-access"
  | "/music"
  | "/travel"
  | "/partnerships"
  | "/insights"
  | "/trust"
  | "/contact"
  | "/privacy"
  | "/cookies"
  | "/terms"
  | "/GOVERNANCE.md"
  | "/SECURITY.md";

export interface CtaLink {
  label: string;
  type: CtaType;
  destination: string;
  note?: string;
}

export interface Offer {
  brand: "jaypventuresllc" | "jaypventures" | "all_ventures_access" | "jaypventures_music" | "jaypventures_travel";
  lane: string;
  publicSlug: string;
  title: string;
  summary: string;
  displayedPrice: string;
  ctaType: CtaType;
  ctaDestination: string;
  qualificationRule: string;
  ctaLabel: string;
  badges?: string[];
}

export interface MembershipTier {
  slug: string;
  title: string;
  price: string;
  audience: string;
  summary: string;
  includes: string[];
  checkoutKey: "core" | "plus" | "innerCircle";
}

export interface InsightArticle {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  sections: Array<{ heading: string; body: string[] }>;
}
