import type { Env } from "../config/env";
import type { Brand, Tier } from "../types/entitlement.types";
import type { StripeEntitlementPayload, StripeWebhookEvent } from "../types/stripe.types";
import { isSupportedStripeEvent } from "../config/stripeEvents";
import { getRoleIdsForBrandTier } from "./discordRoleMapping.service";
import { syncDiscordRoles } from "./discordSync.service";
import { upsertBrandEntitlement } from "./entitlement.service";
import { logger } from "../utils/logger";
import { enqueueWorkerEvent, sendTelemetry } from "./azure/observability.service";

function normalizeBrand(value: string | undefined): Brand | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "jaypventures") return "jaypventures";
  if (lower === "jaypventuresllc" || lower === "jaypventures-llc" || lower === "jaypventures_llc") return "jaypventuresllc";
  return null;
}

function normalizeTier(value: string | undefined): Tier | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "free") return "free";
  if (lower === "member") return "member";
  if (lower === "premium") return "premium";
  if (lower === "enterprise") return "enterprise";
  return null;
}

function extractMetadata(event: StripeWebhookEvent): Record<string, string | undefined> {
  const object = event.data.object;
  const direct = object.metadata ?? {};
  const nested = object.subscription_details?.metadata ?? {};
  return {
    internal_user_id: direct.internal_user_id ?? nested.internal_user_id,
    user_id: direct.user_id ?? nested.user_id,
    discord_user_id: direct.discord_user_id ?? nested.discord_user_id,
    discord_id: direct.discord_id ?? nested.discord_id,
    brand: direct.brand ?? nested.brand,
    tier: direct.tier ?? nested.tier,
  };
}

export function mapStripeEventToEntitlement(event: StripeWebhookEvent): StripeEntitlementPayload | null {
  if (!isSupportedStripeEvent(event)) return null;

  const metadata = extractMetadata(event);
  const object = event.data.object;
  const brand = normalizeBrand(metadata.brand);
  const tier = normalizeTier(metadata.tier);
  const userId = metadata.internal_user_id ?? metadata.user_id ?? object.client_reference_id ?? object.customer;

  if (!brand || !tier || !userId) {
    throw new Error("Missing required Stripe metadata: brand, tier, or user identifier");
  }

  const status = event.type === "customer.subscription.deleted" || event.type === "invoice.payment_failed"
    ? "inactive"
    : "active";

  const expiresAt = object.current_period_end
    ? object.current_period_end * 1000
    : (event.created * 1000) + (30 * 24 * 60 * 60 * 1000);

  return {
    eventId: event.id,
    userId,
    discordId: metadata.discord_user_id ?? metadata.discord_id,
    brand,
    tier,
    status,
    expiresAt,
  };
}

export async function processStripeEvent(
  event: StripeWebhookEvent,
  env: Env
): Promise<{ status: "ignored" | "duplicate" | "processed"; entitlement?: Awaited<ReturnType<typeof upsertBrandEntitlement>>; syncResults?: Awaited<ReturnType<typeof syncDiscordRoles>> }> {
  if (!isSupportedStripeEvent(event)) {
    return { status: "ignored" };
  }

  const idempotencyKey = `stripe:${event.id}`;
  const existing = await env.IDEMPOTENCY_KV.get(idempotencyKey);
  if (existing) {
    return { status: "duplicate" };
  }

  const payload = mapStripeEventToEntitlement(event);
  if (!payload) {
    return { status: "ignored" };
  }

  const entitlement = await upsertBrandEntitlement(
    {
      userId: payload.userId,
      brand: payload.brand,
      tier: payload.tier,
      status: payload.status,
      expiresAt: payload.expiresAt,
      source: "stripe",
      discordId: payload.discordId,
      roleIds: getRoleIdsForBrandTier(payload.brand, payload.tier),
      lastEventId: payload.eventId,
    },
    env
  );

  const syncResults = await syncDiscordRoles(entitlement, env, { brand: payload.brand });
  await env.IDEMPOTENCY_KV.put(idempotencyKey, "1", { expirationTtl: 60 * 60 * 24 * 14 });
  await enqueueWorkerEvent(env, {
    type: "archive",
    payload: {
      source: "entitlement-system",
      event: event.type,
      timestamp: new Date().toISOString(),
      data: {
        eventId: event.id,
        userId: payload.userId,
        brand: payload.brand,
        tier: payload.tier,
        status: payload.status,
        syncResults,
      },
    },
  });
  await sendTelemetry(env, "entitlement_webhook_processed", {
    eventId: event.id,
    eventType: event.type,
    brand: payload.brand,
    tier: payload.tier,
    status: payload.status,
  });
  logger.log("info", "Stripe event processed", { eventId: event.id, userId: payload.userId, brand: payload.brand, tier: payload.tier });

  return { status: "processed", entitlement, syncResults };
}
