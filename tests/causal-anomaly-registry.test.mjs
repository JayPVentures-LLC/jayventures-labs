import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const runtimeUrl = pathToFileURL(resolve(root, 'research/causal-anomaly-registry/runtime/index.mjs')).href;
const { validateCase, computeEvidenceQuality, computeContamination, computeFamilywiseExactMatchProbability, classifyEvidenceLevel, evaluatePromotion } = await import(runtimeUrl);
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
test('policy requires historical and corpus falsification families',()=>{for(const family of ['LOST_KNOWLEDGE','UNDOCUMENTED_TRANSMISSION','INDEPENDENT_DISCOVERY','LINGUISTIC_COLLISION','MULTIPLE_COMPARISONS']) assert.ok(policy.required_falsification_families.includes(family),family);});
test('computeFamilywiseExactMatchProbability matches 64 independent 32-bit trials',()=>{const p=computeFamilywiseExactMatchProbability(64,32);assert.ok(Math.abs(p-1.4901161082825354e-8)<1e-15,p);});
test('extended provenance contract rejects invalid confidence',()=>{const record=baseCase();record.provenance={provenance_confidence:2};const result=validateCase(record);assert.equal(result.valid,false);assert.match(result.errors.join('\n'),/provenance_confidence/);});
test('retrospective linguistic coincidence validates and classifies E2',async()=>{const record=JSON.parse(await readFile(resolve(root,'research/causal-anomaly-registry/examples/retrospective-linguistic-coincidence.json'),'utf8'));assert.equal(validateCase(record).valid,true);assert.equal(classifyEvidenceLevel(record,policy),'E2');});
test('prospective future-information benchmark validates and classifies E5',async()=>{const record=JSON.parse(await readFile(resolve(root,'research/causal-anomaly-registry/examples/prospective-future-information.json'),'utf8'));assert.equal(validateCase(record).valid,true);assert.equal(classifyEvidenceLevel(record,policy),'E5');});
test('expanded CAR-4 audit fails closed when new ordinary explanations are untested',()=>{const record=baseCase();record.evidence=[{evidence_id:'E1',sha256:'a'.repeat(64),acquired_at:'2026-09-11T00:00:00Z',media_type:'text/plain',signature_status:'VALID'}];record.claims=[{claim_id:'C1',text:'Anomaly',captured_at:'2026-09-11T00:00:00Z',prospective:false}];const result=evaluatePromotion(record,policy);assert.equal(result.gates['CAR-3'].eligible,true);assert.equal(result.gates['CAR-4'].eligible,false);assert.match(result.gates['CAR-4'].blockers.join('\n'),/LOST_KNOWLEDGE/);});
