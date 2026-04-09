// Stripe Webhook Handler (Cloudflare Worker)
// Handles Stripe events, verifies signature, updates entitlement, triggers Discord sync
import { handleStripeWebhook } from '../routes/webhook.route';

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		return handleStripeWebhook(request, env, ctx);
	}
};
