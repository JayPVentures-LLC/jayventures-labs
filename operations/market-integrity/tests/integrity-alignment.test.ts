import assert from "node:assert/strict";
import { assessIntegrityAlignment } from "../src/integrityAlignment";

const result = assessIntegrityAlignment({
  organization: "JPV Test Org",
  timestamp: new Date().toISOString(),

  governanceTransparency: 0.9,
  environmentalResponsibility: 0.9,
  securityMaturity: 0.9,
  antiCorruptionCompliance: 0.9,
  laborAndHumanRights: 0.9,
  financialDisclosureIntegrity: 0.9,
  aiExplainability: 0.8,
  interoperabilitySupport: 0.9,
  incidentResponseDiscipline: 0.9,
  publicRiskDisclosure: 0.8,

  evidenceProvided: true,
  humanReviewed: true
});

assert.equal(result.tier, "HIGH_TRUST");
assert.equal(result.blacklistingAllowed, false);
assert.equal(result.politicalTargetingAllowed, false);

console.log("integrity-alignment tests passed.");
