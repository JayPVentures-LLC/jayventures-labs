import { EnforcementEngine } from '../enforcement_engine';
import path from 'path';

describe('EnforcementEngine', () => {
  const specPath = path.join(__dirname, '../jpv_os.yaml');
  const engine = new EnforcementEngine(specPath);

  it('detects deny-list violations', () => {
    const violations = engine.validateBrandVoice('jaypventures_llc', 'this contains casual phrasing');
    expect(violations).toContain('mixed_voice');
  });

  it('passes allowed text', () => {
    const violations = engine.validateBrandVoice('jaypventures_llc', 'I build systems that enforce outcomes.');
    expect(violations.length).toBe(0);
  });

  it('returns unknown_brand for invalid brand', () => {
    const violations = engine.validateBrandVoice('not_a_brand', 'test');
    expect(violations).toContain('unknown_brand');
  });
});
