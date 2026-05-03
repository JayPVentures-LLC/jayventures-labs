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

export function normalizeMemberstackEvent(event: IntakeEvent<Record<string, unknown>>): CRMRecord {
  const m = event.payload as any;

  return {
    source: event.source,
    eventType: event.eventType,
    idempotencyKey: event.idempotencyKey,

    lane: "All Ventures Access",
    tier: normalizeTier(m.tier ?? m.plan ?? null),

    fullName: m.name,
    email: m.email,

    memberstackId: m.id ?? m.memberId,

    occurredAt: event.occurredAt,
    createdAt: new Date().toISOString(),
  };
}
