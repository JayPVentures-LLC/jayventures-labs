import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const runtimeUrl = pathToFileURL(resolve(root, 'research/causal-anomaly-registry/runtime/index.mjs')).href;
const { validateCase, computeEvidenceQuality, computeContamination, evaluatePromotion } = await import(runtimeUrl);
const policy = JSON.parse(await readFile(resolve(root, 'research/causal-anomaly-registry/policy/promotion-policy.v1.json'), 'utf8'));

function baseCase() {
  return {
    case_id:'CAR-TEST-001',title:'Test case',status:'CAR-0',phenomenon_classes:['future_information'],causal_signatures:['RETRO'],created_at:'2026-08-29T03:50:00Z',
    claims:[],evidence:[],sources:[],assertions:[],experiments:[],predictions:[],replications:[],falsification:[],
    scores:{prospective_capture:0,specificity:0,independence:0,instrumentation:0,replication:0,conventional_resistance:0,causal_relevance:0,provenance_integrity:0,evidence_quality:0,discriminatory_power:0,replication_strength:0,extraordinary_mechanism_requirement:0},
    contamination:{pathways:[],estimated_score:0},
    disposition:{summary:'No conclusion.',ordinary_explanation_status:'INCONCLUSIVE',preferred_hypothesis:null,promotion_blockers:[]},
    mechanism:{status:'NONE',manipulated_variables:[],reproduced_by:[]},
    external_confirmation:{independent_labs:0,theory_conflict_replicated:false,scientific_consensus_basis:null,governed_manual_review:false}
  };
}

test('validateCase rejects a missing required case_id',()=>{const record=baseCase();delete record.case_id;const result=validateCase(record);assert.equal(result.valid,false);assert.match(result.errors.join('\n'),/case_id/);});
test('computeEvidenceQuality maps eight perfect dimensions to 1',()=>{assert.equal(computeEvidenceQuality({prospective_capture:5,specificity:5,independence:5,instrumentation:5,replication:5,conventional_resistance:5,causal_relevance:5,provenance_integrity:5}),1);});
test('computeContamination combines independent pathway probabilities',()=>{const value=computeContamination([0.2,0.5]);assert.ok(Math.abs(value-0.6)<1e-12);});
test('promotion fails closed for an empty valid intake',()=>{const result=evaluatePromotion(baseCase(),policy);assert.equal(result.highest_eligible_status,'CAR-0');assert.ok(result.gates['CAR-1'].blockers.length>0);});
test('example case validates',async()=>{const example=JSON.parse(await readFile(resolve(root,'research/causal-anomaly-registry/examples/example-case.json'),'utf8'));const result=validateCase(example);assert.deepEqual(result.errors,[]);assert.equal(result.valid,true);});
test('verification CLI emits a valid receipt for the example case',()=>{const cli=resolve(root,'research/causal-anomaly-registry/cli/verify-case.mjs');const example=resolve(root,'research/causal-anomaly-registry/examples/example-case.json');const run=spawnSync(process.execPath,[cli,example],{cwd:root,encoding:'utf8'});assert.equal(run.status,0,run.stderr);const receipt=JSON.parse(run.stdout);assert.equal(receipt.receipt_type,'JPV_LABS_CAUSAL_ANOMALY_VERIFICATION');assert.equal(receipt.case_id,'CAR-DEMO-001');assert.equal(receipt.contract_valid,true);assert.equal(receipt.highest_eligible_status,'CAR-0');assert.match(receipt.case_sha256,/^[a-f0-9]{64}$/);});
