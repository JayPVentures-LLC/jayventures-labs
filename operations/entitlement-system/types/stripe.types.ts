// Stripe Types: Event payloads, metadata
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}
