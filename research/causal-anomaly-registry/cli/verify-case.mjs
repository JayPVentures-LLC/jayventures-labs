#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCase, computeEvidenceQuality, computeContamination, evaluatePromotion } from '../runtime/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const registryRoot = resolve(here, '..');
const policyPath = resolve(registryRoot, 'policy/promotion-policy.v1.json');
const args = process.argv.slice(2);
const casePath = args[0];
const receiptIndex = args.indexOf('--receipt');
const receiptPath = receiptIndex >= 0 ? args[receiptIndex + 1] : null;
if (!casePath) { process.stderr.write('Usage: verify-case.mjs <case.json> [--receipt <receipt.json>]\n'); process.exit(2); }
try {
  const [caseBytes, policyBytes] = await Promise.all([readFile(resolve(casePath)), readFile(policyPath)]);
  const record = JSON.parse(caseBytes.toString('utf8'));
  const policy = JSON.parse(policyBytes.toString('utf8'));
  const contract = validateCase(record);
  if (!contract.valid) { process.stderr.write(JSON.stringify({ contract_valid: false, errors: contract.errors }, null, 2) + '\n'); process.exit(1); }
  const evidenceQuality = computeEvidenceQuality(record.scores);
  const contamination = computeContamination((record.contamination?.pathways ?? []).map((p) => p.probability));
  const promotion = evaluatePromotion({...record,scores:{...record.scores,evidence_quality:evidenceQuality},contamination:{...record.contamination,estimated_score:contamination}},policy);
  const receipt = {
    receipt_type:'JPV_LABS_CAUSAL_ANOMALY_VERIFICATION',receipt_version:1,case_id:record.case_id,
    case_sha256:createHash('sha256').update(caseBytes).digest('hex'),policy_id:policy.policy_id,policy_version:policy.version,
    contract_valid:true,evidence_quality:evidenceQuality,contamination_score:contamination,declared_status:record.status,
    highest_eligible_status:promotion.highest_eligible_status,status_overclaim:Number(record.status.slice(4)) > Number(promotion.highest_eligible_status.slice(4)),gates:promotion.gates
  };
  const output = JSON.stringify(receipt,null,2)+'\n';
  if (receiptPath) await writeFile(resolve(receiptPath),output,'utf8');
  process.stdout.write(output);
  if (receipt.status_overclaim) process.exitCode=3;
} catch (error) { process.stderr.write(`verification failed: ${error.message}\n`); process.exit(1); }
