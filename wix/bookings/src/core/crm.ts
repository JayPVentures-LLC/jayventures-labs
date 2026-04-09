import type { CRMRecord, Lane, Tier } from "../types/crm";
import { estimatePriceFromServiceName } from "./pricingCatalog";

function sanitize(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim();
}

function normalizeLane(lane: Lane): Lane {
  const allowed: Lane[] = [
    "JayPVentures LLC",
    "jaypventures creator",
    "All Ventures Access",
    "JayPVentures Music",
    "JayPVentures Travel",
    "UNKNOWN",
  ];
  return allowed.includes(lane) ? lane : "UNKNOWN";
}

function normalizeTier(tier: Tier): Tier {
  if (!tier) return null;

  if (tier === "Core") return "Core";
  if (tier === "Plus") return "Plus";
  if (tier === "Inner Circle") return "Inner Circle";

  return null;
}

function normalizeRevenue(value?: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Number.isFinite(value)) return undefined;
  return Math.round(value * 100) / 100;
}

function computeLeadScore(record: CRMRecord): number {
  let score = 10;

  if (record.expectedRevenue && record.expectedRevenue > 5000) score += 50;
  else if (record.expectedRevenue && record.expectedRevenue > 1000) score += 30;
  else if (record.expectedRevenue && record.expectedRevenue > 250) score += 15;

  if (record.lane === "JayPVentures LLC") score += 25;
  if (record.lane === "All Ventures Access") score += 20;
  if (record.lane === "JayPVentures Travel") score += 15;
  if (record.lane === "JayPVentures Music") score += 15;
  if (record.lane === "jaypventures creator") score += 10;

  if (record.tier === "Inner Circle") score += 40;
  if (record.tier === "Plus") score += 20;
  if (record.tier === "Core") score += 10;

  return score;
}

export function buildCrmRecord(input: CRMRecord): CRMRecord & {
  leadScore: number;
  revenueChannel: string;
  revenueConfidence: "direct" | "catalog" | "unknown";
  isRecurring: boolean;
  mrr: number;
} {
  const lane = normalizeLane(input.lane);
  const tier = normalizeTier(input.tier);
  const direct = normalizeRevenue(input.expectedRevenue);
  const fallback = estimatePriceFromServiceName(input.serviceName);
  const expectedRevenue = direct !== undefined && direct !== null && direct > 0 ? direct : fallback;
  const isRecurring = lane === "All Ventures Access" && expectedRevenue > 0;
  const mrr = isRecurring ? expectedRevenue : 0;

  const enriched: CRMRecord & {`n    leadScore: number;`n    revenueChannel: string;`n    revenueConfidence: "direct" | "catalog" | "unknown";`n    isRecurring: boolean;`n    mrr: number;`n  } = {
    ...input,

    lane,
    tier,

    fullName: sanitize(input.fullName),
    email: sanitize(input.email),
    serviceName: sanitize(input.serviceName),

    expectedRevenue,
    isRecurring,
    mrr,

    occurredAt: input.occurredAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),

    leadScore: computeLeadScore({
      ...input,
      lane,
      tier,
      expectedRevenue,
    }),

    revenueChannel:
      input.source === "stripe"
        ? "Stripe"
        : input.source === "memberstack"
        ? "Memberstack"
        : input.source === "bookings"
        ? "Bookings"
        : input.source === "admin"
        ? "Manual"
        : "Unknown",
    revenueConfidence:
      direct !== undefined && direct !== null && direct > 0
        ? "direct"
        : fallback > 0
        ? "catalog"
        : "unknown",
  };

  return enriched;
}

