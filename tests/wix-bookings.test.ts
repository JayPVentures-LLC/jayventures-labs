import { describe, expect, it } from "vitest";
import { handleIntake } from "../wix/bookings/src/routes/intake";
import { handleInnerCircleBackfill } from "../wix/bookings/src/routes/innerCircle";
import { normalizeBookingsEvent } from "../wix/bookings/src/core/normalize/bookings";
import { normalizeStripeEvent } from "../wix/bookings/src/core/normalize/stripe";
import { normalizeMemberstackEvent } from "../wix/bookings/src/core/normalize/memberstack";
import { updateMetrics } from "../wix/bookings/src/core/metrics";
import { asKvNamespace, MockKVNamespace } from "./helpers/mock-kv";

async function createIntakeSignature(secret: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createBookingsEnv() {
  return {
    ENVIRONMENT: "test",
    INTAKE_HMAC_SECRET: "local-secret",
    IDEMPOTENCY_KV: asKvNamespace(new MockKVNamespace()),
    METRICS_KV: asKvNamespace(new MockKVNamespace()),
    INNER_CIRCLE_MEMBER_KV: asKvNamespace(new MockKVNamespace()),
    CREATOR_DATA_KV: asKvNamespace(new MockKVNamespace()),
    ADMIN_UPLOAD_TOKEN: "upload-secret",
  };
}

describe("wix bookings worker", () => {
  it("validates webhook auth and idempotency on intake", async () => {
    const env = createBookingsEnv();
    const event = {
      source: "bookings",
      eventType: "booking.created",
      idempotencyKey: "bookings:1",
      occurredAt: "2026-04-08T10:00:00.000Z",
      payload: {
        serviceName: "JayPVentures LLC - Strategy Session 60 Minutes",
        customerName: "Test Client",
        customerEmail: "test@example.com",
        servicePrice: "$350",
        bookingId: "bk_123",
      },
    };
    const rawBody = JSON.stringify(event);

    const invalid = await handleIntake(
      new Request("https://example.com/webhook/intake", {
        method: "POST",
        body: rawBody,
        headers: { "x-jvp-signature": "bad" },
      }) as never,
      env as never
    );
    expect(invalid.status).toBe(401);

    const signature = await createIntakeSignature(env.INTAKE_HMAC_SECRET, rawBody);
    const validRequest = new Request("https://example.com/webhook/intake", {
      method: "POST",
      body: rawBody,
      headers: { "x-jvp-signature": signature },
    });

    const first = await handleIntake(validRequest.clone() as never, env as never);
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({
      record: {
        lane: "JayPVentures LLC",
        expectedRevenue: 350,
      },
      actionPlanPersisted: true,
      actionPlanKey: "action_plan:bookings:1",
    });

    const stored = await env.CREATOR_DATA_KV.get("action_plan:bookings:1");
    expect(stored).not.toBeNull();

    const duplicate = await handleIntake(validRequest.clone() as never, env as never);
    await expect(duplicate.json()).resolves.toMatchObject({ status: "duplicate_ignored", idempotencyKey: "bookings:1" });
  });

  it("reports skipped action plan persistence when CREATOR_DATA_KV is unavailable", async () => {
    const env = createBookingsEnv();
    const event = {
      source: "stripe",
      eventType: "payment.succeeded",
      idempotencyKey: "stripe:no-kv",
      occurredAt: "2026-04-08T10:00:00.000Z",
      payload: { id: "evt_no_kv", data: { object: { customer: "cus_no_kv", amount_received: 3900, customer_details: { email: "creator@example.com" } } } },
    };
    const rawBody = JSON.stringify(event);
    const signature = await createIntakeSignature(env.INTAKE_HMAC_SECRET, rawBody);

    const response = await handleIntake(
      new Request("https://example.com/webhook/intake", {
        method: "POST",
        body: rawBody,
        headers: { "x-jvp-signature": signature },
      }) as never,
      envWithoutCreatorKv as never
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      actionPlanPersisted: false,
      actionPlanKey: "action_plan:stripe:no-kv",
      actionPlanPersistenceError: "CREATOR_DATA_KV not configured",
    });
  });

  it("normalizes bookings, stripe, and memberstack events", () => {
    expect(normalizeBookingsEvent({
      source: "bookings",
      eventType: "booking.created",
      idempotencyKey: "b1",
      occurredAt: "2026-04-01T00:00:00Z",
      payload: { serviceName: "All Ventures Access - Inner Circle", servicePrice: "$199" },
    })).toMatchObject({ lane: "All Ventures Access", tier: "Inner Circle", expectedRevenue: 199 });

    expect(normalizeStripeEvent({
      source: "stripe",
      eventType: "payment.succeeded",
      idempotencyKey: "s1",
      occurredAt: "2026-04-01T00:00:00Z",
      payload: { id: "evt_1", data: { object: { customer: "cus_1", amount_received: 3900, customer_details: { email: "stripe@example.com" } } } },
    })).toMatchObject({ stripeCustomerId: "cus_1", expectedRevenue: 39, email: "stripe@example.com" });

    expect(normalizeMemberstackEvent({
      source: "memberstack",
      eventType: "subscription.created",
      idempotencyKey: "m1",
      occurredAt: "2026-04-01T00:00:00Z",
      payload: { id: "mem_1", email: "member@example.com", tier: "Inner Circle" },
    })).toMatchObject({ lane: "All Ventures Access", tier: "Inner Circle", memberstackId: "mem_1" });
  });

  it("tracks recurring metrics across subscription lifecycle", async () => {
    const env = createBookingsEnv();

    await updateMetrics(env as never, {
      source: "memberstack",
      eventType: "subscription.created",
      idempotencyKey: "m1",
      lane: "All Ventures Access",
      tier: "Core",
      memberstackId: "mem_1",
      occurredAt: "2026-04-01T00:00:00Z",
      createdAt: "2026-04-01T00:00:00Z",
      mrr: 39,
      isRecurring: true,
    });

    const updated = await updateMetrics(env as never, {
      source: "memberstack",
      eventType: "subscription.updated",
      idempotencyKey: "m2",
      lane: "All Ventures Access",
      tier: "Plus",
      memberstackId: "mem_1",
      occurredAt: "2026-04-02T00:00:00Z",
      createdAt: "2026-04-02T00:00:00Z",
      mrr: 79,
      isRecurring: true,
    });

    expect(updated.totalMRR).toBe(79);
    expect(updated.newMRR).toBe(39);

    const cancelled = await updateMetrics(env as never, {
      source: "memberstack",
      eventType: "subscription.cancelled",
      idempotencyKey: "m3",
      lane: "All Ventures Access",
      tier: "Plus",
      memberstackId: "mem_1",
      occurredAt: "2026-04-03T00:00:00Z",
      createdAt: "2026-04-03T00:00:00Z",
      mrr: 0,
      isRecurring: true,
    });

    expect(cancelled.totalMRR).toBe(0);
  });

  it("backfills Inner Circle members in dry-run and write mode", async () => {
    const env = createBookingsEnv();
    const payload = [{ memberId: "mem_123", email: "inner@example.com", name: "Inner User", tier: "Inner Circle" }];

    const dryRun = await handleInnerCircleBackfill(
      new Request("https://example.com/inner-circle/backfill?dryRun=true", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ADMIN_UPLOAD_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }) as never,
      env as never
    );
    await expect(dryRun.json()).resolves.toMatchObject({ dryRun: true, created: 1, errors: 0 });

    const write = await handleInnerCircleBackfill(
      new Request("https://example.com/inner-circle/backfill", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ADMIN_UPLOAD_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }) as never,
      env as never
    );
    await expect(write.json()).resolves.toMatchObject({ dryRun: false, created: 1, errors: 0 });

    const stored = await env.INNER_CIRCLE_MEMBER_KV.get("inner-circle:member:mem_123");
    expect(stored).not.toBeNull();
  });
});


