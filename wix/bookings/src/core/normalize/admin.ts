import type { IntakeEvent } from "../../types/events";
import type { CRMRecord } from "../../types/crm";

function normalizeTier(value: unknown): CRMRecord["tier"] {
  if (typeof value !== "string") return null;
  const lower = value.toLowerCase();
  if (lower.includes("inner") && lower.includes("circle")) return "Inner Circle";
  if (lower.includes("plus")) return "Plus";
  if (lower.includes("core")) return "Core";
  return null;
}

function normalizeLane(value: unknown): CRMRecord["lane"] {
  if (value === "JayPVentures LLC") return "JayPVentures LLC";
  if (value === "jaypventures creator") return "jaypventures creator";
  if (value === "All Ventures Access") return "All Ventures Access";
  if (value === "JayPVentures Music") return "JayPVentures Music";
  if (value === "JayPVentures Travel") return "JayPVentures Travel";
  return "UNKNOWN";
}

export function normalizeAdminEvent(event: IntakeEvent<Record<string, unknown>>): CRMRecord {
  const a = event.payload as any;

  return {
    source: "admin",
    eventType: event.eventType,
    idempotencyKey: event.idempotencyKey,

    lane: normalizeLane(a.lane),
    tier: normalizeTier(a.tier),

    fullName: a.fullName,
    email: a.email,

    serviceName: a.serviceName,
    startTime: a.startTime,
    endTime: a.endTime,

    expectedRevenue: a.expectedRevenue,

    occurredAt: event.occurredAt,
    createdAt: new Date().toISOString(),
  };
}
