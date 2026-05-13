import fs from "node:fs";
import path from "node:path";
import { assessMarketIntegrity, MarketSignal } from "./assessMarketIntegrity";
import { assessEconomicStabilization, MacroStabilitySignal } from "./economicStabilization";
import { assessEnvironmentalResponsibility, EnvironmentalResponsibilitySignal } from "./environmentalResponsibility";
import { assessIntegrityAlignment, IntegrityAlignmentSignal } from "./integrityAlignment";
import { writeEvidenceSnapshot } from "./evidenceSnapshot";

const marketSignals: MarketSignal[] = [
  {
    asset: "GLOBAL_MARKET_SAMPLE",
    timestamp: new Date().toISOString(),
    volatility: 0.42,
    liquidityDrop: 0.18,
    concentrationRisk: 0.31,
    socialAmplification: 0.22,
    governanceRisk: 0.27,
    source: "internal_sample",
    notes: "Replace sample values with verified public, licensed, or internal compliance-approved data."
  }
];

const macroSignal: MacroStabilitySignal = {
  timestamp: new Date().toISOString(),
  oilShock: Number(process.env.JPV_OIL_SHOCK ?? 0.65),
  geopoliticalRisk: Number(process.env.JPV_GEOPOLITICAL_RISK ?? 0.70),
  inflationPressure: Number(process.env.JPV_INFLATION_PRESSURE ?? 0.55),
  ratePressure: Number(process.env.JPV_RATE_PRESSURE ?? 0.50),
  liquidityStress: Number(process.env.JPV_LIQUIDITY_STRESS ?? 0.35),
  creditStress: Number(process.env.JPV_CREDIT_STRESS ?? 0.30),
  marketConcentration: Number(process.env.JPV_MARKET_CONCENTRATION ?? 0.70),
  weakMarketBreadth: Number(process.env.JPV_WEAK_MARKET_BREADTH ?? 0.60),
  misinformationRisk: Number(process.env.JPV_MISINFORMATION_RISK ?? 0.40)
};

const environmentalSignal: EnvironmentalResponsibilitySignal = {
  timestamp: new Date().toISOString(),
  energyShockRisk: Number(process.env.JPV_ENV_ENERGY_SHOCK_RISK ?? 0.55),
  climateDisruptionRisk: Number(process.env.JPV_ENV_CLIMATE_DISRUPTION_RISK ?? 0.60),
  pollutionExposure: Number(process.env.JPV_ENV_POLLUTION_EXPOSURE ?? 0.45),
  supplyChainEnvironmentalStress: Number(process.env.JPV_ENV_SUPPLY_CHAIN_STRESS ?? 0.50),
  waterSecurityPressure: Number(process.env.JPV_ENV_WATER_SECURITY_PRESSURE ?? 0.35),
  foodSecurityPressure: Number(process.env.JPV_ENV_FOOD_SECURITY_PRESSURE ?? 0.35),
  communityHealthRisk: Number(process.env.JPV_ENV_COMMUNITY_HEALTH_RISK ?? 0.45),
  environmentalJusticeRisk: Number(process.env.JPV_ENV_JUSTICE_RISK ?? 0.50),
  corporateResponsibilityRisk: Number(process.env.JPV_ENV_CORPORATE_RESPONSIBILITY_RISK ?? 0.55)
};

const integritySignal: IntegrityAlignmentSignal = {
  organization: "Sample Organization",
  timestamp: new Date().toISOString(),
  governanceTransparency: 0.85,
  environmentalResponsibility: 0.82,
  securityMaturity: 0.90,
  antiCorruptionCompliance: 0.88,
  laborAndHumanRights: 0.84,
  financialDisclosureIntegrity: 0.86,
  aiExplainability: 0.75,
  interoperabilitySupport: 0.92,
  incidentResponseDiscipline: 0.91,
  publicRiskDisclosure: 0.80,
  evidenceProvided: true,
  humanReviewed: true
};

const marketAssessments = marketSignals.map(assessMarketIntegrity);
const macroAssessment = assessEconomicStabilization(macroSignal);
const environmentalAssessment = assessEnvironmentalResponsibility(environmentalSignal);
const integrityAssessment = assessIntegrityAlignment(integritySignal);

const stabilizationApproved =
  macroAssessment.autonomousMarketInterventionAllowed === false &&
  environmentalAssessment.harmExternalizationAllowed === false &&
  environmentalAssessment.level !== "UNACCEPTABLE_RISK" &&
  integrityAssessment.blacklistingAllowed === false &&
  integrityAssessment.politicalTargetingAllowed === false &&
  integrityAssessment.antiCompetitiveEnforcementAllowed === false;

const evidence = writeEvidenceSnapshot({
  marketAssessments,
  macroAssessment,
  environmentalAssessment,
  integrityAssessment,
  stabilizationApproved
});

const reportsDir = path.resolve("operations", "market-integrity", "reports");
fs.mkdirSync(reportsDir, { recursive: true });

const reportPath = path.join(reportsDir, "latest-market-integrity-report.json");

fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      doctrine: "observe_verify_alert_document",
      stabilizationGoal:
        "Reduce fragility, improve transparency, protect participants, support integrity-aligned organizations, and reject hidden environmental harm.",
      coreEnvironmentalRule:
        "No stabilization action is valid if it creates hidden environmental harm, worsens public health, or shifts risk onto vulnerable communities.",
      coreIntegrityAlignmentRule:
        "Alignment is earned through transparent operational integrity, not affiliation, influence, size, or political position.",
      prohibited: [
        "autonomous trading",
        "market manipulation",
        "sentiment manipulation",
        "coercive intervention",
        "unsupported financial prediction",
        "environmental harm externalization",
        "public-health harm concealment",
        "political targeting",
        "blacklisting",
        "anti-competitive exclusion"
      ],
      evidenceHash: evidence.sha256,
      stabilizationApproved,
      macroAssessment,
      environmentalAssessment,
      integrityAssessment,
      marketAssessments
    },
    null,
    2
  ),
  "utf8"
);

console.log("JPV-OS Market Integrity, Economic Stabilization, Environmental Responsibility, and Integrity Alignment report generated.");
console.log(`Macro level: ${macroAssessment.level}`);
console.log(`Environmental level: ${environmentalAssessment.level}`);
console.log(`Integrity tier: ${integrityAssessment.tier}`);
console.log(`Stabilization approved: ${stabilizationApproved}`);
console.log(`Evidence hash: ${evidence.sha256}`);
console.log(`Report: ${reportPath}`);
