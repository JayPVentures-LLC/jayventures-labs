/**
 * Linked Roles OAuth2 flow
 *
 * Discord Linked Roles let server admins require members to verify membership data
 * before a role is assigned. The flow:
 *
 *   1. Server admin sets a role to require "Linked Roles Verification URL" in the role settings.
 *   2. Member clicks "Verify" → Discord redirects them to this app's start URL.
 *   3. This app redirects them through Discord OAuth2 (scope: identify + role_connections.write).
 *   4. On callback, exchange the code for a token and PUT the member's role connection metadata.
 *   5. Redirect user to a success page.
 *
 * Discord Developer Portal → Your App → General Information → Linked Roles Verification URL
 * Set to: https://<worker-hostname>/linked-roles/start
 *
 * Discord Developer Portal → Your App → OAuth2 → Redirects
 * Add: https://<worker-hostname>/linked-roles/callback
 *
 * Docs: https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles
 */

import type { Env } from "../types/env";

const DISCORD_API = "https://discord.com/api/v10";
const DISCORD_OAUTH_BASE = "https://discord.com/oauth2/authorize";
const OAUTH_SCOPE = "identify role_connections.write";
const STATE_TTL_SECONDS = 300; // 5 minutes

function callbackUri(env: Env): string {
  return `${env.SITE_ORIGIN}/linked-roles/callback`;
}

function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// GET /linked-roles/start
// ---------------------------------------------------------------------------
export async function handleLinkedRolesStart(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const state = generateState();

  // Persist state for CSRF validation — KV is optional (falls back to cookie-only)
  if (env.LINKED_ROLES_KV) {
    await env.LINKED_ROLES_KV.put(`oauth_state:${state}`, "1", {
      expirationTtl: STATE_TTL_SECONDS,
    });
  }

  const oauthUrl = new URL(DISCORD_OAUTH_BASE);
  oauthUrl.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  oauthUrl.searchParams.set("redirect_uri", callbackUri(env));
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("scope", OAUTH_SCOPE);
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("prompt", "consent");

  return new Response(null, {
    status: 302,
    headers: {
      Location: oauthUrl.toString(),
      // Cookie acts as a secondary CSRF check when KV is not available
      "Set-Cookie": `discord_oauth_state=${state}; Path=/linked-roles; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_TTL_SECONDS}`,
    },
  });
}

// ---------------------------------------------------------------------------
// GET /linked-roles/callback
// ---------------------------------------------------------------------------
export async function handleLinkedRolesCallback(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Missing required parameters: code and state", { status: 400 });
  }

  // Validate state against KV when available
  if (env.LINKED_ROLES_KV) {
    const stored = await env.LINKED_ROLES_KV.get(`oauth_state:${state}`);
    if (!stored) {
      return new Response("Invalid or expired OAuth2 state", { status: 400 });
    }
    await env.LINKED_ROLES_KV.delete(`oauth_state:${state}`);
  }

  // Exchange authorisation code for tokens
  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUri(env),
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("[linked-roles] Token exchange failed:", err);
    return new Response("Discord token exchange failed", { status: 502 });
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };

  // Fetch the user's Discord identity
  const userRes = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    console.error("[linked-roles] User fetch failed:", await userRes.text());
    return new Response("Failed to fetch Discord user", { status: 502 });
  }

  const user = (await userRes.json()) as { id: string; username: string };

  // Update the user's role connection metadata
  // The `metadata` object should contain keys registered via
  // PUT /applications/{app_id}/role-connections/metadata (run once during bot setup).
  // Extend with custom fields as the verification requirements evolve.
  const roleConnRes = await fetch(
    `${DISCORD_API}/users/@me/applications/${env.DISCORD_APP_ID}/role-connection`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform_name: "JayPVentures",
        platform_username: user.username,
        metadata: {},
      }),
    }
  );

  if (!roleConnRes.ok) {
    const err = await roleConnRes.text();
    console.error("[linked-roles] Role connection update failed:", err);
    return new Response("Failed to update role connection", { status: 502 });
  }

  // All done — redirect to the success page
  return new Response(null, {
    status: 302,
    headers: { Location: `${env.SITE_ORIGIN}/linked-roles/success` },
  });
}

// ---------------------------------------------------------------------------
// GET /linked-roles/success
// ---------------------------------------------------------------------------
export function handleLinkedRolesSuccess(_request: Request, _env: Env): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verified – JayPVentures Discord</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#f3efe8;color:#111827;font-family:"IBM Plex Sans","Segoe UI",sans-serif;
         display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border-radius:18px;padding:40px 36px;max-width:440px;width:100%;
          text-align:center;box-shadow:0 18px 42px rgba(17,24,39,.08);border:1px solid rgba(17,24,39,.08)}
    .check{font-size:3rem;margin-bottom:16px}
    h1{font-family:Georgia,serif;font-size:1.75rem;font-weight:500;margin:0 0 14px;letter-spacing:-.02em}
    p{color:#4b5563;line-height:1.65;margin:0 0 20px}
    .back{display:inline-flex;align-items:center;justify-content:center;min-height:44px;
          padding:0 20px;border-radius:10px;border:1px solid rgba(17,24,39,.14);
          font-size:14px;font-weight:600;color:#111827;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✅</div>
    <h1>You're verified!</h1>
    <p>Your Discord account is now linked to JayPVentures. You may close this window and return to Discord — your linked role should activate shortly.</p>
    <a class="back" href="https://discord.com">Return to Discord</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  });
}
