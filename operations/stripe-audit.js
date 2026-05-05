#!/usr/bin/env node
// stripe-audit.js
// Node.js script to audit Stripe accounts using the control map
const fs = require('fs');
const yaml = require('js-yaml');

const CONTROL_MAP_PATH = 'operations/stripe_control_map.yaml';

function loadControlMap() {
  const file = fs.readFileSync(CONTROL_MAP_PATH, 'utf8');
  return yaml.load(file).stripe_accounts;
}

function auditStripeAccounts() {
  const map = loadControlMap();
  const primary = map.primary_llc;
  const duplicates = map.duplicate_review;

  console.log('Primary Stripe Account:');
  console.log(`  ${primary.display_name} (${primary.account_id}) [${primary.status}]`);
  if (primary.production_webhook) {
    console.log('  [OK] Marked for production webhook');
  } else {
    console.log('  [WARNING] Not marked for production webhook');
  }

  console.log('\nDuplicate/Review Accounts:');
  duplicates.forEach(acc => {
    console.log(`  ${acc.display_name} (${acc.account_id}) [${acc.status}]`);
    if (acc.status !== 'hold_do_not_wire') {
      console.log('    [WARNING] Not marked as hold_do_not_wire!');
    }
  });

  // Enforce: Only primary_llc can be used for production wiring
  if (duplicates.some(acc => acc.production_webhook)) {
    console.log('\n[ERROR] Duplicate account(s) marked for production webhook!');
    process.exit(1);
  }
  console.log('\n[PASS] Stripe account wiring is compliant.');
}

auditStripeAccounts();
