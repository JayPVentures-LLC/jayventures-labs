import type { StripeWebhookEvent } from "../types/stripe.types";

export const SUPPORTED_STRIPE_EVENTS = new Set<string>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

export function isSupportedStripeEvent(event: StripeWebhookEvent): boolean {
  return SUPPORTED_STRIPE_EVENTS.has(event.type);
}
