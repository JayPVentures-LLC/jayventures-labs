import type { Env } from "../types/env";
import { getCreatorMetrics } from "../core/creatorMetrics";
import { requireInnerCircle } from "../utils/auth";
import { generateCreatorPortalHTML } from "../ui/creatorPortal";
import { getOrCreateInnerCircleMember } from "../core/innerCircleMembers";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreatorPortal(request: Request, env: Env): Promise<Response> {
  const gate = await requireInnerCircle(request, env);
  if (!gate.ok) return json(gate.body, gate.status);

  await getOrCreateInnerCircleMember(env, gate.claims);

  return new Response(generateCreatorPortalHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function isAdminToken(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth || !env.ADMIN_UPLOAD_TOKEN) return false;
  return auth === `Bearer ${env.ADMIN_UPLOAD_TOKEN}`;
}

export async function handleCreatorMetrics(request: Request, env: Env): Promise<Response> {
  let memberId: string | null = null;
  if (!isAdminToken(request, env)) {
    const gate = await requireInnerCircle(request, env);
    if (!gate.ok) return json(gate.body, gate.status);
    const member = await getOrCreateInnerCircleMember(env, gate.claims);
    memberId = member.memberId ?? null;
  }

  const data = await getCreatorMetrics(env);
  return json({ ...data, memberId }, 200);
}

export async function handleCreatorUpload(request: Request, env: Env): Promise<Response> {
  if (!isAdminToken(request, env)) {
    const gate = await requireInnerCircle(request, env);
    if (!gate.ok) return json(gate.body, gate.status);
  }

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  if (!env.CREATOR_DATA_KV) {
    return json({ error: "CREATOR_DATA_KV not configured" }, 500);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!Array.isArray(payload)) {
    return json({ error: "Payload must be an array" }, 400);
  }

  await env.CREATOR_DATA_KV.put("creator:last60", JSON.stringify(payload));
  return json({ status: "uploaded", rows: payload.length }, 200);
}
