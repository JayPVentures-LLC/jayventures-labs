import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../operations/entitlement-system/workers/stripeWebhook";
import { createStripeSignatureHeader } from "../operations/entitlement-system/utils/verify-signature";
import { getEntitlement } from "../operations/entitlement-system/services/entitlement.service";
import { entitlementCheck } from "../operations/entitlement-system/middleware/entitlementCheck";
import { asKvNamespace, MockKVNamespace } from "./helpers/mock-kv";

// Must be at the top: vi.mock is hoisted. Provides deterministic role IDs for tests.
vi.mock("../operations/entitlement-system/config/discordGuilds", () => ({
  DISCORD_GUILD_CONFIG: {
    jaypventures: {
      guildId: "guild-creator-test",
      roles: {
        member: "role-community-test",
        premium: "role-vip-test",
        enterprise: "role-vip-test",
      },
    },
    jaypventuresllc: {
      guildId: "guild-labs-test",
      roles: {
        member: "role-labs-member-test",
        premium: "role-labs-researcher-test",
        enterprise: "role-labs-researcher-test",
      },
    },
  },
}));

function createRawEnv(extra?: Partial<Record<string, unknown>>) {
  const entitlementKv = new MockKVNamespace();
  const idempotencyKv = new MockKVNamespace();
  const retryQueueKv = new MockKVNamespace();
  const metricsKv = new MockKVNamespace();

  return {
    raw: {
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      DISCORD_BOT_TOKEN: "discord-token",
      DISCORD_GUILD_ID: "guild-primary-test",
      DISCORD_ROLE_COMMUNITY_ID: "role-community-primary",
      DISCORD_ROLE_VIP_ID: "role-vip-primary",
      ADMIN_OVERRIDE_KEY: "admin-secret",
      ENTITLEMENT_KV: asKvNamespace(entitlementKv),
      IDEMPOTENCY_KV: asKvNamespace(idempotencyKv),
      RETRY_QUEUE_KV: asKvNamespace(retryQueueKv),
      METRICS_KV: asKvNamespace(metricsKv),
      LOG_LEVEL: "debug",
      ...extra,
    },
    metricsKv,
  };
}

function buildStripeEvent() {
  return {
    id: "evt_123",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        customer: "cus_123",
        current_period_end: Math.floor(Date.now() / 1000) + 86_400,
        metadata: {
          internal_user_id: "user-123",
          discord_user_id: "discord-123",
          brand: "jaypventures",
          tier: "member",
        },
      },
    },
  };
}

function createDiscordFetch(options?: { failRoleMutation?: boolean }) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url.includes("/members/") && method === "GET") {
      return new Response(JSON.stringify({ roles: ["community_free"] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (options?.failRoleMutation && (method === "PUT" || method === "DELETE")) {
      return new Response("discord failed", { status: 500 });
    }

    return new Response(null, { status: 204 });
  });
}

describe("entitlement system worker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid Stripe signatures", async () => {
    const { raw } = createRawEnv();
    vi.stubGlobal("fetch", createDiscordFetch());

    const request = new Request("https://example.com/webhook/stripe", {
      method: "POST",
      body: JSON.stringify(buildStripeEvent()),
      headers: {
        "stripe-signature": "t=1,v1=invalid",
      },
    });

    const response = await worker.fetch(request as never, raw, {} as ExecutionContext);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "Invalid signature" });
  });

  it("processes a Stripe webhook, syncs Discord roles, and prevents duplicates", async () => {
    const { raw } = createRawEnv();
    const discordFetch = createDiscordFetch();
    vi.stubGlobal("fetch", discordFetch);

    const event = buildStripeEvent();
    const rawBody = JSON.stringify(event);
    const signature = await createStripeSignatureHeader(rawBody, raw.STRIPE_WEBHOOK_SECRET);

    const request = new Request("https://example.com/webhook/stripe", {
      method: "POST",
      body: rawBody,
      headers: {
        "stripe-signature": signature,
      },
    });

    const first = await worker.fetch(request.clone() as never, raw, {} as ExecutionContext);
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ status: "processed" });

    const entitlement = await getEntitlement("user-123", raw as unknown as { ENTITLEMENT_KV: KVNamespace });
    expect(entitlement?.status).toBe("active");
    expect(entitlement?.entitlements[0]).toMatchObject({ brand: "jaypventures", tier: "member", status: "active" });
    expect(discordFetch).toHaveBeenCalled();

    const gate = await entitlementCheck("jaypventures", "free")(
      new Request("https://example.com/resource", { headers: { "x-user-id": "user-123" } }) as never,
      raw as never
    );
    expect(gate).toBeUndefined();

    const second = await worker.fetch(request.clone() as never, raw, {} as ExecutionContext);
    await expect(second.json()).resolves.toMatchObject({ status: "duplicate" });
  });

  it("supports admin overrides", async () => {
    const { raw } = createRawEnv();
    vi.stubGlobal("fetch", createDiscordFetch());

    const request = new Request("https://example.com/admin/override", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${raw.ADMIN_OVERRIDE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user-admin",
        discordId: "discord-admin",
        brand: "jaypventuresllc",
        tier: "premium",
        status: "active",
        reason: "manual grant",
      }),
    });

    const response = await worker.fetch(request as never, raw, {} as ExecutionContext);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "override_applied" });

    const stored = await getEntitlement("user-admin", raw as unknown as { ENTITLEMENT_KV: KVNamespace });
    expect(stored?.override).toBe(true);
    expect(stored?.overrideReason).toBe("manual grant");
  });

  it("queues failed Discord sync work and drains the retry queue", async () => {
    const { raw } = createRawEnv();
    vi.stubGlobal("fetch", createDiscordFetch({ failRoleMutation: true }));

    const event = buildStripeEvent();
    const rawBody = JSON.stringify(event);
    const signature = await createStripeSignatureHeader(rawBody, raw.STRIPE_WEBHOOK_SECRET);

    const webhook = new Request("https://example.com/webhook/stripe", {
      method: "POST",
      body: rawBody,
      headers: { "stripe-signature": signature },
    });

    const first = await worker.fetch(webhook as never, raw, {} as ExecutionContext);
    expect(first.status).toBe(200);
    const listed = await raw.RETRY_QUEUE_KV.list({ prefix: "retry:" });
    expect(listed.keys.length).toBe(1);

    vi.stubGlobal("fetch", createDiscordFetch());
    const retryRequest = new Request("https://example.com/admin/discord-sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${raw.ADMIN_OVERRIDE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ processRetryQueue: true }),
    });

    const response = await worker.fetch(retryRequest as never, raw, {} as ExecutionContext);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "retry_queue_processed", processed: 1, succeeded: 1, failed: 0 });
  });

  // --- Issue #7: STRIPE_ENTITLEMENT_SYNCED queue consumer acceptance tests ---

  it("STRIPE_ENTITLEMENT_SYNCED: ENTITLEMENT_ACTIVE adds Discord role and logs to METRICS_KV", async () => {
    const { raw, metricsKv } = createRawEnv();
    const discordFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "PUT") return new Response(null, { status: 204 });
      return new Response("unexpected", { status: 400 });
    });
    vi.stubGlobal("fetch", discordFetch);

    const batch = {
      messages: [
        {
          body: {
            type: "STRIPE_ENTITLEMENT_SYNCED" as const,
            payload: {
              subject_id: "user-q1",
              discord_user_id: "discord-q1",
              tier: "premium" as const,
              action: "ENTITLEMENT_ACTIVE" as const,
            },
          },
          ack: vi.fn(),
          retry: vi.fn(),
        },
      ],
    };

    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    await worker.queue(batch as never, raw, ctx);

    expect(batch.messages[0].ack).toHaveBeenCalled();
    expect(batch.messages[0].retry).not.toHaveBeenCalled();

    // The PUT call goes to the VIP role on the primary guild
    const calls = discordFetch.mock.calls;
    const putCall = calls.find(([, init]) => (init as RequestInit)?.method === "PUT");
    expect(putCall).toBeDefined();
    const putUrl = String((putCall as [RequestInfo | URL, RequestInit])[0]);
    expect(putUrl).toContain(raw.DISCORD_GUILD_ID);
    expect(putUrl).toContain(raw.DISCORD_ROLE_VIP_ID);
    expect(putUrl).toContain("discord-q1");

    // Audit record written to METRICS_KV
    const keys = await metricsKv.list({ prefix: "discord_reflection:" });
    expect(keys.keys.length).toBe(1);
    const record = JSON.parse((await metricsKv.get(keys.keys[0].name)) ?? "{}");
    expect(record).toMatchObject({ subject_id: "user-q1", discord_user_id: "discord-q1", tier: "premium", action: "ENTITLEMENT_ACTIVE", result: "success" });
  });

  it("STRIPE_ENTITLEMENT_SYNCED: ENTITLEMENT_INACTIVE removes Discord role and logs to METRICS_KV", async () => {
    const { raw, metricsKv } = createRawEnv();
    const discordFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "DELETE") return new Response(null, { status: 204 });
      return new Response("unexpected", { status: 400 });
    });
    vi.stubGlobal("fetch", discordFetch);

    const batch = {
      messages: [
        {
          body: {
            type: "STRIPE_ENTITLEMENT_SYNCED" as const,
            payload: {
              subject_id: "user-q2",
              discord_user_id: "discord-q2",
              tier: "premium" as const,
              action: "ENTITLEMENT_INACTIVE" as const,
            },
          },
          ack: vi.fn(),
          retry: vi.fn(),
        },
      ],
    };

    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    await worker.queue(batch as never, raw, ctx);

    expect(batch.messages[0].ack).toHaveBeenCalled();
    expect(batch.messages[0].retry).not.toHaveBeenCalled();

    const calls = discordFetch.mock.calls;
    const deleteCall = calls.find(([, init]) => (init as RequestInit)?.method === "DELETE");
    expect(deleteCall).toBeDefined();
    const deleteUrl = String((deleteCall as [RequestInfo | URL, RequestInit])[0]);
    expect(deleteUrl).toContain(raw.DISCORD_ROLE_VIP_ID);
    expect(deleteUrl).toContain("discord-q2");

    const keys = await metricsKv.list({ prefix: "discord_reflection:" });
    expect(keys.keys.length).toBe(1);
    const record = JSON.parse((await metricsKv.get(keys.keys[0].name)) ?? "{}");
    expect(record).toMatchObject({ action: "ENTITLEMENT_INACTIVE", result: "success" });
  });

  it("STRIPE_ENTITLEMENT_SYNCED: missing discord_user_id fails closed (ack, not retry)", async () => {
    const { raw, metricsKv } = createRawEnv();
    vi.stubGlobal("fetch", vi.fn());

    const batch = {
      messages: [
        {
          body: {
            type: "STRIPE_ENTITLEMENT_SYNCED" as const,
            payload: {
              subject_id: "user-q3",
              discord_user_id: undefined,
              tier: "member" as const,
              action: "ENTITLEMENT_ACTIVE" as const,
            },
          },
          ack: vi.fn(),
          retry: vi.fn(),
        },
      ],
    };

    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    await worker.queue(batch as never, raw, ctx);

    expect(batch.messages[0].ack).toHaveBeenCalled();
    expect(batch.messages[0].retry).not.toHaveBeenCalled();

    const keys = await metricsKv.list({ prefix: "discord_reflection:" });
    expect(keys.keys.length).toBe(1);
    const record = JSON.parse((await metricsKv.get(keys.keys[0].name)) ?? "{}");
    expect(record.result).toBe("missing_discord_user_id");
  });

  it("STRIPE_ENTITLEMENT_SYNCED: missing role mapping fails closed (ack, not retry)", async () => {
    const { raw, metricsKv } = createRawEnv({
      DISCORD_ROLE_COMMUNITY_ID: undefined,
      DISCORD_ROLE_VIP_ID: undefined,
    });
    vi.stubGlobal("fetch", vi.fn());

    const batch = {
      messages: [
        {
          body: {
            type: "STRIPE_ENTITLEMENT_SYNCED" as const,
            payload: {
              subject_id: "user-q4",
              discord_user_id: "discord-q4",
              tier: "premium" as const,
              action: "ENTITLEMENT_ACTIVE" as const,
            },
          },
          ack: vi.fn(),
          retry: vi.fn(),
        },
      ],
    };

    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    await worker.queue(batch as never, raw, ctx);

    expect(batch.messages[0].ack).toHaveBeenCalled();
    expect(batch.messages[0].retry).not.toHaveBeenCalled();

    const keys = await metricsKv.list({ prefix: "discord_reflection:" });
    const record = JSON.parse((await metricsKv.get(keys.keys[0].name)) ?? "{}");
    expect(record.result).toBe("missing_discord_role_mapping");
  });

  it("STRIPE_ENTITLEMENT_SYNCED: transient Discord API error triggers retry", async () => {
    const { raw } = createRawEnv();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("server error", { status: 500 })));

    const ackFn = vi.fn();
    const retryFn = vi.fn();

    const batch = {
      messages: [
        {
          body: {
            type: "STRIPE_ENTITLEMENT_SYNCED" as const,
            payload: {
              subject_id: "user-q5",
              discord_user_id: "discord-q5",
              tier: "member" as const,
              action: "ENTITLEMENT_ACTIVE" as const,
            },
          },
          ack: ackFn,
          retry: retryFn,
        },
      ],
    };

    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    await worker.queue(batch as never, raw, ctx);

    expect(retryFn).toHaveBeenCalled();
    expect(ackFn).not.toHaveBeenCalled();
  });
});
