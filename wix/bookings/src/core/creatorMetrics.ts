import type { Env } from "../types/env";
import { detectSpikes } from "./spikeEngine";

export type CreatorSummary = {
  windowDays: number;
  totalViews: number;
  totalProfileViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  spikesDetected: number;
  topCTA: string;
};

export type CreatorMetricsPayload = {
  memberId?: string | null;
  summary: CreatorSummary;
  spikes: ReturnType<typeof detectSpikes>;
};

function safeNum(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function getCreatorMetrics(env: Env): Promise<CreatorMetricsPayload> {
  if (!env.CREATOR_DATA_KV) {
    throw new Error("CREATOR_DATA_KV not configured");
  }

  const raw = await env.CREATOR_DATA_KV.get("creator:last60");
  if (!raw) {
    return {
      summary: {
        windowDays: 60,
        totalViews: 0,
        totalProfileViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
        spikesDetected: 0,
        topCTA: "Push Booking Link",
      },
      spikes: [],
    };
  }

  const rows = JSON.parse(raw) as Record<string, unknown>[];

  const totalViews = rows.reduce((sum, row) => sum + safeNum(row["Video Views"]), 0);
  const totalProfileViews = rows.reduce((sum, row) => sum + safeNum(row["Profile Views"]), 0);
  const totalLikes = rows.reduce((sum, row) => sum + safeNum(row["Likes"]), 0);
  const totalComments = rows.reduce((sum, row) => sum + safeNum(row["Comments"]), 0);
  const totalShares = rows.reduce((sum, row) => sum + safeNum(row["Shares"]), 0);

  const avgEngagementRate =
    totalViews > 0 ? (totalLikes + totalComments + totalShares) / totalViews : 0;

  const spikes = detectSpikes(rows, 7, 2.0);
  const topCTA = spikes.length > 0 ? spikes[0].recommendedCTA : "Push Booking Link";

  return {
    summary: {
      windowDays: rows.length,
      totalViews,
      totalProfileViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate,
      spikesDetected: spikes.length,
      topCTA,
    },
    spikes,
  };
}
