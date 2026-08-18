const STATES = new Set(['UNKNOWN','INFERRED','DISPUTED','KNOWN']);
const PUBLIC_ACTIONS = new Set(['PUBLISH','PUBLIC_ROUTE','BROADCAST','PUBLIC_DISPLAY']);

function text(value){ return typeof value === 'string' && value.trim().length > 0; }
function normalize(value){ return text(value) ? value.trim().toUpperCase() : ''; }
function list(value){ return Array.isArray(value) ? [...new Set(value.filter(text).map((item)=>item.trim().toUpperCase()))] : []; }
function instant(value){ if(!text(value)) return null; const parsed=Date.parse(value); return Number.isFinite(parsed)?parsed:null; }
function request(value={}){ return {audience:normalize(value.audience),purpose:normalize(value.purpose),medium:normalize(value.medium),content_refs:list(value.content_refs),at:instant(value.at),derived_from:Array.isArray(value.derived_from)?value.derived_from.filter(text).map((item)=>item.trim()):[],source_privacy_state:normalize(value.source_privacy_state)}; }
function scope(value={}){ return {audiences:list(value.audiences),purposes:list(value.purposes),media:list(value.media),content_refs:list(value.content_refs),valid_from:instant(value.valid_from),valid_until:value.valid_until==null?null:instant(value.valid_until),revoked_at:value.revoked_at==null?null:instant(value.revoked_at)}; }

function validatePublicDisclosure(input, defects){
  const privacyState=normalize(input.privacy_state);
  const authorizationRef=text(input.authorization_ref)?input.authorization_ref.trim():null;
  const req=request(input.requested_disclosure);
  const auth=scope(input.authorization_scope);
  if(privacyState!=='PUBLIC_AUTHORIZED') defects.push('PUBLIC_AUTHORIZATION_REQUIRED');
  if(!authorizationRef) defects.push('AUTHORIZATION_REFERENCE_REQUIRED');
  if(!(req.audience&&req.purpose&&req.medium&&req.content_refs.length>0&&req.at!==null&&req.source_privacy_state)) defects.push('DISCLOSURE_SCOPE_INCOMPLETE');
  if(!(auth.audiences.length>0&&auth.purposes.length>0&&auth.media.length>0&&auth.content_refs.length>0&&auth.valid_from!==null)) defects.push('AUTHORIZATION_SCOPE_INCOMPLETE');
  if(req.derived_from.length>0&&req.source_privacy_state!=='PUBLIC_AUTHORIZED') defects.push('DERIVED_DISCLOSURE_INHERITS_PRIVATE_STATE');
  if(req.audience&&!auth.audiences.includes(req.audience)) defects.push('DISCLOSURE_AUDIENCE_NOT_AUTHORIZED');
  if(req.purpose&&!auth.purposes.includes(req.purpose)) defects.push('DISCLOSURE_PURPOSE_NOT_AUTHORIZED');
  if(req.medium&&!auth.media.includes(req.medium)) defects.push('DISCLOSURE_MEDIUM_NOT_AUTHORIZED');
  if(req.content_refs.some((item)=>!auth.content_refs.includes(item))) defects.push('DISCLOSURE_CONTENT_NOT_AUTHORIZED');
  if(req.at!==null&&auth.valid_from!==null&&req.at<auth.valid_from) defects.push('DISCLOSURE_AUTHORIZATION_NOT_YET_VALID');
  if(req.at!==null&&auth.valid_until!==null&&req.at>auth.valid_until) defects.push('DISCLOSURE_AUTHORIZATION_EXPIRED');
  if(req.at!==null&&auth.revoked_at!==null&&req.at>=auth.revoked_at) defects.push('DISCLOSURE_AUTHORIZATION_REVOKED');
  return {privacyState,authorizationRef};
}

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
  let disclosure={privacyState:normalize(input.privacy_state)||null,authorizationRef:text(input.authorization_ref)?input.authorization_ref.trim():null};
  if(PUBLIC_ACTIONS.has(action)){
    if(status!=='KNOWN') defects.push('KNOWN_REQUIRED_FOR_PUBLIC_DISCLOSURE');
    disclosure=validatePublicDisclosure(input,defects);
  }
  const uniqueDefects=[...new Set(defects)];
  return Object.freeze({
    decision: uniqueDefects.length === 0 ? 'ALLOW' : 'DENY', claim_id: claimId,
    status: STATES.has(status) ? status : null, requested_status: requestedStatus || null, action,
    provenance_ref: provenanceRef, contradictions: Object.freeze(contradictions), correction_ref: correctionRef,
    privacy_state: disclosure.privacyState, authorization_ref: disclosure.authorizationRef,
    authorization_scope: input.authorization_scope ?? null, requested_disclosure: input.requested_disclosure ?? null,
    may_enforce: status === 'KNOWN' && uniqueDefects.length === 0,
    may_publish: PUBLIC_ACTIONS.has(action) && status === 'KNOWN' && uniqueDefects.length === 0,
    defects: Object.freeze(uniqueDefects)
  });
}
