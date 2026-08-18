const STATES = new Set(['UNKNOWN','INFERRED','DISPUTED','KNOWN']);

function text(value){ return typeof value === 'string' && value.trim().length > 0; }
function normalize(value){ return text(value) ? value.trim().toUpperCase() : ''; }

export function authorizeClaimConsumerAction(input = {}) {
  const defects = [];
  const claimId = text(input.claim_id) ? input.claim_id.trim() : null;
  const status = normalize(input.status);
  const requestedStatus = normalize(input.requested_status) || status;
  const action = normalize(input.action) || 'ANALYZE';
  const provenanceRef = text(input.provenance_ref) ? input.provenance_ref.trim() : null;
  const contradictions = Array.isArray(input.contradictions) ? [...input.contradictions] : [];
  const correctionRef = text(input.correction_ref) ? input.correction_ref.trim() : null;

  if (!claimId) defects.push('CLAIM_ID_REQUIRED');
  if (!STATES.has(status)) defects.push('CANONICAL_STATUS_REQUIRED');
  if (!provenanceRef) defects.push('PROVENANCE_REQUIRED');
  if (requestedStatus !== status) defects.push('STATUS_PROMOTION_DENIED');
  if (action === 'ENFORCE' && status !== 'KNOWN') defects.push('KNOWN_REQUIRED_FOR_ENFORCEMENT');

  return Object.freeze({
    decision: defects.length === 0 ? 'ALLOW' : 'DENY',
    claim_id: claimId,
    status: STATES.has(status) ? status : null,
    requested_status: requestedStatus || null,
    action,
    provenance_ref: provenanceRef,
    contradictions: Object.freeze(contradictions),
    correction_ref: correctionRef,
    may_enforce: status === 'KNOWN' && defects.length === 0,
    defects: Object.freeze([...new Set(defects)])
  });
}
