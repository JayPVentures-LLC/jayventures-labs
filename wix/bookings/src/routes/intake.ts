import type { Env } from "../types/env";
import type { IntakeEvent } from "../types/events";
import type { CRMRecord } from "../types/crm";
import { verifyIntakeHmac } from "../utils/crypto";
import { ensureIdempotent } from "../core/idempotency";
import { planIntegrations } from "../core/router";
import { buildCrmRecord } from "../core/crm";
import { getOrCreateInnerCircleMemberFromRecord } from "../core/innerCircleMembers";
import { getIntakeSecret } from "../utils/runtimeSecrets";
import { enqueueArchive, sendTelemetry } from "../core/azure/observability";

import { normalizeBookingsEvent } from "../core/normalize/bookings";
import { normalizeStripeEvent } from "../core/normalize/stripe";
import { normalizeMemberstackEvent } from "../core/normalize/memberstack";
import { normalizeAdminEvent } from "../core/normalize/admin";

import { pushToSharePoint } from "../core/integrations/sharepoint";
import { pushToStripe } from "../core/integrations/stripe";
import { sendEmail } from "../core/integrations/email";
import { pushToDataLake } from "../core/integrations/dataLake";
import { updateMetrics } from "../core/metrics";
import { persistActionPlan, planActions } from "../core/actions";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleIntake(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  const raw = await request.text();
  const intakeSecret = await getIntakeSecret(env);

  const ok = await verifyIntakeHmac(
    intakeSecret,
    raw,
    request.headers.get("x-jvp-signature")
  );

  if (!ok) {
    return json({ error: "Unauthorized", detail: "Bad or missing x-jvp-signature" }, 401);
  }

  let event: IntakeEvent<Record<string, unknown>>;
  try {
    event = JSON.parse(raw) as IntakeEvent<Record<string, unknown>>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!event.source || !event.eventType || !event.idempotencyKey || !event.occurredAt) {
    return json({ error: "Invalid event envelope" }, 400);
  }

  const firstTime = await ensureIdempotent(env, event.idempotencyKey);
  if (!firstTime) {
    return json({ status: "duplicate_ignored", idempotencyKey: event.idempotencyKey }, 200);
  }

  const normalized = normalize(event);
  const innerCircleMemberId = await getOrCreateInnerCircleMemberFromRecord(env, normalized);
  const record = buildCrmRecord({
    ...normalized,
    innerCircleMemberId: innerCircleMemberId ?? undefined,
  });
  const plan = planIntegrations(record);

  const results: Record<string, unknown> = {};

  if (plan.sharepoint) {
    results.sharepoint = await withRetry(() => pushToSharePoint(env, record));
  }
  if (plan.stripe) {
    results.stripe = await withRetry(() => pushToStripe(env, record));
  }
  if (plan.email) {
    results.email = await withRetry(() => sendEmail(env, record));
  }
  if (plan.dataLake) {
    results.dataLake = await withRetry(() => pushToDataLake(env, record));
  }

  const metrics = await updateMetrics(env, record);
  const actionPlan = planActions(record);
  await persistActionPlan(env, actionPlan);

  if (env.WORKER_EVENTS_QUEUE && actionPlan.actions.length > 0) {
    await env.WORKER_EVENTS_QUEUE.send({
      type: "action.plan.created",
      payload: {
        idempotencyKey: record.idempotencyKey,
        record,
        actionPlan,
      },
    });
  }
  await enqueueArchive(env, {
    source: "bookings-worker",
    event: event.eventType,
    timestamp: new Date().toISOString(),
    data: {
      idempotencyKey: event.idempotencyKey,
      lane: record.lane,
      tier: record.tier ?? "none",
      revenue: record.expectedRevenue ?? 0,
      results,
    },
  });
  await sendTelemetry(env, "intake_processed", {
    eventType: event.eventType,
    source: event.source,
    lane: record.lane,
    tier: record.tier ?? "none",
  });

  return json({ record, plan, results, metrics }, 200);
}

function normalize(event: IntakeEvent<Record<string, unknown>>): CRMRecord {
  if (event.source === "bookings") return normalizeBookingsEvent(event);
  if (event.source === "stripe") return normalizeStripeEvent(event);
  if (event.source === "memberstack") return normalizeMemberstackEvent(event);
  if (event.source === "admin") return normalizeAdminEvent(event);
  return {
    source: event.source,
    eventType: event.eventType,
    idempotencyKey: event.idempotencyKey,
    lane: "UNKNOWN",
    tier: null,
    occurredAt: event.occurredAt,
    createdAt: new Date().toISOString(),
  };
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<{ success: boolean; data?: T; error?: string }> {
  let lastError: string | undefined;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const data = await fn();
      return { success: true, data };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < attempts) {
        await sleep(250 * attempt);
      }
    }
  }
  return { success: false, error: lastError || "unknown_error" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

