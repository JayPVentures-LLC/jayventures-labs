export type StabilizationLevel = "STABLE" | "WATCH" | "STRESSED" | "SYSTEMIC_RISK";

export interface MacroStabilitySignal {
  timestamp: string;
  oilShock: number;
  geopoliticalRisk: number;
  inflationPressure: number;
  ratePressure: number;
  liquidityStress: number;
  creditStress: number;
  marketConcentration: number;
  weakMarketBreadth: number;
  misinformationRisk: number;
}

export interface StabilizationAssessment {
  timestamp: string;
  score: number;
  level: StabilizationLevel;
  drivers: string[];
  recommendedActions: string[];
  prohibitedActions: string[];
  humanReviewRequired: true;
  autonomousMarketInterventionAllowed: false;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function assessEconomicStabilization(signal: MacroStabilitySignal): StabilizationAssessment {
  const score = Math.round(
    clamp(signal.oilShock) * 12 +
    clamp(signal.geopoliticalRisk) * 12 +
    clamp(signal.inflationPressure) * 12 +
    clamp(signal.ratePressure) * 10 +
    clamp(signal.liquidityStress) * 16 +
    clamp(signal.creditStress) * 16 +
    clamp(signal.marketConcentration) * 8 +
    clamp(signal.weakMarketBreadth) * 8 +
    clamp(signal.misinformationRisk) * 6
  );

  const drivers: string[] = [];

  if (signal.oilShock >= 0.6) drivers.push("Energy-price shock risk is elevated.");
  if (signal.geopoliticalRisk >= 0.6) drivers.push("Geopolitical instability is pressuring risk assets.");
  if (signal.inflationPressure >= 0.6) drivers.push("Inflation pressure may reduce policy flexibility.");
  if (signal.ratePressure >= 0.6) drivers.push("Rate expectations may be tightening financial conditions.");
  if (signal.liquidityStress >= 0.6) drivers.push("Liquidity stress is increasing.");
  if (signal.creditStress >= 0.6) drivers.push("Credit stress is increasing.");
  if (signal.marketConcentration >= 0.6) drivers.push("Index strength is overly dependent on concentrated leadership.");
  if (signal.weakMarketBreadth >= 0.6) drivers.push("Market breadth is weak.");
  if (signal.misinformationRisk >= 0.6) drivers.push("Information-quality risk is elevated.");

  let level: StabilizationLevel = "STABLE";

  if (score >= 75) level = "SYSTEMIC_RISK";
  else if (score >= 50) level = "STRESSED";
  else if (score >= 25) level = "WATCH";

  return {
    timestamp: signal.timestamp,
    score,
    level,
    drivers,
    recommendedActions: [
      "Preserve evidence snapshots for all stability assessments.",
      "Increase monitoring frequency for liquidity, credit, energy, and volatility signals.",
      "Publish transparent risk explanations without price-direction claims.",
      "Flag misinformation and unsourced claims for human review.",
      "Prioritize education, disclosure, and participant protection.",
      "Route high-risk findings to human reviewers before any public escalation."
    ],
    prohibitedActions: [
      "Do not trade autonomously.",
      "Do not attempt to move prices.",
      "Do not manipulate sentiment.",
      "Do not suppress lawful market participation.",
      "Do not issue unsupported financial predictions.",
      "Do not target individuals or political groups."
    ],
    humanReviewRequired: true,
    autonomousMarketInterventionAllowed: false
  };
}
