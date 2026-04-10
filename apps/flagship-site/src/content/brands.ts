import type { BrandMode } from "./types";

export interface BrandProfile {
  slug: string;
  label: string;
  mode: BrandMode;
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
    promise: "Governance-by-design, monetization architecture, and enterprise-grade execution.",
    audience: "Founders, operators, regulated innovators, premium service buyers, and serious collaborators.",
    palette: ["#07090c", "#b11226", "#e6d0a0", "#f4f4f1"],
    motion: "Restrained editorial pacing with clean hierarchy and deliberate reveals.",
  },
  {
    slug: "jaypventures",
    label: "jaypventures",
    mode: "creator",
    promise: "Creator momentum, recurring community, and public proof built on the same operating backbone.",
    audience: "Supporters, creators, collaborators, members, and audience communities moving toward deeper access.",
    palette: ["#06080b", "#4f7bd0", "#9ac4ff", "#f4f4f1"],
    motion: "Sharper nocturnal energy with stronger contrast and more visible rhythm.",
  },
];
