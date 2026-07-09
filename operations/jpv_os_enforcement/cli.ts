console.log("CLI.TS ABSOLUTE START");
console.log("TEST ENFORCEMENT OUTPUT");
console.log('DEBUG: cli.ts script started');
import { EnforcementEngine } from './enforcement_engine';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
console.log('DEBUG: Parsed args:', args);
const brand = args[0];
let text = args[1];

// Support --file <filepath>
const fileArgIndex = args.findIndex(arg => arg === '--file');
if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
  const filePath = args[fileArgIndex + 1];
  try {
    text = fs.readFileSync(filePath, 'utf8');
    console.log(`DEBUG: Loaded file content from ${filePath}`);
  } catch {
    console.error(`Failed to read file: ${filePath}`);
    process.exit(1);
  }
}

if (!brand || !text) {
  console.error('Usage: npx ts-node cli.ts <brand_id> <text> OR npx ts-node cli.ts <brand_id> --file <filepath>');
  process.exit(1);
}

const specPath = path.join(__dirname, 'jpv_os.yaml');
const engine = new EnforcementEngine(specPath);
const violations = engine.validateBrandVoice(brand, text);

console.log('VIOLATION CHECK RESULT:', violations);
if (violations.length > 0) {
  console.log('Violations:', violations);
  process.exit(2);
} else {
  console.log('No violations.');
  process.exit(0);
}
