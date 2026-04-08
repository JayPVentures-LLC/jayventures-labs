export type SpikeEvent = {
  dayIndex: number;
  dateLabel: string;
  views: number;
  profileViews: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  rollingAvg: number;
  spikeMultiplier: number;
  recommendedCTA: string;
};

function safeNum(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function detectSpikes(rows: Record<string, unknown>[], window = 7, threshold = 2.0): SpikeEvent[] {
  const spikes: SpikeEvent[] = [];
  const viewsSeries = rows.map((row) => safeNum(row["Video Views"]));

  for (let i = 0; i < rows.length; i += 1) {
    const start = Math.max(0, i - window);
    const slice = viewsSeries.slice(start, i);
    const rollingAvg = slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 0;

    const views = viewsSeries[i];
    if (rollingAvg <= 0) continue;

    const spikeMultiplier = views / rollingAvg;
    if (spikeMultiplier < threshold) continue;

    const profileViews = safeNum(rows[i]["Profile Views"]);
    const likes = safeNum(rows[i]["Likes"]);
    const comments = safeNum(rows[i]["Comments"]);
    const shares = safeNum(rows[i]["Shares"]);

    const engagementRate = views > 0 ? (likes + comments + shares) / views : 0;

    let recommendedCTA = "Push Booking Link";
    if (views > 0 && profileViews / views > 0.05) recommendedCTA = "Push Consultation Booking";
    if (engagementRate > 0.2) recommendedCTA = "Push All Ventures Access";
    if (likes > 0 && comments > likes * 0.1) recommendedCTA = "Go Live and Pitch Inner Circle";

    spikes.push({
      dayIndex: i + 1,
      dateLabel: String(rows[i]["Date"] ?? `Day ${i + 1}`),
      views,
      profileViews,
      likes,
      comments,
      shares,
      engagementRate,
      rollingAvg,
      spikeMultiplier,
      recommendedCTA,
    });
  }

  return spikes.sort((a, b) => b.spikeMultiplier - a.spikeMultiplier);
}
