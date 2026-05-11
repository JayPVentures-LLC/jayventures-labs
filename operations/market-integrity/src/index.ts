import fs from "node:fs";
import path from "node:path";
import { assessMarketIntegrity, MarketSignal } from "./assessMarketIntegrity.js";
import { writeEvidenceSnapshot } from "./evidenceSnapshot.js";

const sampleSignals: MarketSignal[] = [
  {
    asset: "GLOBAL_MARKET_SAMPLE",
    timestamp: new Date().toISOString(),
    volatility: 0.42,
    liquidityDrop: 0.18,
    concentrationRisk: 0.31,
    socialAmplification: 0.22,
    governanceRisk: 0.27,
    source: "internal_sample",
    notes: "Baseline demonstration signal. Replace with verified public or licensed data."
  }
];

const assessments = sampleSignals.map(assessMarketIntegrity);
const evidence = writeEvidenceSnapshot({ assessments });

const reportsDir = path.resolve("operations", "market-integrity", "reports");
fs.mkdirSync(reportsDir, { recursive: true });

const reportPath = path.join(reportsDir, "latest-market-integrity-report.json");

fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      doctrine: "observe_verify_alert_document",
      prohibited: [
        "autonomous trading",
        "market manipulation",
        "sentiment manipulation",
        "coercive intervention"
      ],
      evidenceHash: evidence.sha256,
      assessments
    },
    null,
    2
  ),
  "utf8"
);

console.log("JPV-OS Market Integrity report generated.");
console.log(`Evidence hash: ${evidence.sha256}`);
console.log(`Report: ${reportPath}`);
