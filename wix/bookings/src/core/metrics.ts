import type { Env } from "../types/env";
import type { CRMRecord } from "../types/crm";

type MetricsSnapshot = {
  month: string;
  oneTimeRevenue: number;
  newMRR: number;
  totalMRR: number;
  byLaneBookings: Record<string, number>;
  byLaneSubscriptions: Record<string, number>;
  byLanePayments: Record<string, number>;
  memberMRR: Record<string, number>;
};

type BookingTrend = {
  current: number;
  previous: number;
};

const LANE_KEYS = [
  "JayPVentures LLC",
  "jaypventures creator",
  "All Ventures Access",
  "JayPVentures Music",
  "JayPVentures Travel",
  "UNKNOWN",
];

function getMonthKey(date: string): string {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function defaultSnapshot(month: string): MetricsSnapshot {
  return {
    month,
    oneTimeRevenue: 0,
    newMRR: 0,
    totalMRR: 0,
    byLaneBookings: {},
    byLaneSubscriptions: {},
    byLanePayments: {},
    memberMRR: {},
  };
}

export async function updateMetrics(
  env: Env,
  record: CRMRecord & {
    mrr?: number;
    isRecurring?: boolean;
  }
): Promise<MetricsSnapshot> {
  if (!env.METRICS_KV) {
    throw new Error("METRICS_KV not configured");
  }

  const monthKey = getMonthKey(record.occurredAt);
  const storageKey = `metrics:${monthKey}`;

  const existingRaw = await env.METRICS_KV.get(storageKey);
  const snapshot: MetricsSnapshot = existingRaw ? JSON.parse(existingRaw) : defaultSnapshot(monthKey);

  const lane = record.lane ?? "UNKNOWN";

  if (record.source === "bookings" && record.eventType.startsWith("booking.")) {
    snapshot.byLaneBookings[lane] = (snapshot.byLaneBookings[lane] ?? 0) + 1;
    await incrementBookingDaily(env, lane, record.occurredAt);

    if (!record.isRecurring) {
      snapshot.oneTimeRevenue += record.expectedRevenue ?? 0;
    }
  }

  if (record.eventType.startsWith("subscription.")) {
    snapshot.byLaneSubscriptions[lane] = (snapshot.byLaneSubscriptions[lane] ?? 0) + 1;

    const memberId = record.memberstackId ?? record.stripeCustomerId ?? null;
    if (!memberId) {
      await env.METRICS_KV.put(storageKey, JSON.stringify(snapshot));
      return snapshot;
    }

    const previousMRR = snapshot.memberMRR[memberId] ?? 0;
    const newMRRValue = record.mrr ?? 0;

    if (record.eventType === "subscription.created") {
      snapshot.memberMRR[memberId] = newMRRValue;
      snapshot.newMRR += newMRRValue;
      snapshot.totalMRR += newMRRValue;
    }

    if (record.eventType === "subscription.updated") {
      const delta = newMRRValue - previousMRR;
      snapshot.memberMRR[memberId] = newMRRValue;
      snapshot.totalMRR += delta;
    }

    if (record.eventType === "subscription.cancelled") {
      snapshot.totalMRR -= previousMRR;
      delete snapshot.memberMRR[memberId];
    }
  }

  if (record.eventType.startsWith("payment.")) {
    snapshot.byLanePayments[lane] = (snapshot.byLanePayments[lane] ?? 0) + 1;

    if (!record.isRecurring) {
      snapshot.oneTimeRevenue += record.expectedRevenue ?? 0;
    }
  }

  await env.METRICS_KV.put(storageKey, JSON.stringify(snapshot));

  return snapshot;
}

export async function getCurrentMonthSnapshot(env: Env): Promise<MetricsSnapshot> {
  if (!env.METRICS_KV) {
    throw new Error("METRICS_KV not configured");
  }

  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const storageKey = `metrics:${monthKey}`;

  const raw = await env.METRICS_KV.get(storageKey);

  if (!raw) {
    return defaultSnapshot(monthKey);
  }

  return JSON.parse(raw) as MetricsSnapshot;
}

export async function getBookingLaneTrends(env: Env): Promise<Record<string, BookingTrend>> {
  if (!env.METRICS_KV) {
    throw new Error("METRICS_KV not configured");
  }

  const trends: Record<string, BookingTrend> = {};
  for (const lane of LANE_KEYS) {
    trends[lane] = { current: 0, previous: 0 };
  }

  const today = new Date();
  for (let offset = 0; offset < 14; offset += 1) {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset));
    const dayKey = getDayKey(day.toISOString());
    const bucket = offset < 7 ? "current" : "previous";

    for (const lane of LANE_KEYS) {
      const count = await getDailyCount(env, lane, dayKey);
      trends[lane][bucket] += count;
    }
  }

  return trends;
}

async function incrementBookingDaily(env: Env, lane: string, occurredAt: string): Promise<void> {
  const dayKey = getDayKey(occurredAt);
  const key = `metrics:bookings:${dayKey}:${sanitizeLaneKey(lane)}`;
  const current = await env.METRICS_KV?.get(key);
  const value = Number.parseInt(current || "0", 10);
  const next = Number.isFinite(value) ? value + 1 : 1;
  await env.METRICS_KV?.put(key, String(next), { expirationTtl: 60 * 60 * 24 * 90 });
}

async function getDailyCount(env: Env, lane: string, dayKey: string): Promise<number> {
  const key = `metrics:bookings:${dayKey}:${sanitizeLaneKey(lane)}`;
  const stored = await env.METRICS_KV?.get(key);
  if (!stored) return 0;
  const value = Number.parseInt(stored, 10);
  return Number.isFinite(value) ? value : 0;
}

function sanitizeLaneKey(lane: string): string {
  return lane.replace(/\s+/g, "_").toLowerCase();
}

function getDayKey(date: string): string {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
