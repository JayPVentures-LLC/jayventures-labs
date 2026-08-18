import { describe, it, expect } from 'vitest';
import { authorizeClaimConsumerAction } from '../operations/governance/claim-truth-consumer.mjs';

const base = {
  claim_id: 'c-public', status: 'KNOWN', provenance_ref: 'urn:jpv:claim:c-public', action: 'PUBLISH',
  privacy_state: 'PUBLIC_AUTHORIZED', authorization_ref: 'urn:jpv:authorization:1',
  authorization_scope: {
    audiences: ['RESEARCH_PUBLIC'], purposes: ['RESEARCH_PUBLICATION'], media: ['REPORT'], content_refs: ['FINDING-1'],
    valid_from: '2026-08-18T00:00:00Z', valid_until: null, revoked_at: null
  },
  requested_disclosure: {
    audience: 'RESEARCH_PUBLIC', purpose: 'RESEARCH_PUBLICATION', medium: 'REPORT', content_refs: ['FINDING-1'],
    at: '2026-08-18T03:00:00Z', derived_from: [], source_privacy_state: 'PUBLIC_AUTHORIZED'
  }
};

describe('disclosure authorization consumer lifecycle', () => {
  it('allows only current scoped public authorization', () => {
    const result = authorizeClaimConsumerAction(base);
    expect(result.decision).toBe('ALLOW');
    expect(result.may_publish).toBe(true);
  });

  it('denies audience purpose medium or content expansion', () => {
    expect(authorizeClaimConsumerAction({...base, requested_disclosure:{...base.requested_disclosure,audience:'GENERAL_PUBLIC'}}).defects).toContain('DISCLOSURE_AUDIENCE_NOT_AUTHORIZED');
    expect(authorizeClaimConsumerAction({...base, requested_disclosure:{...base.requested_disclosure,purpose:'MARKETING'}}).defects).toContain('DISCLOSURE_PURPOSE_NOT_AUTHORIZED');
    expect(authorizeClaimConsumerAction({...base, requested_disclosure:{...base.requested_disclosure,medium:'VIDEO'}}).defects).toContain('DISCLOSURE_MEDIUM_NOT_AUTHORIZED');
    expect(authorizeClaimConsumerAction({...base, requested_disclosure:{...base.requested_disclosure,content_refs:['FINDING-1','PRIVATE-NOTE']}}).defects).toContain('DISCLOSURE_CONTENT_NOT_AUTHORIZED');
  });

  it('denies revoked future authorization', () => {
    const result=authorizeClaimConsumerAction({...base,authorization_scope:{...base.authorization_scope,revoked_at:'2026-08-18T02:00:00Z'}});
    expect(result.decision).toBe('DENY');
    expect(result.defects).toContain('DISCLOSURE_AUTHORIZATION_REVOKED');
  });

  it('preserves private state for derived material', () => {
    const result=authorizeClaimConsumerAction({...base,requested_disclosure:{...base.requested_disclosure,derived_from:['urn:jpv:private:1'],source_privacy_state:'PRIVATE'}});
    expect(result.decision).toBe('DENY');
    expect(result.defects).toContain('DERIVED_DISCLOSURE_INHERITS_PRIVATE_STATE');
  });

  it('fails closed when scope is unclear', () => {
    const result=authorizeClaimConsumerAction({...base,requested_disclosure:{audience:'RESEARCH_PUBLIC'}});
    expect(result.decision).toBe('DENY');
    expect(result.defects).toContain('DISCLOSURE_SCOPE_INCOMPLETE');
  });
});
