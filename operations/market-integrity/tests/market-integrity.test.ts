import assert from "node:assert/strict";
import { assessMarketIntegrity } from "../src/assessMarketIntegrity.js";

const result = assessMarketIntegrity({
  asset: "TEST",
  timestamp: new Date().toISOString(),
  volatility: 0.90,
  liquidityDrop: 0.80,
  concentrationRisk: 0.70,
  socialAmplification: 0.75,
  governanceRisk: 0.80,
  source: "test"
});

assert.equal(result.level, "CRITICAL");
assert.equal(result.autonomousExecutionAllowed, false);
assert.equal(result.humanReviewRequired, true);
assert.ok(result.score >= 80);

console.log("market-integrity tests passed.");
