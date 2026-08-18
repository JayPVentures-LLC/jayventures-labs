import { describe, it, expect } from 'vitest';
import { authorizeClaimConsumerAction } from '../operations/governance/claim-truth-consumer.mjs';

const base = { claim_id:'c1', status:'KNOWN', provenance_ref:'urn:jpv:claim:c1', action:'ANALYZE' };

describe('claim truth consumer enforcement', () => {
  it('preserves canonical truth status and provenance', () => {
    const result = authorizeClaimConsumerAction(base);
    expect(result.decision).toBe('ALLOW');
    expect(result.status).toBe('KNOWN');
    expect(result.provenance_ref).toBe(base.provenance_ref);
  });

  it('rejects silent promotion from UNKNOWN to KNOWN', () => {
    const result = authorizeClaimConsumerAction({...base, status:'UNKNOWN', requested_status:'KNOWN'});
    expect(result.decision).toBe('DENY');
    expect(result.defects).toContain('STATUS_PROMOTION_DENIED');
  });

  it('allows analysis of uncertainty only when the uncertainty label is preserved', () => {
    const result = authorizeClaimConsumerAction({...base, status:'INFERRED', requested_status:'INFERRED'});
    expect(result.decision).toBe('ALLOW');
    expect(result.may_enforce).toBe(false);
  });

  it('blocks enforcement unless status is KNOWN', () => {
    for (const status of ['UNKNOWN','INFERRED','DISPUTED']) {
      const result = authorizeClaimConsumerAction({...base, status, requested_status:status, action:'ENFORCE'});
      expect(result.decision).toBe('DENY');
      expect(result.defects).toContain('KNOWN_REQUIRED_FOR_ENFORCEMENT');
    }
  });

  it('requires provenance on every consequential consumed claim', () => {
    const result = authorizeClaimConsumerAction({...base, provenance_ref:''});
    expect(result.decision).toBe('DENY');
    expect(result.defects).toContain('PROVENANCE_REQUIRED');
  });

  it('preserves contradictions and correction references', () => {
    const result = authorizeClaimConsumerAction({...base, status:'DISPUTED', requested_status:'DISPUTED', contradictions:['urn:jpv:evidence:x'], correction_ref:'urn:jpv:correction:1'});
    expect(result.decision).toBe('ALLOW');
    expect(result.contradictions).toEqual(['urn:jpv:evidence:x']);
    expect(result.correction_ref).toBe('urn:jpv:correction:1');
  });
});
