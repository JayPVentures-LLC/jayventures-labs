import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface EvidenceSnapshot {
  timestamp: string;
  sha256: string;
  purpose: string;
  payload: unknown;
}

export function writeEvidenceSnapshot(
  payload: unknown,
  purpose = "market_integrity_assessment"
): EvidenceSnapshot {
  const evidenceDir = path.resolve("operations", "market-integrity", "evidence");
  fs.mkdirSync(evidenceDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const canonicalPayload = JSON.stringify(payload, null, 2);

  const sha256 = crypto
    .createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  const snapshot: EvidenceSnapshot = {
    timestamp,
    sha256,
    purpose,
    payload
  };

  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const filePath = path.join(evidenceDir, `${safeTimestamp}-${sha256.slice(0, 12)}.json`);

  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf8");

  return snapshot;
}
