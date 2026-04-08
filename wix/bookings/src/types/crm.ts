import type { EventType, Source } from "./events";

export type Lane =
  | "JayPVentures LLC"
  | "jaypventures creator"
  | "All Ventures Access"
  | "JayPVentures Music"
  | "JayPVentures Travel"
  | "UNKNOWN";

export type Tier = "Core" | "Plus" | "Inner Circle" | null;

export interface CRMRecord {
  source: Source;
  eventType: EventType;
  idempotencyKey: string;

  lane: Lane;
  tier: Tier;

  fullName?: string;
  email?: string;

  serviceName?: string;
  startTime?: string;
  endTime?: string;

  expectedRevenue?: number;
  isRecurring?: boolean;
  mrr?: number;
  leadScore?: number;
  revenueChannel?: string;
  revenueConfidence?: "direct" | "catalog" | "unknown";

  bookingId?: string;
  stripeCustomerId?: string;
  stripeEventId?: string;
  memberstackId?: string;
  innerCircleMemberId?: string;

  occurredAt: string;
  createdAt: string;
}
