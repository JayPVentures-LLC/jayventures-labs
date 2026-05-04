
async function syncStripeEntitlement(env: any, event: any) {
  const data = event?.data?.object ?? event;
  const metadata = data?.metadata ?? event?.metadata ?? {};

  const userId =
    metadata.user_id ??
    metadata.discord_user_id ??
    event?.user_id ??
    event?.target_user_id;

  const stripeCustomerId =
    data?.customer ??
    event?.stripe_customer_id ??
    metadata.stripe_customer_id;

  const subscriptionId =
    data?.id ??
    event?.subscription_id ??
    metadata.subscription_id;

  const status =
    data?.status ??
    event?.status ??
    metadata.status;

  const tier =
    metadata.tier ??
    event?.tier ??
    "vip";

  if (!userId) {
    return {
      ok: false,
      error: "missing_user_id"
    };
  }

  if (!stripeCustomerId) {
    return {
      ok: false,
      error: "missing_stripe_customer_id"
    };
  }

  const activeStatuses = ["active", "trialing"];
  const inactiveStatuses = ["canceled", "unpaid", "incomplete_expired"];

  if (!status) {
    return {
      ok: false,
      error: "missing_subscription_status"
    };
  }

  const key = userId;

  if (activeStatuses.includes(status)) {
    const record = {
      user_id: userId,
      tier,
      entitlement_active: true,
      source: "stripe",
      stripe_customer_id: stripeCustomerId,
      subscription_id: subscriptionId ?? null,
      subscription_status: status,
      updated_at: new Date().toISOString()
    };

    await env.INNER_CIRCLE_MEMBER_KV.put(key, JSON.stringify(record));

    return {
      ok: true,
      action: "ENTITLEMENT_ACTIVE",
      user_id: userId,
      record
    };
      if (!env.INNER_CIRCLE_MEMBER_KV) {
        return Response.json({ error: "KV not configured" }, { status: 500 });
      }

  }

  if (inactiveStatuses.includes(status)) {
    await env.INNER_CIRCLE_MEMBER_KV.delete(key);

    return {
      ok: true,
      action: "ENTITLEMENT_INACTIVE",
      user_id: userId,
      subscription_status: status
    };
  }

  return {
    ok: false,
    error: "unsupported_subscription_status",
    status
  };
}


async function validateEntitlementTruth(env: any, event: any) {
  const metadata = event?.metadata ?? {};
  const action = event?.action ?? event?.type ?? "unknown";
  const reason = metadata.reason ?? metadata.decision_reason;
  const userId = metadata.user_id ?? event?.user_id ?? event?.target_user_id;

  const violations: string[] = [];

  if (!["role_assign", "role_remove"].includes(action)) {
    return violations;
  }

  if (!userId) {
    violations.push("missing_entitlement_user_id");
    return violations;
  }

  const entitlementRecord = await env.INNER_CIRCLE_MEMBER_KV.get(userId);
  const entitlementActive = !!entitlementRecord;

  if (action === "role_assign" && entitlementActive !== true) {
    violations.push("entitlement_required_for_role_assign");
  }

  if (
    action === "role_remove" &&
    reason === "entitlement_expired" &&
    entitlementActive !== false
  ) {
    violations.push("entitlement_must_be_inactive_for_expiration_removal");
  }

  return violations;
}


async function enforceIdempotency(env: any, event: any) {
  const eventId = event?.id ?? event?.event_id;

  if (!eventId) {
    return {
      allowed: false,
      error: "missing_event_id"
    };
  }

  const key = "jpv:safety:idempotency:" + eventId;
  const existing = await env.IDEMPOTENCY_KV.get(key);

  if (existing) {
    return {
      allowed: false,
      error: "duplicate_event"
    };
  }

  await env.IDEMPOTENCY_KV.put(
    key,
    JSON.stringify({
      event_id: eventId,
      first_seen_at: new Date().toISOString()
    }),
    { expirationTtl: 86400 }
  );

  return {
    allowed: true,
    key
  };
}




const APPROVED_DECISION_REASONS = [
  "entitlement_expired",
  "policy_violation",
  "user_requested_removal",
  "fraud_prevention",
  "safety_escalation",
  "admin_correction",
  "entitlement_verified"
];

const APPROVED_SEVERITIES = ["low", "medium", "high", "critical"];

const ACTION_REASON_MAP: Record<string, string[]> = {
  role_remove: ["entitlement_expired", "policy_violation", "user_requested_removal", "admin_correction",
  "entitlement_verified"
],
  role_assign: ["entitlement_verified"],
  ban: ["fraud_prevention", "safety_escalation", "policy_violation"],
  suspend: ["fraud_prevention", "safety_escalation", "policy_violation"],
  access_revoke: ["policy_violation", "fraud_prevention", "admin_correction",
  "entitlement_verified"
],
  account_disable: ["fraud_prevention", "safety_escalation", "policy_violation"]
};

const HIGH_IMPACT_ACTIONS = [
  "ban",
  "suspend",
  "role_remove",
  "access_revoke",
  "account_disable"
];

type SafetyDecision = {
  allowed: boolean;
  violations: string[];
};

function enforceJPVSafety(event: any, env?: any): SafetyDecision {
  const violations: string[] = [];
  const metadata = event?.metadata ?? {};
  const action = event?.action ?? event?.type ?? "unknown";

  if (env?.JPV_SAFETY_LOCKDOWN === "true" && HIGH_IMPACT_ACTIONS.includes(action)) {
    violations.push("safety_lockdown_active");
  }

  if (!metadata.user_notice) violations.push("missing_user_notice");

  const reason = metadata.reason ?? metadata.decision_reason;
  if (!reason) {
    violations.push("missing_decision_reason");
  } else if (!APPROVED_DECISION_REASONS.includes(reason)) {
    violations.push("unapproved_decision_reason");
  }

  if (!metadata.actor_id) violations.push("missing_actor_id");
  if (!metadata.policy_id) violations.push("missing_policy_id");
  if (!metadata.rollback_supported) violations.push("missing_rollback_supported");

  if (!metadata.doctrine_version) {
    violations.push("missing_doctrine_version");
  }

  if (ACTION_REASON_MAP[action] && reason && !ACTION_REASON_MAP[action].includes(reason)) {
    violations.push("reason_not_allowed_for_action");
  }

  if (HIGH_IMPACT_ACTIONS.includes(action)) {
    if (!metadata.expires_at) {
      violations.push("missing_expiration");
    } else {
      const expiresAt = Date.parse(metadata.expires_at);
      if (Number.isNaN(expiresAt)) {
        violations.push("invalid_expiration");
      } else if (expiresAt <= Date.now()) {
        violations.push("expiration_must_be_future");
      }
    }
  }

  if (!metadata.severity) {
    violations.push("missing_severity");
  } else if (!APPROVED_SEVERITIES.includes(metadata.severity)) {
    violations.push("invalid_severity");
  }

  if (HIGH_IMPACT_ACTIONS.includes(action) && !metadata.appeal_path) {
    violations.push("missing_appeal_path");
  }

  if (
    HIGH_IMPACT_ACTIONS.includes(action) &&
    ["high", "critical"].includes(metadata.severity)
  ) {
    if (metadata.requires_second_approval !== true) {
      violations.push("missing_second_approval_requirement");
    }

    if (!metadata.approver_id) {
      violations.push("missing_approver_id");
    }

    if (metadata.approver_id && metadata.approver_id === metadata.actor_id) {
      violations.push("approver_cannot_match_actor");
    }
  }

  if (metadata.silent_enforcement === true) violations.push("silent_enforcement_denied");
  if (metadata.unbounded_admin_action === true) violations.push("unbounded_admin_action_denied");

  return { allowed: violations.length === 0, violations };
}

async function auditSafetyDecision(env: any, event: any, decision: SafetyDecision) {
  const auditId = crypto.randomUUID();

  const auditRecord = {
    audit_id: auditId,
    timestamp: new Date().toISOString(),
    event_id: event?.id ?? auditId,
    action: event?.action ?? event?.type ?? "unknown",
    actor_id: event?.metadata?.actor_id ?? "missing",
    policy_id: event?.metadata?.policy_id ?? "missing",
    result: decision.allowed ? "ALLOW" : "DENY",
    violations: decision.violations
  };

  await env.METRICS_KV.put("jpv:safety:audit:" + auditId, JSON.stringify(auditRecord));

  if (!decision.allowed) {
    await env.WORKER_EVENTS_QUEUE.send({
      type: "JPV_SAFETY_VIOLATION",
      audit: auditRecord
    });
  }

  return auditRecord;
}

import type { Env } from "./types/env";
import { handleIntake } from "./routes/intake";
import { getMetricsSnapshot } from "./core/metrics";
import { handleInnerCircleBackfill, handleInnerCircleMetrics, handleInnerCirclePortal } from "./routes/innerCircle";
import { handleCreatorMetrics, handleCreatorPortal, handleCreatorUpload } from "./routes/creatorPortal";
import { archiveEvent, sendTelemetry, type WorkerEventMessage } from "./core/azure/observability";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // STRIPE_ENTITLEMENT_SYNC_TEST_ROUTE
    if (env.ENVIRONMENT === "dev" && url.pathname === "/stripe/entitlement-test") {
      const internalToken = request.headers.get("x-jpv-internal-test-token");

      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await request.json();
      const result = await syncStripeEntitlement(env, body);

      if (!result.ok) {
        return Response.json(result, { status: 400 });
      }

      return Response.json(result);
    }



    // ENTITLEMENT_REMOVE_TEST_ROUTE
    if (env.ENVIRONMENT === "dev" && url.pathname === "/entitlement/remove-test") {
      const internalToken = request.headers.get("x-jpv-internal-test-token");

      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as Record<string, unknown>;
      const userId = body?.user_id as string | undefined;

      if (!userId) {
        return Response.json({ error: "missing_user_id" }, { status: 400 });
      }

      if (!env.INNER_CIRCLE_MEMBER_KV) {
        return Response.json({ error: "KV not configured" }, { status: 500 });
      }

      await env.INNER_CIRCLE_MEMBER_KV.delete(userId);

      return Response.json({
        status: "ENTITLEMENT_REMOVED",
        user_id: userId,
        entitlement_active: false
      });
    }



    // ENTITLEMENT_SET_TEST_ROUTE
    if (env.ENVIRONMENT === "dev" && url.pathname === "/entitlement/set-test") {
      const internalToken = request.headers.get("x-jpv-internal-test-token");

      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as Record<string, unknown>;
      const userId = body?.user_id as string | undefined;
      const tier = (body?.tier as string | undefined) ?? "vip";

      if (!userId) {
        return Response.json({ error: "missing_user_id" }, { status: 400 });
      }

      const record = {
        user_id: userId,
        tier,
        entitlement_active: true,
        source: "dev-test",
        created_at: new Date().toISOString()
      };

      if (!env.INNER_CIRCLE_MEMBER_KV) {
        return Response.json({ error: "KV not configured" }, { status: 500 });
      }

      await env.INNER_CIRCLE_MEMBER_KV.put(userId, JSON.stringify(record));

      return Response.json({
        status: "ENTITLEMENT_SET",
        record
      });
    }



    // ENTITLEMENT_CHECK_ROUTE
    if (url.pathname === "/entitlement/check") {
      const internalToken = request.headers.get("x-jpv-internal-test-token");

      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = (await request.json()) as Record<string, unknown>;
      const userId = body?.user_id as string | undefined;

      if (!userId) {
        return Response.json({ error: "missing_user_id" }, { status: 400 });
      }

      const entitlement = await env.INNER_CIRCLE_MEMBER_KV.get(userId);

      return Response.json({
        user_id: userId,
        entitlement_active: !!entitlement,
        source: "kv"
      });
    }



    if (url.pathname.startsWith("/audit/")) {
      // AUDIT_INTERNAL_TOKEN_ENFORCEMENT
      const internalToken = request.headers.get("x-jpv-internal-test-token");
      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json(
          { error: "Unauthorized", detail: "Bad or missing internal audit token" },
          { status: 401 }
        );
      }
      const auditId = url.pathname.split("/").pop();

      if (!auditId) {
        return Response.json({ error: "missing_audit_id" }, { status: 400 });
      }

      const record = await env.METRICS_KV.get("jpv:safety:audit:" + auditId);

      if (!record) {
        return Response.json({ error: "not_found" }, { status: 404 });
      }

      return Response.json(JSON.parse(record));
    }



    if (env.ENVIRONMENT === "dev" && url.pathname === "/safety-test") {
      const internalToken = request.headers.get("x-jpv-internal-test-token");
      if (env.JPV_INTERNAL_TEST_TOKEN && internalToken !== env.JPV_INTERNAL_TEST_TOKEN) {
        return Response.json({ error: "Unauthorized", detail: "Bad or missing internal test token" }, { status: 401 });
      }
      const payload = await request.json();

      // SAFETY_TEST_IDEMPOTENCY_ENFORCEMENT
      const idempotency = await enforceIdempotency(env, payload);
      if (!idempotency.allowed) {
        return Response.json(
          {
            error: idempotency.error,
            detail: "Event already processed or missing event id"
          },
          { status: idempotency.error === "duplicate_event" ? 409 : 400 }
        );
      }

      const safetyDecision = enforceJPVSafety(payload, env);

      // SAFETY_TEST_ENTITLEMENT_TRUTH_ENFORCEMENT
      const entitlementViolations = await validateEntitlementTruth(env, payload);
      safetyDecision.violations.push(...entitlementViolations);
      safetyDecision.allowed = safetyDecision.violations.length === 0;
      const auditRecord = await auditSafetyDecision(env, payload, safetyDecision);

      if (!safetyDecision.allowed) {
        return Response.json(
          {
            error: "DENIED_BY_JPV_SAFETY",
            audit_id: auditRecord.audit_id,
            violations: safetyDecision.violations
          },
          { status: 403 }
        );
      }

      return Response.json({
        status: "ALLOW",
        audit_id: auditRecord.audit_id
      });
    }


    if (url.pathname === "/webhook/intake") {

      // LIVE_JPV_SAFETY_ENFORCEMENT
      const clonedRequestForSafety = request.clone();

      try {
        const safetyPayload = await clonedRequestForSafety.json();

        // LIVE_IDEMPOTENCY_ENFORCEMENT
        const idempotency = await enforceIdempotency(env, safetyPayload);
        if (!idempotency.allowed) {
          return Response.json(
            {
              error: idempotency.error,
              detail: "Event already processed or missing event id"
            },
            { status: idempotency.error === "duplicate_event" ? 409 : 400 }
          );
        }

        const safetyDecision = enforceJPVSafety(safetyPayload, env);

        // LIVE_ENTITLEMENT_TRUTH_ENFORCEMENT
        const entitlementViolations = await validateEntitlementTruth(env, safetyPayload);
        safetyDecision.violations.push(...entitlementViolations);
        safetyDecision.allowed = safetyDecision.violations.length === 0;
        const auditRecord = await auditSafetyDecision(env, safetyPayload, safetyDecision);

        if (!safetyDecision.allowed) {
          return Response.json(
            {
              error: "DENIED_BY_JPV_SAFETY",
              audit_id: auditRecord.audit_id,
              violations: safetyDecision.violations
            },
            { status: 403 }
          );
        }

      // LIVE_STRIPE_ENTITLEMENT_SYNC
      if (
        safetyPayload?.type === "customer.subscription.created" ||
        safetyPayload?.type === "customer.subscription.updated" ||
        safetyPayload?.type === "customer.subscription.deleted"
      ) {
        const entitlementSync = await syncStripeEntitlement(env, safetyPayload);

        if (!entitlementSync.ok) {
          return Response.json(
            {
              error: "STRIPE_ENTITLEMENT_SYNC_FAILED",
              detail: entitlementSync
            },
            { status: 400 }
          );
        }

        await env.WORKER_EVENTS_QUEUE.send({
          type: "STRIPE_ENTITLEMENT_SYNCED",
          result: entitlementSync
        });
      }


      } catch (error) {
        return Response.json(
          {
            error: "DENIED_BY_JPV_SAFETY",
            detail: "Invalid JSON payload for safety evaluation"
          },
          { status: 400 }
        );
      }


      return handleIntake(request, env);
    }

    if (url.pathname === "/health") {
      return new Response("JayPVentures Unified Intake Engine Live", { status: 200 });
    }

    if (url.pathname === "/metrics") {
      const snapshot = await getMetricsSnapshot(env);
      return new Response(JSON.stringify(snapshot, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/inner-circle") {
      return handleInnerCirclePortal(request, env);
    }

    if (url.pathname === "/inner-circle/metrics") {
      return handleInnerCircleMetrics(request, env);
    }

    if (url.pathname === "/inner-circle/backfill") {
      return handleInnerCircleBackfill(request, env);
    }

    if (url.pathname === "/creator") {
      return handleCreatorPortal(request, env);
    }

    if (url.pathname === "/creator/metrics") {
      return handleCreatorMetrics(request, env);
    }

    if (url.pathname === "/creator/upload") {
      return handleCreatorUpload(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },

  async queue(batch: MessageBatch<WorkerEventMessage>, env: Env, ctx: ExecutionContext): Promise<void> {
    for (const message of batch.messages) {
      try {
        if (message.body.type === "action.plan.created") {
          await sendTelemetry(env, "action_plan_created", message.body.payload);
          message.ack();
          continue;
        }

        await archiveEvent(env, message.body);
        await sendTelemetry(env, `${message.body.payload.source}_${message.body.payload.event}`, message.body.payload.data);
        message.ack();
      } catch (error) {
        ctx.waitUntil(sendTelemetry(env, "bookings_queue_failure", {
          type: message.body.type,
          error: error instanceof Error ? error.message : String(error),
        }));
        message.retry();
      }
    }
  },
};






