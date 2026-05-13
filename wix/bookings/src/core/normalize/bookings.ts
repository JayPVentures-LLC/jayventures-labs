import type { IntakeEvent } from "../../types/events";
import type { CRMRecord, Tier, Lane } from "../../types/crm";

function classifyLane(serviceName: string): Lane {
  if (serviceName.startsWith("JayPVentures LLC")) return "JayPVentures LLC";
  if (serviceName.startsWith("jaypventures creator")) return "jaypventures creator";
  if (serviceName.startsWith("All Ventures Access")) return "All Ventures Access";
  if (serviceName.startsWith("JayPVentures Music")) return "JayPVentures Music";
  if (serviceName.startsWith("JayPVentures Travel")) return "JayPVentures Travel";
  return "UNKNOWN";
}

function extractTier(serviceName: string): Tier {
  if (!serviceName.startsWith("All Ventures Access")) return null;
  if (serviceName.includes("Core")) return "Core";
  if (serviceName.includes("Plus")) return "Plus";
  if (serviceName.includes("Inner Circle")) return "Inner Circle";
  return null;
}

function parseRevenue(price?: string | number): number | undefined {
  if (price === undefined || price === null) return undefined;
  if (typeof price === "number") return price;

  const trimmed = price.trim();
  if (trimmed === "") return undefined;

  // Accept only expected price-format characters; reject anything else
  // instead of stripping it and potentially changing the numeric value.
  if (!/^[\d\s,.\-+$€£¥]+$/.test(trimmed)) return undefined;

  // Remove only known-safe formatting characters after validation.
  const normalized = trimmed.replace(/[\s,$€£¥]/g, "");
  if (!/^-?(?:\d+|\d*\.\d+)$/.test(normalized)) return undefined;

  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export function normalizeBookingsEvent(event: IntakeEvent<Record<string, unknown>>): CRMRecord {
  const b = event.payload;

  const serviceName = String(b.serviceName ?? b.ServiceName ?? "");
  const lane = classifyLane(serviceName);
  const tier = extractTier(serviceName);

  return {
    source: event.source,
    eventType: event.eventType,
    idempotencyKey: event.idempotencyKey,

    lane,
    tier,

    fullName: (b.customerName ?? b.CustomerName) as string | undefined,
    email: (b.customerEmail ?? b.CustomerEmail) as string | undefined,

    serviceName,
    startTime: (b.startDateTime ?? b.StartDateTime) as string | undefined,
    endTime: (b.endDateTime ?? b.EndDateTime) as string | undefined,

    expectedRevenue: parseRevenue((b.servicePrice ?? b.price) as string | number | undefined),

    bookingId: (b.bookingId ?? b.BookingId) as string | undefined,

    occurredAt: event.occurredAt,
    createdAt: new Date().toISOString(),
  };
}
