import type { IntakeEvent } from "../../types/events";
import type { CRMRecord } from "../../types/crm";

export function normalizeStripeEvent(event: IntakeEvent<Record<string, unknown>>): CRMRecord {
  const s = event.payload as any;

  const customerId = s.data?.object?.customer ?? s.customer;
  const email = s.data?.object?.customer_details?.email ?? s.email;

  const amount = s.data?.object?.amount_received ?? s.data?.object?.amount ?? undefined;
  const expectedRevenue = typeof amount === "number" ? amount / 100 : undefined;

  return {
    source: event.source,
    eventType: event.eventType,
    idempotencyKey: event.idempotencyKey,

    lane: "jaypventures creator",
    tier: null,

    email,

    expectedRevenue,
    stripeCustomerId: customerId,
    stripeEventId: s.id,

    occurredAt: event.occurredAt,
    createdAt: new Date().toISOString(),
  };
}

