import type { CRMRecord } from "../../types/crm";
import type { Env } from "../../types/env";
import type { IntegrationResult } from "../../types/integration";
import { encodeForm } from "../../utils/http";

export async function pushToStripe(env: Env, record: CRMRecord): Promise<IntegrationResult> {
  if (!env.STRIPE_SECRET_KEY) {
    return { name: "stripe", status: "skipped", detail: "missing_env" };
  }

  const response = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm({
      email: record.email || "",
      name: record.fullName || "",
      "metadata[lane]": record.lane,
      "metadata[tier]": record.tier || "",
      "metadata[event_type]": record.eventType,
      "metadata[idempotency_key]": record.idempotencyKey,
    }),
  });

  if (!response.ok) {
    return { name: "stripe", status: "error", detail: "customer_create_failed" };
  }

  return { name: "stripe", status: "ok" };
}
