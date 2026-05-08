import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../operations/entitlement-system/workers/stripeWebhook";
import { createStripeSignatureHeader } from "../operations/entitlement-system/utils/verify-signature";
import { getEntitlement } from "../operations/entitlement-system/services/entitlement.service";
import { entitlementCheck } from "../operations/entitlement-system/middleware/entitlementCheck";
import { asKvNamespace, MockKVNamespace } from "./helpers/mock-kv";

vi.mock("../operations/entitlement-system/config/discordGuilds", () => ({
  DISCORD_GUILD_CONFIG: {
    jaypventures: {
      guildId: "guild-labs-test",
      roles: {
        member: "role-labs-member-test",
        researcher: "role-labs-researcher-test",
        student: "role-labs-student-test",
      },
    },
    jaypventuresllc: {
      guildId: "guild-creator-test",
      roles: {
        community: "role-creator-community-test",
        vip: "role-creator-vip-test",
      },
    },
  },
}));

function createRawEnv() {
  const entitlementKv = new MockKVNamespace();
  const idempotencyKv = new MockKVNamespace();
  const retryQueueKv = new MockKVNamespace();

  return {
    raw: {
      STRIPE_WEBHOOK_SECRET: "whsec_test",
      DISCORD_BOT_TOKEN: "discord-token",
      ADMIN_OVERRIDE_KEY: "admin-secret",
      ENTITLEMENT_KV: asKvNamespace(entitlementKv),
      IDEMPOTENCY_KV: asKvNamespace(idempotencyKv),
      RETRY_QUEUE_KV: asKvNamespace(retryQueueKv),
      LOG_LEVEL: "debug",
    },
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

  it("supports discord sync dry-run without mutating roles", async () => {
    const { raw } = createRawEnv();
    vi.stubGlobal("fetch", createDiscordFetch());

    // Create an entitlement without triggering Discord sync
    const overrideRequest = new Request("https://example.com/admin/override", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${raw.ADMIN_OVERRIDE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user-dryrun",
        discordId: "discord-dryrun",
        brand: "jaypventures",
        tier: "member",
        status: "active",
        syncDiscord: false,
      }),
    });
    await worker.fetch(overrideRequest as never, raw, {} as ExecutionContext);

    // Swap to a fresh mock so we can assert only dryRun-triggered calls
    const dryRunFetch = createDiscordFetch();
    vi.stubGlobal("fetch", dryRunFetch);

    const dryRunRequest = new Request("https://example.com/admin/discord-sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${raw.ADMIN_OVERRIDE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: "user-dryrun", dryRun: true }),
    });

    const response = await worker.fetch(dryRunRequest as never, raw, {} as ExecutionContext);
    expect(response.status).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body.status).toBe("discord_sync_dry_run");

    // GET should be called to read current roles, but no PUT or DELETE mutations
    const mutationCalls = dryRunFetch.mock.calls.filter(
      ([, init]) => init?.method === "PUT" || init?.method === "DELETE"
    );
    expect(mutationCalls).toHaveLength(0);

    // Result should describe what would have been changed and carry dryRun flag
    const syncResults = body.syncResults as Array<{ dryRun: boolean; addedRoles: string[] }>;
    expect(syncResults[0].dryRun).toBe(true);
    expect(syncResults[0].addedRoles).toContain("role-labs-member-test");
  });
});
