import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , target] = process.argv;

if (!target) {
  console.error('Usage: node scripts/validate-deploy-config.mjs <wrangler-config-path>');
  process.exit(1);
}

const filePath = resolve(process.cwd(), target);
const content = readFileSync(filePath, 'utf8');

const placeholderPatterns = [
  /REPLACE_WITH_[A-Z0-9_]+/g,
  /https:\/\/replace-me\.[^\s"']+/g,
  /"replace-me"/g,
  /InstrumentationKey=replace-me/g,
  /YOUR_KV_NAMESPACE_ID/g,
];

const matches = new Set();
for (const pattern of placeholderPatterns) {
  for (const match of content.matchAll(pattern)) {
    matches.add(match[0]);
  }
}

if (matches.size > 0) {
  console.error(`Deployment config validation failed for ${target}.`);
  console.error('Replace placeholder values before running a live deploy:');
  for (const match of [...matches].sort()) {
    console.error(`- ${match}`);
  }
  process.exit(1);
}

console.log(`Deployment config validated: ${target}`);
