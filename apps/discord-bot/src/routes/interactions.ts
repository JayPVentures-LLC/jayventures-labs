/**
 * POST /interactions
 *
 * Discord sends all slash commands, buttons, modals, and other interactions here.
 * This handler:
 *   1. Verifies the Ed25519 request signature — returns 401 on failure.
 *   2. Responds to PING (type 1) with PONG (type 1) — required for Discord endpoint verification.
 *   3. Returns 400 for unrecognised interaction types (extend as needed).
 *
 * Discord Developer Portal → Your App → General Information → Interactions Endpoint URL
 * Set to: https://<worker-hostname>/interactions
 */

import type { Env } from "../types/env";
import { verifyDiscordRequest } from "../lib/verify-discord-request";

// Interaction type constants
const INTERACTION_TYPE_PING = 1;

// Interaction response type constants
const RESPONSE_TYPE_PONG = 1;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleInteractions(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return new Response("Missing signature headers", { status: 401 });
  }

  // Read body before any parsing — required for signature verification
  const rawBody = await request.text();

  const isValid = await verifyDiscordRequest(
    env.DISCORD_PUBLIC_KEY,
    signature,
    timestamp,
    rawBody
  );

  if (!isValid) {
    return new Response("Invalid request signature", { status: 401 });
  }

  let interaction: Record<string, unknown>;
  try {
    interaction = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // PING — Discord sends this to verify the endpoint URL is reachable.
  // Must respond immediately with PONG.
  if (interaction.type === INTERACTION_TYPE_PING) {
    return jsonResponse({ type: RESPONSE_TYPE_PONG });
  }

  // Extend this switch as the bot grows (slash commands, components, modals…)
  return jsonResponse({ error: "Interaction type not yet supported" }, 400);
}
