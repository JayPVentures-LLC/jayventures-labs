import { EnforcementEngine } from './enforcement_engine';
import path from 'path';

// Path to your jpv_os.yaml file (to be created or placed in this directory)
const specPath = path.join(__dirname, 'jpv_os.yaml');
const engine = new EnforcementEngine(specPath);

// Example: Validate a sample text for jaypventures_llc
const sampleText = 'this is a vibe';
const violations = engine.validateBrandVoice('jaypventures_llc', sampleText);

console.log('Violations:', violations);
