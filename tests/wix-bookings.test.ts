import { describe, expect, it } from "vitest";
import { handleIntake } from "../wix/bookings/src/routes/intake";
import { handleInnerCircleBackfill } from "../wix/bookings/src/routes/innerCircle";
import { normalizeBookingsEvent } from "../wix/bookings/src/core/normalize/bookings";
import { normalizeStripeEvent } from "../wix/bookings/src/core/normalize/stripe";
import { normalizeMemberstackEvent } from "../wix/bookings/src/core/normalize/memberstack";
import { updateMetrics } from "../wix/bookings/src/core/metrics";
import { planActions, persistActionPlan } from "../wix/bookings/src/core/actions";
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
    });

    const duplicate = await handleIntake(validRequest.clone() as never, env as never);
    await expect(duplicate.json()).resolves.toMatchObject({ status: "duplicate_ignored", idempotencyKey: "bookings:1" });
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

describe("action layer", () => {
  it("planActions returns creator entitlement and Discord role for jaypventures creator lane payment", () => {
    const record = {
      source: "stripe" as const,
      eventType: "payment.succeeded" as const,
      idempotencyKey: "evt_action_test_001",
      lane: "jaypventures creator" as const,
      tier: null as null,
      email: "creator@example.com",
      occurredAt: "2026-04-01T00:00:00Z",
      createdAt: "2026-04-01T00:00:00Z",
    };

    const plan = planActions(record);

    expect(plan.idempotencyKey).toBe("evt_action_test_001");
    expect(plan.lane).toBe("jaypventures creator");
    expect(plan.eventType).toBe("payment.succeeded");
    expect(plan.actions).toHaveLength(2);

    const entitlementAction = plan.actions.find((a) => a.type === "crm.mark_entitlement");
    expect(entitlementAction).toMatchObject({
      type: "crm.mark_entitlement",
      entitlement: "creator_paid_access",
      lane: "jaypventures creator",
    });

    const discordAction = plan.actions.find((a) => a.type === "discord.assign_role");
    expect(discordAction).toMatchObject({
      type: "discord.assign_role",
      roleKey: "COMMUNITY",
      lane: "jaypventures creator",
    });
  });

  it("planActions returns VIP Discord role for All Ventures Access subscription", () => {
    const record = {
      source: "memberstack" as const,
      eventType: "subscription.created" as const,
      idempotencyKey: "evt_action_sub_001",
      lane: "All Ventures Access" as const,
      tier: null as null,
      email: "member@example.com",
      occurredAt: "2026-04-01T00:00:00Z",
      createdAt: "2026-04-01T00:00:00Z",
    };

    const plan = planActions(record);

    expect(plan.actions).toHaveLength(2);
    expect(plan.actions.find((a) => a.type === "crm.mark_entitlement")).toMatchObject({
      entitlement: "all_ventures_access",
    });
    expect(plan.actions.find((a) => a.type === "discord.assign_role")).toMatchObject({
      roleKey: "VIP",
    });
  });

  it("planActions returns Inner Circle actions for Inner Circle tier", () => {
    const record = {
      source: "memberstack" as const,
      eventType: "subscription.created" as const,
      idempotencyKey: "evt_action_inner_001",
      lane: "All Ventures Access" as const,
      tier: "Inner Circle" as const,
      email: "inner@example.com",
      occurredAt: "2026-04-01T00:00:00Z",
      createdAt: "2026-04-01T00:00:00Z",
    };

    const plan = planActions(record);

    const innerCircleEntitlement = plan.actions.find(
      (a) => a.type === "crm.mark_entitlement" && "entitlement" in a && a.entitlement === "inner_circle"
    );
    expect(innerCircleEntitlement).toBeDefined();

    const innerCircleRole = plan.actions.find(
      (a) => a.type === "discord.assign_role" && "roleKey" in a && a.roleKey === "INNER_CIRCLE"
    );
    expect(innerCircleRole).toBeDefined();
  });

  it("planActions returns empty actions for unknown lane (no crash on missing role config)", () => {
    const record = {
      source: "bookings" as const,
      eventType: "booking.created" as const,
      idempotencyKey: "evt_action_unknown_001",
      lane: "UNKNOWN" as const,
      tier: null as null,
      occurredAt: "2026-04-01T00:00:00Z",
      createdAt: "2026-04-01T00:00:00Z",
    };

    const plan = planActions(record);

    expect(plan.actions).toHaveLength(0);
    expect(plan.lane).toBe("UNKNOWN");
  });

  it("persistActionPlan writes action plan to KV and is idempotent on replay", async () => {
    const creatorDataKv = new MockKVNamespace();
    const env = { CREATOR_DATA_KV: asKvNamespace(creatorDataKv) };

    const plan = {
      idempotencyKey: "evt_persist_001",
      lane: "jaypventures creator",
      eventType: "payment.succeeded",
      actions: [
        {
          type: "crm.mark_entitlement" as const,
          lane: "jaypventures creator",
          email: "creator@example.com",
          entitlement: "creator_paid_access",
          reason: "Stripe payment mapped to jaypventures creator lane",
        },
        {
          type: "discord.assign_role" as const,
          lane: "jaypventures creator",
          email: "creator@example.com",
          roleKey: "COMMUNITY" as const,
          reason: "Paid creator-lane event",
        },
      ],
    };

    await persistActionPlan(env as never, plan);

    const stored = await creatorDataKv.get("action_plan:evt_persist_001");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.idempotencyKey).toBe("evt_persist_001");
    expect(parsed.actions).toHaveLength(2);
    expect(parsed.actions[0]).toMatchObject({ entitlement: "creator_paid_access" });
    expect(parsed.actions[1]).toMatchObject({ roleKey: "COMMUNITY" });
    expect(parsed.createdAt).toBeDefined();

    // Replay: overwriting with the same key is idempotent (no error thrown)
    await expect(persistActionPlan(env as never, plan)).resolves.toBeUndefined();
  });

  it("persistActionPlan is a no-op when CREATOR_DATA_KV is not bound", async () => {
    const env = {};
    const plan = {
      idempotencyKey: "evt_no_kv_001",
      lane: "jaypventures creator",
      eventType: "payment.succeeded",
      actions: [],
    };

    await expect(persistActionPlan(env as never, plan)).resolves.toBeUndefined();
  });

  it("signed Stripe payment for jaypventures creator lane produces action plan in intake response", async () => {
    const creatorDataKv = new MockKVNamespace();
    const env = {
      ENVIRONMENT: "test",
      INTAKE_HMAC_SECRET: "local-secret",
      IDEMPOTENCY_KV: asKvNamespace(new MockKVNamespace()),
      METRICS_KV: asKvNamespace(new MockKVNamespace()),
      INNER_CIRCLE_MEMBER_KV: asKvNamespace(new MockKVNamespace()),
      CREATOR_DATA_KV: asKvNamespace(creatorDataKv),
      ADMIN_UPLOAD_TOKEN: "upload-secret",
    };

    const event = {
      source: "stripe",
      eventType: "payment.succeeded",
      idempotencyKey: "evt_stripe_action_001",
      occurredAt: "2026-04-08T10:00:00.000Z",
      payload: {
        id: "evt_stripe_001",
        data: {
          object: {
            customer: "cus_creator_001",
            amount_received: 10000,
            customer_details: { email: "creator@example.com" },
          },
        },
      },
    };
    const rawBody = JSON.stringify(event);
    const secret = env.INTAKE_HMAC_SECRET;
    const sigHex = await createIntakeSignature(secret, rawBody);

    const request = new Request("https://example.com/webhook/intake", {
      method: "POST",
      body: rawBody,
      headers: { "x-jvp-signature": sigHex },
    });

    const response = await handleIntake(request as never, env as never);
    expect(response.status).toBe(200);

    const body = await response.json() as {
      record: { lane: string };
      actionPlan: { idempotencyKey: string; actions: Array<{ type: string; entitlement?: string; roleKey?: string }> };
    };

    expect(body.record.lane).toBe("jaypventures creator");
    expect(body.actionPlan).toBeDefined();
    expect(body.actionPlan.idempotencyKey).toBe("evt_stripe_action_001");
    expect(body.actionPlan.actions).toHaveLength(2);
    expect(body.actionPlan.actions.find((a) => a.type === "crm.mark_entitlement")).toMatchObject({
      entitlement: "creator_paid_access",
    });
    expect(body.actionPlan.actions.find((a) => a.type === "discord.assign_role")).toMatchObject({
      roleKey: "COMMUNITY",
    });

    // Verify action plan was persisted to KV
    const persisted = await creatorDataKv.get("action_plan:evt_stripe_action_001");
    expect(persisted).not.toBeNull();
    const persistedPlan = JSON.parse(persisted!);
    expect(persistedPlan.actions[0]).toMatchObject({ entitlement: "creator_paid_access" });

    // Replay: duplicate is ignored, action plan is NOT overwritten
    const duplicate = await handleIntake(
      new Request("https://example.com/webhook/intake", {
        method: "POST",
        body: rawBody,
        headers: { "x-jvp-signature": sigHex },
      }) as never,
      env as never
    );
    await expect(duplicate.json()).resolves.toMatchObject({
      status: "duplicate_ignored",
      idempotencyKey: "evt_stripe_action_001",
    });
  });
});
