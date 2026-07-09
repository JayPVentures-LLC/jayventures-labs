export type EnvironmentalResponsibilityLevel = "RESPONSIBLE" | "WATCH" | "HARM_RISK" | "UNACCEPTABLE_RISK";

export interface EnvironmentalResponsibilitySignal {
  timestamp: string;
  energyShockRisk: number;
  climateDisruptionRisk: number;
  pollutionExposure: number;
  supplyChainEnvironmentalStress: number;
  waterSecurityPressure: number;
  foodSecurityPressure: number;
  communityHealthRisk: number;
  environmentalJusticeRisk: number;
  corporateResponsibilityRisk: number;
}

export interface EnvironmentalResponsibilityAssessment {
  timestamp: string;
  score: number;
  level: EnvironmentalResponsibilityLevel;
  drivers: string[];
  requiredSafeguards: string[];
  prohibitedActions: string[];
  humanReviewRequired: true;
  harmExternalizationAllowed: false;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function assessEnvironmentalResponsibility(
  signal: EnvironmentalResponsibilitySignal
): EnvironmentalResponsibilityAssessment {
  const score = Math.round(
    clamp(signal.energyShockRisk) * 8 +
    clamp(signal.climateDisruptionRisk) * 14 +
    clamp(signal.pollutionExposure) * 14 +
    clamp(signal.supplyChainEnvironmentalStress) * 10 +
    clamp(signal.waterSecurityPressure) * 12 +
    clamp(signal.foodSecurityPressure) * 10 +
    clamp(signal.communityHealthRisk) * 14 +
    clamp(signal.environmentalJusticeRisk) * 10 +
    clamp(signal.corporateResponsibilityRisk) * 8
  );

  const drivers: string[] = [];

  if (signal.energyShockRisk >= 0.6) drivers.push("Energy shock may increase unsafe or extractive substitution pressure.");
  if (signal.climateDisruptionRisk >= 0.6) drivers.push("Climate disruption risk is elevated.");
  if (signal.pollutionExposure >= 0.6) drivers.push("Pollution exposure risk is elevated.");
  if (signal.supplyChainEnvironmentalStress >= 0.6) drivers.push("Supply-chain environmental stress is elevated.");
  if (signal.waterSecurityPressure >= 0.6) drivers.push("Water security pressure is elevated.");
  if (signal.foodSecurityPressure >= 0.6) drivers.push("Food security pressure is elevated.");
  if (signal.communityHealthRisk >= 0.6) drivers.push("Community health risk is elevated.");
  if (signal.environmentalJusticeRisk >= 0.6) drivers.push("Environmental justice risk is elevated.");
  if (signal.corporateResponsibilityRisk >= 0.6) drivers.push("Corporate responsibility risk is elevated.");

  let level: EnvironmentalResponsibilityLevel = "RESPONSIBLE";
  if (score >= 75) level = "UNACCEPTABLE_RISK";
  else if (score >= 50) level = "HARM_RISK";
  else if (score >= 25) level = "WATCH";

  return {
    timestamp: signal.timestamp,
    score,
    level,
    drivers,
    requiredSafeguards: [
      "Require human review before public escalation or policy recommendation.",
      "Preserve environmental evidence snapshots.",
      "Disclose uncertainty and source quality.",
      "Assess community health impact before stabilization claims.",
      "Reject economic-success claims that depend on hidden pollution, unsafe labor, or ecological harm.",
      "Prioritize water, food, health, and vulnerable-community protections."
    ],
    prohibitedActions: [
      "Do not externalize economic risk onto vulnerable communities.",
      "Do not hide environmental costs behind market-stability claims.",
      "Do not recommend actions that worsen pollution exposure.",
      "Do not ignore water, food, climate, or public-health impacts.",
      "Do not treat short-term market gains as success if ecological harm increases."
    ],
    humanReviewRequired: true,
    harmExternalizationAllowed: false
  };
}
