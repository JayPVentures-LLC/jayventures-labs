console.log('DEBUG: cli.ts script started');
import { EnforcementEngine } from './enforcement_engine';
import path from 'path';

const args = process.argv.slice(2);
console.log('DEBUG: Parsed args:', args);
const brand = args[0];
const text = args[1];

if (!brand || !text) {
  console.error('Usage: npx ts-node cli.ts <brand_id> <text>');
  process.exit(1);
}

const specPath = path.join(__dirname, 'jpv_os.yaml');
const engine = new EnforcementEngine(specPath);
const violations = engine.validateBrandVoice(brand, text);

if (violations.length > 0) {
  console.log('Violations:', violations);
  process.exit(2);
} else {
  console.log('No violations.');
  process.exit(0);
}
