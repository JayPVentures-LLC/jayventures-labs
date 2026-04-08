import type { Env } from "../types/env";
import { requireInnerCircle } from "../utils/auth";
import { generateInnerCircleHTML } from "../ui/innerCirclePortal";
import { toInnerCircleView } from "../core/innerCircleView";
import { getBookingLaneTrends, getCurrentMonthSnapshot } from "../core/metrics";
import {
  getOrCreateInnerCircleMember,
  getOrCreateInnerCircleMemberByKey,
  resolveInnerCircleMemberId,
} from "../core/innerCircleMembers";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleInnerCirclePortal(request: Request, env: Env): Promise<Response> {
  const gate = await requireInnerCircle(request, env);
  if (!gate.ok) return json(gate.body, gate.status);

  await getOrCreateInnerCircleMember(env, gate.claims);

  return new Response(generateInnerCircleHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function handleInnerCircleMetrics(request: Request, env: Env): Promise<Response> {
  const gate = await requireInnerCircle(request, env);
  if (!gate.ok) return json(gate.body, gate.status);

  const member = await getOrCreateInnerCircleMember(env, gate.claims);

  const snapshot = await getCurrentMonthSnapshot(env);
  const month = snapshot.month || "current";
  const trends = await getBookingLaneTrends(env);
  const view = toInnerCircleView(month, trends, member.memberId);

  return json(view, 200);
}

function isAdminToken(request: Request, env: Env): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth || !env.ADMIN_UPLOAD_TOKEN) return false;
  return auth === `Bearer ${env.ADMIN_UPLOAD_TOKEN}`;
}

function isInnerCircleTier(value: unknown): boolean {
  if (typeof value !== "string") return true;
  const lower = value.toLowerCase();
  return lower.includes("inner") && lower.includes("circle");
}

function extractMemberKey(input: Record<string, unknown>): string | null {
  const direct =
    (input.memberKey as string | undefined) ||
    (input.memberId as string | undefined) ||
    (input.member_id as string | undefined) ||
    (input.id as string | undefined) ||
    (input.sub as string | undefined) ||
    (input.email as string | undefined);
  return direct ? String(direct) : null;
}

function isDryRun(request: Request, payload: Record<string, unknown> | null): boolean {
  const url = new URL(request.url);
  const queryFlag = url.searchParams.get("dryRun");
  if (queryFlag && queryFlag.toLowerCase() === "true") return true;
  if (payload && payload.dryRun === true) return true;
  return false;
}

function extractRecords(payload: unknown):
  | { ok: true; records: Array<Record<string, unknown>>; dryRunPayload: Record<string, unknown> | null }
  | { ok: false; error: string } {
  if (Array.isArray(payload)) {
    return { ok: true, records: payload as Array<Record<string, unknown>>, dryRunPayload: null };
  }

  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    const records = typed.records;
    if (Array.isArray(records)) {
      return { ok: true, records: records as Array<Record<string, unknown>>, dryRunPayload: typed };
    }
    return { ok: false, error: "Payload must contain a records array" };
  }

  return { ok: false, error: "Payload must be an array" };
}

export async function handleInnerCircleBackfill(request: Request, env: Env): Promise<Response> {
  if (!isAdminToken(request, env)) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed", allowed: ["POST"] }, 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const extracted = extractRecords(payload);
  if (!extracted.ok) {
    return json({ error: extracted.error }, 400);
  }

  const dryRun = isDryRun(request, extracted.dryRunPayload);
  const records = extracted.records;

  const results: Array<Record<string, unknown>> = [];
  const preview: Array<Record<string, unknown>> = [];
  const validationErrors: Array<Record<string, unknown>> = [];
  let created = 0;
  let existing = 0;
  let skipped = 0;
  let errors = 0;
  let valid = 0;

  for (let index = 0; index < records.length; index += 1) {
    const raw = records[index];
    if (!raw || typeof raw !== "object") {
      errors += 1;
      validationErrors.push({ index, reason: "invalid_item" });
      results.push({ status: "error", error: "invalid_item" });
      continue;
    }

    const item = raw as Record<string, unknown>;
    if (!isInnerCircleTier(item.tier)) {
      skipped += 1;
      validationErrors.push({ index, reason: "not_inner_circle" });
      results.push({ status: "skipped", reason: "not_inner_circle" });
      continue;
    }

    const memberKey = extractMemberKey(item);
    if (!memberKey) {
      errors += 1;
      validationErrors.push({ index, reason: "missing_member_key" });
      results.push({ status: "error", error: "missing_member_key" });
      continue;
    }

    valid += 1;

    const existingId = await resolveInnerCircleMemberId(env, memberKey);
    if (existingId) {
      existing += 1;
      if (preview.length < 5) {
        preview.push({
          memberKey,
          memberId: existingId,
          email: typeof item.email === "string" ? item.email : undefined,
          name: typeof item.name === "string" ? item.name : undefined,
          tier: typeof item.tier === "string" ? item.tier : undefined,
          status: "existing",
        });
      }
      results.push({ status: "existing", memberKey, memberId: existingId });
      continue;
    }

    const memberId = await getOrCreateInnerCircleMemberByKey(env, memberKey, {
      email: typeof item.email === "string" ? item.email : undefined,
      name: typeof item.name === "string" ? item.name : undefined,
    }, { dryRun });

    if (!memberId) {
      errors += 1;
      validationErrors.push({ index, reason: "kv_unavailable" });
      results.push({ status: "error", memberKey, error: "kv_unavailable" });
      continue;
    }

    created += 1;
    if (preview.length < 5) {
      preview.push({
        memberKey,
        memberId,
        email: typeof item.email === "string" ? item.email : undefined,
        name: typeof item.name === "string" ? item.name : undefined,
        tier: typeof item.tier === "string" ? item.tier : undefined,
        status: "created",
      });
    }
    results.push({ status: "created", memberKey, memberId });
  }

  return json(
    {
      processed: records.length,
      created,
      existing,
      skipped,
      errors,
      results,
      dryRun,
      totalRecordsReceived: records.length,
      totalRecordsValid: valid,
      totalRecordsRejected: records.length - valid,
      samplePreview: preview,
      validationErrors,
    },
    200
  );
}
