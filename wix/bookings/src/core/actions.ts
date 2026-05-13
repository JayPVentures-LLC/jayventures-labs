import type { CRMRecord } from "../types/crm";
import type { Env } from "../types/env";

export type AccessAction =
  | {
      type: "discord.assign_role";
      lane: string;
      email?: string;
      roleKey: "COMMUNITY" | "VIP" | "INNER_CIRCLE";
      reason: string;
    }
  | {
      type: "crm.mark_entitlement";
      lane: string;
      email?: string;
      entitlement: string;
      reason: string;
    };

export type ActionPlan = {
  idempotencyKey: string;
  lane: string;
  eventType: string;
  actions: AccessAction[];
};

export type PersistActionPlanResult = {
  attempted: boolean;
  succeeded: boolean;
  key: string | null;
  error: string | null;
};

export function planActions(record: CRMRecord): ActionPlan {
  const actions: AccessAction[] = [];

  if (record.lane === "jaypventures creator" && record.eventType.startsWith("payment.")) {
    actions.push({
      type: "crm.mark_entitlement",
      lane: record.lane,
      email: record.email,
      entitlement: "creator_paid_access",
      reason: "Stripe payment mapped to jaypventures creator lane",
    });

    actions.push({
      type: "discord.assign_role",
      lane: record.lane,
      email: record.email,
      roleKey: "COMMUNITY",
      reason: "Paid creator-lane event",
    });
  }

  if (record.lane === "All Ventures Access" && record.eventType.startsWith("subscription.")) {
    actions.push({
      type: "crm.mark_entitlement",
      lane: record.lane,
      email: record.email,
      entitlement: "all_ventures_access",
      reason: "Subscription mapped to All Ventures Access",
    });

    actions.push({
      type: "discord.assign_role",
      lane: record.lane,
      email: record.email,
      roleKey: "VIP",
      reason: "All Ventures Access subscription",
    });
  }

  if (record.tier === "Inner Circle") {
    actions.push({
      type: "crm.mark_entitlement",
      lane: record.lane,
      email: record.email,
      entitlement: "inner_circle",
      reason: "Inner Circle tier detected",
    });

    actions.push({
      type: "discord.assign_role",
      lane: record.lane,
      email: record.email,
      roleKey: "INNER_CIRCLE",
      reason: "Inner Circle tier detected",
    });
  }

  return {
    idempotencyKey: record.idempotencyKey,
    lane: record.lane,
    eventType: record.eventType,
    actions,
  };
}

export async function persistActionPlan(env: Env, plan: ActionPlan): Promise<PersistActionPlanResult> {
  const key = `action_plan:${plan.idempotencyKey}`;

  if (!env.CREATOR_DATA_KV) {
    return {
      attempted: true,
      succeeded: false,
      key,
      error: "CREATOR_DATA_KV unavailable",
    };
  }

  try {
    await env.CREATOR_DATA_KV.put(
      key,
      JSON.stringify({
        ...plan,
        createdAt: new Date().toISOString(),
      }),
    );

    return {
      attempted: true,
      succeeded: true,
      key,
      error: null,
    };
  } catch (error) {
    return {
      attempted: true,
      succeeded: false,
      key,
      error: error instanceof Error ? error.message : "Unknown persistence error",
    };
  }
}
