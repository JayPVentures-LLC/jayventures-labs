import type { Env } from "../config/env";
import type { StripeWebhookEvent } from "../types/stripe.types";
import { verifyStripeSignature } from "../utils/verify-signature";
import { logger } from "../utils/logger";
import { processStripeEvent } from "../services/stripe.service";
import { getStripeWebhookSecret } from "../services/runtimeSecrets.service";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return json({ error: "Missing Stripe signature header" }, 400);
  }

  const rawBody = await request.text();
  const webhookSecret = await getStripeWebhookSecret(env);
  const valid = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!valid) {
    logger.log("warn", "Invalid Stripe signature");
    return json({ error: "Invalid signature" }, 400);
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as StripeWebhookEvent;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  try {
    const result = await processStripeEvent(event, env);
    return json(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.log("error", "Stripe webhook processing failed", { message, eventId: event.id });
    return json({ error: "Webhook processing failed", eventId: event.id }, 500);
  }
}
