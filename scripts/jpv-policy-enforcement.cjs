#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function requireIncludes(file, terms) {
  const content = read(file);
  for (const term of terms) {
    if (!content.includes(term)) {
      failures.push(`${file} is missing required term: ${term}`);
    }
  }
}

function requireRegex(file, regex, description) {
  const content = read(file);
  if (!regex.test(content)) {
    failures.push(`${file} failed check: ${description}`);
  }
}

const requiredFiles = [
  'README.md',
  'GOVERNANCE.md',
  'SECURITY.md',
  'PEOPLE-PROTECTION.md',
  '.github/CODEOWNERS',
  '.github/workflows/jpv-policy-enforcement.yml'
];

for (const file of requiredFiles) read(file);

requireIncludes('PEOPLE-PROTECTION.md', [
  'People Protection',
  'Philosophical Foundation',
  'human dignity',
  'informed consent',
  'user autonomy',
  'equal treatment',
  'accessibility',
  'coercion',
  'exploitation',
  'discrimination',
  'unlawful surveillance',
  'social scoring',
  'AI and Automation Requirements',
  'Creator Protection',
  'Worker and Economic Protection',
  'Child and Student Protection',
  'Institutional and Government Misuse Limits',
  'Monetization Boundaries',
  'People Protection Review Questions',
  'Evidence Required for Production Readiness',
  'Enforcement in GitHub',
  'Production Gate'
]);

requireIncludes('README.md', [
  'GOVERNANCE.md',
  'SECURITY.md',
  'PEOPLE-PROTECTION.md',
  'People Protection'
]);

requireIncludes('GOVERNANCE.md', [
  'People Protection',
  'PEOPLE-PROTECTION.md'
]);

requireIncludes('SECURITY.md', [
  'People Protection',
  'human exploitation',
  'discriminatory automation',
  'unauthorized surveillance'
]);

requireIncludes('.github/CODEOWNERS', [
  '/PEOPLE-PROTECTION.md',
  '/GOVERNANCE.md',
  '/SECURITY.md',
  '/.github/workflows/'
]);

requireIncludes('.github/workflows/jpv-policy-enforcement.yml', [
  'jpv-policy-enforcement',
  'Verify Governance, Security, and People Protection',
  'node scripts/jpv-policy-enforcement.cjs'
]);

requireRegex(
  'PEOPLE-PROTECTION.md',
  /No system may be considered production-ready if it protects infrastructure while leaving people exposed\./,
  'must contain infrastructure-versus-people production gate'
);

requireRegex(
  'PEOPLE-PROTECTION.md',
  /The production standard is not merely that a system works\. The standard is that it works without sacrificing the people it affects\./,
  'must contain final production standard'
);

const people = read('PEOPLE-PROTECTION.md');
if (people.length < 12000) {
  failures.push(`PEOPLE-PROTECTION.md is too thin for publish-ready doctrine. Expected at least 12000 characters; found ${people.length}.`);
}

const forbiddenPatterns = [
  /People Protection is optional/i,
  /People Protection may be bypassed/i,
  /human review is optional/i,
  /consent is optional/i,
  /appeal is optional/i,
  /surveillance is permitted by default/i,
  /social scoring is permitted/i,
  /children may be monetized/i,
  /students may be monetized/i,
  /discrimination is acceptable/i,
  /exploitation is acceptable/i,
  /forced exclusivity is required/i,
  /dark patterns are allowed/i,
  /production-ready without People Protection/i,
  /non-binding ethics statement/i,
  /aspirational only/i
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(people)) {
    failures.push(`PEOPLE-PROTECTION.md contains prohibited weakening language matching: ${pattern}`);
  }
}

if (!exists('docs/production-review-checklist.md')) failures.push('Missing docs/production-review-checklist.md');
if (!exists('docs/policy-index.md')) failures.push('Missing docs/policy-index.md');
if (!exists('docs/enforcement-map.md')) failures.push('Missing docs/enforcement-map.md');

if (failures.length > 0) {
  console.error('\nJPV-OS POLICY ENFORCEMENT FAILED\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('\nRestore governance/security/people-protection integrity before merge or deployment.\n');
  process.exit(1);
}

console.log('JPV-OS policy enforcement passed.');
