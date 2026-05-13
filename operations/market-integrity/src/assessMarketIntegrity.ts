export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface MarketSignal {
  asset: string;
  timestamp: string;
  volatility: number;
  liquidityDrop: number;
  concentrationRisk: number;
  socialAmplification: number;
  governanceRisk: number;
  source: string;
  notes?: string;
}

export interface IntegrityAssessment {
  asset: string;
  timestamp: string;
  score: number;
  level: RiskLevel;
  reasons: string[];
  recommendedAction: string;
  autonomousExecutionAllowed: false;
  humanReviewRequired: true;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function assessMarketIntegrity(signal: MarketSignal): IntegrityAssessment {
  const volatility = clamp(signal.volatility);
  const liquidityDrop = clamp(signal.liquidityDrop);
  const concentrationRisk = clamp(signal.concentrationRisk);
  const socialAmplification = clamp(signal.socialAmplification);
  const governanceRisk = clamp(signal.governanceRisk);

  const score = Math.round(
    volatility * 25 +
    liquidityDrop * 25 +
    concentrationRisk * 20 +
    socialAmplification * 15 +
    governanceRisk * 15
  );

  const reasons: string[] = [];

  if (volatility >= 0.70) reasons.push("Elevated volatility detected.");
  if (liquidityDrop >= 0.50) reasons.push("Liquidity stress detected.");
  if (concentrationRisk >= 0.60) reasons.push("Concentration risk detected.");
  if (socialAmplification >= 0.70) reasons.push("Possible amplification anomaly detected.");
  if (governanceRisk >= 0.60) reasons.push("Governance integrity risk detected.");

  let level: RiskLevel = "LOW";
  if (score >= 80) level = "CRITICAL";
  else if (score >= 60) level = "HIGH";
  else if (score >= 35) level = "MODERATE";

  const recommendedAction =
    level === "CRITICAL"
      ? "Freeze automated escalation, preserve evidence, require immediate human review."
      : level === "HIGH"
        ? "Create evidence package and route for human review."
        : level === "MODERATE"
          ? "Monitor trend and increase verification frequency."
          : "Continue passive monitoring.";

  return {
    asset: signal.asset,
    timestamp: signal.timestamp,
    score,
    level,
    reasons,
    recommendedAction,
    autonomousExecutionAllowed: false,
    humanReviewRequired: true
  };
}
