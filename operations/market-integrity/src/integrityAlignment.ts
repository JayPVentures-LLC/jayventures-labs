export type IntegrityTier =
  | "UNVERIFIED"
  | "PARTIALLY_ALIGNED"
  | "ALIGNED"
  | "HIGH_TRUST";

export interface IntegrityAlignmentSignal {
  organization: string;
  timestamp: string;

  governanceTransparency: number;
  environmentalResponsibility: number;
  securityMaturity: number;
  antiCorruptionCompliance: number;
  laborAndHumanRights: number;
  financialDisclosureIntegrity: number;
  aiExplainability: number;
  interoperabilitySupport: number;
  incidentResponseDiscipline: number;
  publicRiskDisclosure: number;

  evidenceProvided: boolean;
  humanReviewed: boolean;
}

export interface IntegrityAlignmentAssessment {
  organization: string;
  timestamp: string;
  score: number;
  tier: IntegrityTier;

  strengths: string[];
  concerns: string[];

  benefits: string[];
  remediationActions: string[];

  voluntaryParticipationRequired: true;
  appealSupported: true;
  blacklistingAllowed: false;
  politicalTargetingAllowed: false;
  antiCompetitiveEnforcementAllowed: false;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function assessIntegrityAlignment(
  signal: IntegrityAlignmentSignal
): IntegrityAlignmentAssessment {

  const score = Math.round(
    clamp(signal.governanceTransparency) * 12 +
    clamp(signal.environmentalResponsibility) * 12 +
    clamp(signal.securityMaturity) * 12 +
    clamp(signal.antiCorruptionCompliance) * 12 +
    clamp(signal.laborAndHumanRights) * 10 +
    clamp(signal.financialDisclosureIntegrity) * 10 +
    clamp(signal.aiExplainability) * 8 +
    clamp(signal.interoperabilitySupport) * 8 +
    clamp(signal.incidentResponseDiscipline) * 8 +
    clamp(signal.publicRiskDisclosure) * 8
  );

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (signal.governanceTransparency >= 0.7)
    strengths.push("Strong governance transparency.");

  if (signal.environmentalResponsibility >= 0.7)
    strengths.push("Environmental responsibility safeguards are strong.");

  if (signal.securityMaturity >= 0.7)
    strengths.push("Security maturity is strong.");

  if (signal.antiCorruptionCompliance >= 0.7)
    strengths.push("Anti-corruption compliance posture is strong.");

  if (signal.interoperabilitySupport >= 0.7)
    strengths.push("Supports interoperability and portability.");

  if (signal.governanceTransparency < 0.4)
    concerns.push("Governance transparency requires improvement.");

  if (signal.environmentalResponsibility < 0.4)
    concerns.push("Environmental responsibility safeguards are weak.");

  if (signal.securityMaturity < 0.4)
    concerns.push("Security maturity is below recommended baseline.");

  if (signal.publicRiskDisclosure < 0.4)
    concerns.push("Public-risk disclosure transparency is insufficient.");

  let tier: IntegrityTier = "UNVERIFIED";

  if (
    score >= 80 &&
    signal.evidenceProvided &&
    signal.humanReviewed
  ) {
    tier = "HIGH_TRUST";
  }
  else if (score >= 65) {
    tier = "ALIGNED";
  }
  else if (score >= 40) {
    tier = "PARTIALLY_ALIGNED";
  }

  return {
    organization: signal.organization,
    timestamp: signal.timestamp,
    score,
    tier,

    strengths,
    concerns,

    benefits: [
      "Eligibility for trusted ecosystem coordination.",
      "Access to shared resilience and transparency tooling.",
      "Reduced operational friction for verified integrations.",
      "Eligibility for integrity partnership status.",
      "Access to evidence-backed governance collaboration."
    ],

    remediationActions: [
      "Publish transparent governance and incident documentation.",
      "Improve explainability and auditability controls.",
      "Strengthen environmental and public-health safeguards.",
      "Preserve interoperability and anti-lock-in standards.",
      "Maintain evidence-backed remediation processes."
    ],

    voluntaryParticipationRequired: true,
    appealSupported: true,
    blacklistingAllowed: false,
    politicalTargetingAllowed: false,
    antiCompetitiveEnforcementAllowed: false
  };
}
