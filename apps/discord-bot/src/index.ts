/**
 * JayPVentures Discord Bot — Cloudflare Worker
 *
 * Routes:
 *   POST /interactions              ← Discord Interactions Endpoint URL
 *   GET  /linked-roles/start        ← Discord Linked Roles Verification URL (OAuth2 entry)
 *   GET  /linked-roles/callback     ← OAuth2 redirect URI (register in Developer Portal)
 *   GET  /linked-roles/success      ← Post-verification landing page
 *   GET  /health                    ← Liveness probe
 *
 * Required secrets (set via `wrangler secret put`):
 *   DISCORD_PUBLIC_KEY, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN
 *
 * Required vars (wrangler.toml [vars]):
 *   SITE_ORIGIN, DISCORD_APP_ID
 *
 * Optional KV binding (wrangler.toml [[kv_namespaces]]):
 *   LINKED_ROLES_KV — stores OAuth2 state tokens for CSRF protection
 */

import type { Env } from "./types/env";
import { handleInteractions } from "./routes/interactions";
import {
  handleLinkedRolesCallback,
  handleLinkedRolesStart,
  handleLinkedRolesSuccess,
} from "./routes/linked-roles";

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // Normalise trailing slashes
    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");

    switch (pathname) {
      // ── Discord Interactions Endpoint ────────────────────────────────────
      case "/interactions":
        return handleInteractions(request, env);

      // ── Discord Linked Roles OAuth2 flow ─────────────────────────────────
      case "/linked-roles/start":
        return handleLinkedRolesStart(request, env);

      case "/linked-roles/callback":
        return handleLinkedRolesCallback(request, env);

      case "/linked-roles/success":
        return handleLinkedRolesSuccess(request, env);

      // ── Liveness probe ───────────────────────────────────────────────────
      case "/health":
        return new Response(
          JSON.stringify({ status: "ok", service: "jaypventures-discord-bot" }),
          { headers: { "Content-Type": "application/json" } }
        );

      default:
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
    }
  },
};
