// Stripe Webhook Handler (Cloudflare Worker)
// Handles Stripe events, verifies signature, updates entitlement, triggers Discord sync
import { handleStripeWebhook } from '../routes/webhook.route';

export default { fetch: handleStripeWebhook };
