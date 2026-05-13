import assert from "node:assert/strict";
import { assessEnvironmentalResponsibility } from "../src/environmentalResponsibility";

const result = assessEnvironmentalResponsibility({
  timestamp: new Date().toISOString(),
  energyShockRisk: 0.9,
  climateDisruptionRisk: 0.9,
  pollutionExposure: 0.9,
  supplyChainEnvironmentalStress: 0.9,
  waterSecurityPressure: 0.9,
  foodSecurityPressure: 0.9,
  communityHealthRisk: 0.9,
  environmentalJusticeRisk: 0.9,
  corporateResponsibilityRisk: 0.9
});

assert.equal(result.level, "UNACCEPTABLE_RISK");
assert.equal(result.humanReviewRequired, true);
assert.equal(result.harmExternalizationAllowed, false);
assert.ok(result.prohibitedActions.some((item) => item.includes("Do not externalize economic risk")));

console.log("environmental-responsibility tests passed.");
