import type { Brand, Tier } from "./entitlement.types";

export interface StripeMetadata {
  internal_user_id?: string;
  user_id?: string;
  discord_user_id?: string;
  discord_id?: string;
  brand?: string;
  tier?: string;
  /** Alternative product-key strategy used by the Azure Function App processor */
  jpv_product_key?: string;
}

export interface StripeEventObject {
  id?: string;
  customer?: string;
  client_reference_id?: string;
  current_period_end?: number;
  metadata?: StripeMetadata;
  customer_details?: {
    email?: string;
  };
  subscription_details?: {
    metadata?: StripeMetadata;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: StripeEventObject;
  };
}

export interface StripeEntitlementPayload {
  eventId: string;
  userId: string;
  discordId?: string;
  brand: Brand;
  tier: Tier;
  status: "active" | "inactive";
  expiresAt: number;
}
