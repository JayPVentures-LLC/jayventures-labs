import { describe, expect, it, vi, beforeEach } from "vitest";
import worker from "../apps/discord-bot/src/index";
import { verifyDiscordRequest } from "../apps/discord-bot/src/lib/verify-discord-request";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEnv(overrides: Partial<Record<string, string>> = {}): Record<string, string> {
  return {
    DISCORD_PUBLIC_KEY: "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899",
    DISCORD_APP_ID: "123456789012345678",
    DISCORD_CLIENT_ID: "123456789012345678",
    DISCORD_CLIENT_SECRET: "test-client-secret",
    DISCORD_BOT_TOKEN: "test-bot-token",
    SITE_ORIGIN: "https://jaypventuresllc.com",
    ...overrides,
  };
}

async function fetchRoute(
  pathname: string,
  init: RequestInit = {},
  envOverrides: Partial<Record<string, string>> = {}
) {
  const request = new Request(`https://discord-bot.jaypventuresllc.com${pathname}`, init);
  return worker.fetch(request as never, makeEnv(envOverrides) as never, {} as ExecutionContext);
}

// ---------------------------------------------------------------------------
// Health endpoint
// ---------------------------------------------------------------------------

describe("GET /health", () => {
  it("returns 200 with service name", async () => {
    const res = await fetchRoute("/health");
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, string>;
    expect(body.status).toBe("ok");
    expect(body.service).toBe("jaypventures-discord-bot");
  });
});

// ---------------------------------------------------------------------------
// 404 for unknown routes
// ---------------------------------------------------------------------------

describe("unknown routes", () => {
  it("returns 404 JSON for unknown paths", async () => {
    const res = await fetchRoute("/unknown-path");
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, string>;
    expect(body.error).toBe("Not Found");
  });

  it("normalises trailing slashes before routing", async () => {
    const res = await fetchRoute("/health/");
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /interactions — method guard
// ---------------------------------------------------------------------------

describe("POST /interactions — method guard", () => {
  it("returns 405 for GET requests", async () => {
    const res = await fetchRoute("/interactions", { method: "GET" });
    expect(res.status).toBe(405);
  });
});

// ---------------------------------------------------------------------------
// POST /interactions — missing signature headers
// ---------------------------------------------------------------------------

describe("POST /interactions — signature headers", () => {
  it("returns 401 when X-Signature-Ed25519 is missing", async () => {
    const res = await fetchRoute("/interactions", {
      method: "POST",
      headers: { "X-Signature-Timestamp": "1700000000" },
      body: '{"type":1}',
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 when X-Signature-Timestamp is missing", async () => {
    const res = await fetchRoute("/interactions", {
      method: "POST",
      headers: { "X-Signature-Ed25519": "aabbcc" },
      body: '{"type":1}',
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for a present but invalid signature", async () => {
    const res = await fetchRoute("/interactions", {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": "a".repeat(128),
        "X-Signature-Timestamp": "1700000000",
      },
      body: '{"type":1}',
    });
    // Signature is present but invalid — expect 401
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// verifyDiscordRequest — unit tests
// ---------------------------------------------------------------------------

describe("verifyDiscordRequest", () => {
  it("returns false when any required parameter is empty", async () => {
    expect(await verifyDiscordRequest("", "sig", "ts", "body")).toBe(false);
    expect(await verifyDiscordRequest("pubkey", "", "ts", "body")).toBe(false);
    expect(await verifyDiscordRequest("pubkey", "sig", "", "body")).toBe(false);
  });

  it("returns false for an invalid hex public key", async () => {
    const result = await verifyDiscordRequest("not-a-hex-key", "aabbcc", "1700000000", "{}");
    expect(result).toBe(false);
  });

  it("returns false for structurally valid but mismatched keys", async () => {
    // Use a real-looking but random public key — the signature will not match
    const fakePublicKey = "a".repeat(64);
    const fakeSignature = "b".repeat(128);
    const result = await verifyDiscordRequest(fakePublicKey, fakeSignature, "1700000000", '{"type":1}');
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /linked-roles/start — method guard
// ---------------------------------------------------------------------------

describe("GET /linked-roles/start — method guard", () => {
  it("returns 405 for POST requests", async () => {
    const res = await fetchRoute("/linked-roles/start", { method: "POST" });
    expect(res.status).toBe(405);
  });
});

// ---------------------------------------------------------------------------
// GET /linked-roles/start — OAuth2 redirect
// ---------------------------------------------------------------------------

describe("GET /linked-roles/start — OAuth2 redirect", () => {
  it("redirects to Discord OAuth2 with correct parameters", async () => {
    const res = await fetchRoute("/linked-roles/start");
    expect(res.status).toBe(302);

    const location = res.headers.get("Location") ?? "";
    expect(location).toContain("discord.com/oauth2/authorize");
    expect(location).toContain("response_type=code");
    expect(location).toContain("scope=");
    expect(location).toContain("role_connections.write");
    expect(location).toContain("state=");
    expect(location).toContain("client_id=");
  });

  it("uses WORKER_ORIGIN for redirect_uri when set", async () => {
    const res = await fetchRoute("/linked-roles/start", {}, {
      WORKER_ORIGIN: "https://my-worker.example.com",
    });
    const location = res.headers.get("Location") ?? "";
    const params = new URL(location).searchParams;
    expect(params.get("redirect_uri")).toBe("https://my-worker.example.com/linked-roles/callback");
  });

  it("derives redirect_uri from request URL when WORKER_ORIGIN is not set", async () => {
    const res = await fetchRoute("/linked-roles/start");
    const location = res.headers.get("Location") ?? "";
    const params = new URL(location).searchParams;
    expect(params.get("redirect_uri")).toBe("https://discord-bot.jaypventuresllc.com/linked-roles/callback");
  });

  it("sets a state cookie for CSRF protection", async () => {
    const res = await fetchRoute("/linked-roles/start");
    const cookie = res.headers.get("Set-Cookie") ?? "";
    expect(cookie).toContain("discord_oauth_state=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });
});

// ---------------------------------------------------------------------------
// GET /linked-roles/callback — parameter validation
// ---------------------------------------------------------------------------

describe("GET /linked-roles/callback — parameter validation", () => {
  it("returns 400 when code is missing", async () => {
    const res = await fetchRoute("/linked-roles/callback?state=abc123");
    expect(res.status).toBe(400);
  });

  it("returns 400 when state is missing", async () => {
    const res = await fetchRoute("/linked-roles/callback?code=authcode123");
    expect(res.status).toBe(400);
  });

  it("returns 405 for non-GET requests", async () => {
    const res = await fetchRoute("/linked-roles/callback", { method: "POST" });
    expect(res.status).toBe(405);
  });
});

// ---------------------------------------------------------------------------
// GET /linked-roles/callback — CSRF state validation (cookie fallback, no KV)
// ---------------------------------------------------------------------------

describe("GET /linked-roles/callback — CSRF state validation", () => {
  it("returns 403 when no state cookie is present (no KV configured)", async () => {
    const res = await fetchRoute("/linked-roles/callback?code=authcode&state=state123");
    expect(res.status).toBe(403);
  });

  it("returns 403 when cookie state does not match query state", async () => {
    const res = await fetchRoute("/linked-roles/callback?code=authcode&state=state123", {
      headers: { Cookie: "discord_oauth_state=different_state_value" },
    });
    expect(res.status).toBe(403);
  });

  it("proceeds past CSRF check when cookie state matches query state", async () => {
    // Mock fetch so we don't make a real network call to Discord's token endpoint
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })
    );
    try {
      const res = await fetchRoute("/linked-roles/callback?code=authcode&state=matchingstate", {
        headers: { Cookie: "discord_oauth_state=matchingstate" },
      });
      // CSRF check passes; token exchange returns an error → 502
      expect(res.status).toBe(502);
    } finally {
      mockFetch.mockRestore();
    }
  });

  it("returns 403 when cookie is present but value is empty", async () => {
    const res = await fetchRoute("/linked-roles/callback?code=authcode&state=state123", {
      headers: { Cookie: "discord_oauth_state=" },
    });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// GET /linked-roles/success
// ---------------------------------------------------------------------------

describe("GET /linked-roles/success", () => {
  it("returns 200 HTML with verification confirmation", async () => {
    const res = await fetchRoute("/linked-roles/success");
    expect(res.status).toBe(200);
    const contentType = res.headers.get("Content-Type") ?? "";
    expect(contentType).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("verified");
    expect(html).toContain("JayPVentures");
  });
});
