const REQUIRED_FIELDS = ['case_id','title','status','phenomenon_classes','created_at','claims','evidence','disposition'];
const SCORE_DIMENSIONS = ['prospective_capture','specificity','independence','instrumentation','replication','conventional_resistance','causal_relevance','provenance_integrity'];
const STATUS_RE = /^CAR-[0-9]$/;
const CASE_ID_RE = /^CAR-[A-Z0-9-]+$/;
const SHA256_RE = /^[a-fA-F0-9]{64}$/;

function isDateTime(value) { return typeof value === 'string' && !Number.isNaN(Date.parse(value)); }
function isIntegerInRange(value, min, max = Number.MAX_SAFE_INTEGER) { return Number.isInteger(value) && value >= min && value <= max; }
function isProbability(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1; }

export function validateCase(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, errors: ['case must be an object'] };
  for (const field of REQUIRED_FIELDS) if (!(field in record)) errors.push(`missing required field: ${field}`);
  if ('case_id' in record && (typeof record.case_id !== 'string' || !CASE_ID_RE.test(record.case_id))) errors.push('case_id must match ^CAR-[A-Z0-9-]+$');
  if ('title' in record && (typeof record.title !== 'string' || record.title.length === 0)) errors.push('title must be a non-empty string');
  if ('status' in record && (typeof record.status !== 'string' || !STATUS_RE.test(record.status))) errors.push('status must be CAR-0 through CAR-9');
  if ('created_at' in record && !isDateTime(record.created_at)) errors.push('created_at must be an ISO-compatible date-time');
  if ('phenomenon_classes' in record && (!Array.isArray(record.phenomenon_classes) || record.phenomenon_classes.length === 0)) errors.push('phenomenon_classes must be a non-empty array');
  for (const field of ['claims','evidence']) if (field in record && !Array.isArray(record[field])) errors.push(`${field} must be an array`);
  if (Array.isArray(record.evidence)) record.evidence.forEach((item, index) => {
    if (!item || typeof item !== 'object') return errors.push(`evidence[${index}] must be an object`);
    if (typeof item.evidence_id !== 'string' || item.evidence_id.length === 0) errors.push(`evidence[${index}].evidence_id is required`);
    if (typeof item.sha256 !== 'string' || !SHA256_RE.test(item.sha256)) errors.push(`evidence[${index}].sha256 must be 64 hex characters`);
    if (!isDateTime(item.acquired_at)) errors.push(`evidence[${index}].acquired_at must be a date-time`);
    if (typeof item.media_type !== 'string' || item.media_type.length === 0) errors.push(`evidence[${index}].media_type is required`);
    if (item.signature_status === 'INVALID') errors.push(`evidence[${index}] has INVALID signature_status`);
  });
  if (record.scores) for (const key of SCORE_DIMENSIONS) {
    const value = record.scores[key];
    if (!Number.isInteger(value) || value < 0 || value > 5) errors.push(`scores.${key} must be an integer 0..5`);
  }
  if (!record.disposition || typeof record.disposition !== 'object') errors.push('disposition must be an object');
  else if (!['SUFFICIENT','INSUFFICIENT','INCONCLUSIVE'].includes(record.disposition.ordinary_explanation_status)) errors.push('disposition.ordinary_explanation_status is invalid');
  if (record.provenance) {
    const p = record.provenance;
    if (typeof p !== 'object' || Array.isArray(p)) errors.push('provenance must be an object');
    else {
      if ('securely_dated' in p && typeof p.securely_dated !== 'boolean') errors.push('provenance.securely_dated must be boolean');
      if ('independent_date_anchors' in p && !isIntegerInRange(p.independent_date_anchors, 0)) errors.push('provenance.independent_date_anchors must be a non-negative integer');
      if ('editable_after_date' in p && p.editable_after_date !== null && typeof p.editable_after_date !== 'boolean') errors.push('provenance.editable_after_date must be boolean or null');
      if ('independent_pre_event_attestations' in p && !isIntegerInRange(p.independent_pre_event_attestations, 0)) errors.push('provenance.independent_pre_event_attestations must be a non-negative integer');
      if ('translation_stable' in p && p.translation_stable !== null && typeof p.translation_stable !== 'boolean') errors.push('provenance.translation_stable must be boolean or null');
      if ('provenance_confidence' in p && !isProbability(p.provenance_confidence)) errors.push('provenance.provenance_confidence must be 0..1');
    }
  }
  if (record.information_anomaly) {
    const a = record.information_anomaly;
    if (typeof a !== 'object' || Array.isArray(a)) errors.push('information_anomaly must be an object');
    else {
      for (const key of ['future_exclusivity','specificity','repeatability']) if (key in a && !isIntegerInRange(a[key], 0, 3)) errors.push(`information_anomaly.${key} must be an integer 0..3`);
      if ('entropy_bits' in a && !isIntegerInRange(a.entropy_bits, 0)) errors.push('information_anomaly.entropy_bits must be a non-negative integer');
      if ('preregistered' in a && typeof a.preregistered !== 'boolean') errors.push('information_anomaly.preregistered must be boolean');
      if ('independent_pre_event_attestations' in a && !isIntegerInRange(a.independent_pre_event_attestations, 0)) errors.push('information_anomaly.independent_pre_event_attestations must be a non-negative integer');
      if ('multiplicity_adjusted_probability' in a && !isProbability(a.multiplicity_adjusted_probability)) errors.push('information_anomaly.multiplicity_adjusted_probability must be 0..1');
    }
  }
  if (record.null_model) {
    const n = record.null_model;
    if (typeof n !== 'object' || Array.isArray(n)) errors.push('null_model must be an object');
    else {
      if ('trial_count' in n && !isIntegerInRange(n.trial_count, 1)) errors.push('null_model.trial_count must be a positive integer');
      for (const key of ['per_trial_probability','familywise_probability']) if (key in n && !isProbability(n[key])) errors.push(`null_model.${key} must be 0..1`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function computeEvidenceQuality(scores) {
  const values = SCORE_DIMENSIONS.map((key) => scores?.[key]);
  if (values.some((value) => !Number.isInteger(value) || value < 0 || value > 5)) throw new TypeError('all eight evidence dimensions must be integers 0..5');
  return values.reduce((sum, value) => sum + value, 0) / (SCORE_DIMENSIONS.length * 5);
}

export function computeContamination(pathwayProbabilities) {
  if (!Array.isArray(pathwayProbabilities)) throw new TypeError('pathwayProbabilities must be an array');
  let survival = 1;
  for (const value of pathwayProbabilities) {
    if (typeof value !== 'number' || value < 0 || value > 1) throw new TypeError('contamination probabilities must be numbers 0..1');
    survival *= (1 - value);
  }
  return 1 - survival;
}

export function computeFamilywiseExactMatchProbability(trials, entropyBits) {
  if (!isIntegerInRange(trials, 1)) throw new TypeError('trials must be a positive integer');
  if (!isIntegerInRange(entropyBits, 1, 1024)) throw new TypeError('entropyBits must be an integer 1..1024');
  const perTrial = 2 ** (-entropyBits);
  if (perTrial === 0) return 0;
  return -Math.expm1(trials * Math.log1p(-perTrial));
}

export function classifyEvidenceLevel(record, policy) {
  const levels = policy?.evidence_levels;
  if (!levels) throw new TypeError('policy.evidence_levels is required');
  const provenance = record?.provenance ?? {};
  const info = record?.information_anomaly ?? {};
  const nullModel = record?.null_model ?? {};
  const confidence = provenance.provenance_confidence ?? 0;
  let level = 'E0';
  if (confidence >= (levels.E1?.minimum_provenance_confidence ?? 1)) level = 'E1';
  const e2 = provenance.securely_dated === true
    && (provenance.independent_date_anchors ?? 0) >= (levels.E2?.minimum_date_anchors ?? Infinity)
    && (!levels.E2?.require_noneditable || provenance.editable_after_date === false)
    && confidence >= (levels.E2?.minimum_provenance_confidence ?? 1);
  if (e2) level = 'E2';
  const e3 = e2
    && (info.future_exclusivity ?? 0) >= (levels.E3?.minimum_future_exclusivity ?? Infinity)
    && (info.specificity ?? 0) >= (levels.E3?.minimum_specificity ?? Infinity);
  if (e3) level = 'E3';
  const attestations = Math.max(provenance.independent_pre_event_attestations ?? 0, info.independent_pre_event_attestations ?? 0);
  const e4 = e2
    && (info.future_exclusivity ?? 0) >= (levels.E4?.minimum_future_exclusivity ?? Infinity)
    && (info.specificity ?? 0) >= (levels.E4?.minimum_specificity ?? Infinity)
    && (info.entropy_bits ?? 0) >= (levels.E4?.minimum_entropy_bits ?? Infinity)
    && attestations >= (levels.E4?.minimum_pre_event_attestations ?? Infinity)
    && confidence >= (levels.E4?.minimum_provenance_confidence ?? 1);
  if (e4) level = 'E4';
  const e5 = e4
    && (!levels.E5?.require_preregistered || info.preregistered === true)
    && (info.entropy_bits ?? 0) >= (levels.E5?.minimum_entropy_bits ?? Infinity)
    && (info.repeatability ?? 0) >= (levels.E5?.minimum_repeatability ?? Infinity)
    && attestations >= (levels.E5?.minimum_pre_event_attestations ?? Infinity)
    && isProbability(nullModel.familywise_probability)
    && nullModel.familywise_probability <= (levels.E5?.maximum_familywise_probability ?? -1);
  if (e5) level = 'E5';
  return level;
}

function gate(ok, blockers = []) { return { eligible: ok, blockers: ok ? [] : blockers }; }
function countPassReplications(record) { return (record.replications ?? []).filter((r) => r.outcome === 'PASS' && r.independent_team).length; }

export function evaluatePromotion(record, policy) {
  const validation = validateCase(record);
  const gates = { 'CAR-0': gate(true) };
  if (!validation.valid) {
    for (let i = 1; i <= 9; i++) gates[`CAR-${i}`] = gate(false, [`case contract invalid: ${validation.errors.join('; ')}`]);
    return { highest_eligible_status: 'CAR-0', gates };
  }
  gates['CAR-1'] = gate(record.evidence.length > 0, ['at least one preserved evidence object is required']);
  const evidenceAuthenticated = record.evidence.length > 0 && record.evidence.every((e) => e.signature_status !== 'INVALID') && record.evidence.some((e) => e.signature_status === 'VALID' || (e.timestamp_authorities ?? []).length > 0);
  gates['CAR-2'] = gate(gates['CAR-1'].eligible && evidenceAuthenticated, ['evidence requires valid signature or independent timestamp authority and no invalid signatures']);
  const anomalyRecorded = (record.claims ?? []).length > 0 && record.disposition.ordinary_explanation_status !== 'SUFFICIENT';
  gates['CAR-3'] = gate(gates['CAR-2'].eligible && anomalyRecorded, ['an atomic anomaly claim is required and ordinary explanation cannot be marked SUFFICIENT']);
  const falsificationByFamily = new Map((record.falsification ?? []).map((f) => [f.family, f]));
  const openFamilies = policy.required_falsification_families.filter((family) => !policy.closed_falsification_statuses.includes(falsificationByFamily.get(family)?.status));
  const explainedFamilies = (record.falsification ?? []).filter((f) => f.status === 'EXPLAINED').map((f) => f.family);
  gates['CAR-4'] = gate(gates['CAR-3'].eligible && openFamilies.length === 0 && explainedFamilies.length === 0,[...(openFamilies.length ? [`unclosed falsification families: ${openFamilies.join(', ')}`] : []), ...(explainedFamilies.length ? [`conventional explanation established by: ${explainedFamilies.join(', ')}`] : [])]);
  const passReplications = countPassReplications(record);
  gates['CAR-5'] = gate(gates['CAR-4'].eligible && passReplications >= policy.minimum_independent_pass_replications,[`requires ${policy.minimum_independent_pass_replications} independent PASS replications; found ${passReplications}`]);
  const causalSignature = (record.causal_signatures ?? []).some((s) => policy.causal_signatures.includes(s));
  const evidenceQuality = record.scores?.evidence_quality ?? computeEvidenceQuality(record.scores ?? {});
  const discriminatoryPower = record.scores?.discriminatory_power ?? 0;
  gates['CAR-6'] = gate(gates['CAR-5'].eligible && causalSignature && evidenceQuality >= policy.car6.minimum_evidence_quality && discriminatoryPower >= policy.car6.minimum_discriminatory_power,['requires causal signature plus CAR-6 evidence-quality and discriminatory-power thresholds']);
  const qualifyingPrediction = (record.predictions ?? []).some((p) => {
    const beforeTarget = isDateTime(p.committed_at) && isDateTime(p.target_generated_at) && Date.parse(p.committed_at) < Date.parse(p.target_generated_at);
    return p.preregistered === true && p.commitment_verified === true && p.exact_match === policy.car7.require_exact_match && p.entropy_bits >= policy.car7.minimum_entropy_bits && (p.timestamp_authorities ?? []).length >= policy.car7.minimum_timestamp_authorities && (!policy.car7.require_commitment_before_target || beforeTarget);
  });
  gates['CAR-7'] = gate(gates['CAR-6'].eligible && qualifyingPrediction, ['requires a preregistered, committed, high-entropy prospective prediction meeting CAR-7 policy']);
  const mechanism = record.mechanism ?? {};
  const mechanismReady = mechanism.status === policy.car8.mechanism_status && (mechanism.reproduced_by ?? []).length >= policy.car8.minimum_reproduced_by;
  gates['CAR-8'] = gate(gates['CAR-7'].eligible && mechanismReady, ['requires a reproducible mechanism and policy-minimum independent reproductions']);
  const ext = record.external_confirmation ?? {};
  const car9Ready = ext.independent_labs >= policy.car9.minimum_independent_labs && (!policy.car9.require_theory_conflict_replicated || ext.theory_conflict_replicated === true) && (!policy.car9.require_scientific_consensus_basis || (typeof ext.scientific_consensus_basis === 'string' && ext.scientific_consensus_basis.trim().length > 0)) && (!policy.car9.require_governed_manual_review || ext.governed_manual_review === true);
  gates['CAR-9'] = gate(gates['CAR-8'].eligible && car9Ready, ['CAR-9 requires explicit external scientific confirmation plus governed manual review']);
  let highest = 'CAR-0';
  for (let i = 1; i <= 9; i++) { if (!gates[`CAR-${i}`].eligible) break; highest = `CAR-${i}`; }
  return { highest_eligible_status: highest, gates };
}
