export interface BrandProfile {
  slug: string;
  label: string;
  mode: "llc" | "creator";
  promise: string;
  audience: string;
  palette: string[];
  motion: string;
}

export const brandProfiles: BrandProfile[] = [
  {
    slug: "jaypventuresllc",
    label: "JayPVentures LLC",
    mode: "llc",
    promise: "Strategic systems, governance, and revenue infrastructure for organizations that require control, accountability, and durable execution.",
    audience: "Founders, operators, regulated innovators, premium service buyers, and senior collaborators.",
    palette: ["#f3efe8", "#111827", "#7a1f2a", "#ffffff"],
    motion: "Restrained editorial pacing with minimal ornament and strong hierarchy.",
  },
  {
    slug: "jaypventures",
    label: "jaypventures",
    mode: "creator",
    promise: "A public-facing creator and membership brand operated with the same commercial and governance discipline as the primary firm.",
    audience: "Members, supporters, collaborators, and creator-facing commercial partners.",
    palette: ["#f8f5f0", "#1d4c8f", "#111827", "#ffffff"],
    motion: "Controlled contrast and sharper pacing, without breaking the primary enterprise shell.",
  },
];
