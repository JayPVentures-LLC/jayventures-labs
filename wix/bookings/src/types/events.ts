export type Source = "bookings" | "stripe" | "memberstack" | "admin" | "wix";

export type EventType =
  | "booking.created"
  | "booking.updated"
  | "booking.cancelled"
  | "payment.succeeded"
  | "payment.refunded"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "member.created"
  | "member.updated"
  | "admin.intake";

export interface IntakeEvent<T = unknown> {
  source: Source;
  eventType: EventType;
  idempotencyKey: string;
  occurredAt: string;
  payload: T;
}
