import { JPVOsSpec, loadJPVOsSpec } from './jpv_os_spec';

export class EnforcementEngine {
  spec: JPVOsSpec;

  constructor(specPath: string) {
    this.spec = loadJPVOsSpec(specPath);
  }

  validateBrandVoice(brandId: string, text: string): string[] {
    console.log('DEBUG_OUTPUT Brands loaded from YAML:', this.spec.brands.map(b => b.id));
    console.log('DEBUG_OUTPUT Checking text:', text);
    const brand = this.spec.brands.find(b => b.id === brandId);
    if (brand) {
      console.log('DEBUG_OUTPUT Full brand object:', JSON.stringify(brand, null, 2));
      console.log('DEBUG_OUTPUT Deny list for', brandId, ':', brand.language.deny);
    }
    if (!brand) return ['unknown_brand'];
    const violations: string[] = [];
    for (const deny of brand.language.deny) {
      console.log(`DEBUG_OUTPUT Checking if text includes deny term: '${deny.toLowerCase()}'`);
      if (text.toLowerCase().includes(deny.toLowerCase())) {
        console.log(`DEBUG_OUTPUT Violation detected for deny term: '${deny}'`);
        violations.push('mixed_voice');
      }
    }
    // Add more checks as needed
    return violations;
  }

  // Add more enforcement methods here
}

// Example usage:
// const engine = new EnforcementEngine('path/to/jpv_os.yaml');
// const violations = engine.validateBrandVoice('jaypventures_llc', 'this is a vibe');
// console.log(violations);
