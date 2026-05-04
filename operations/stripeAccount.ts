// stripeAccount.ts
// Utility to load and use the Stripe control map in Node.js/TypeScript
import fs from 'fs';
import yaml from 'js-yaml';

export interface StripeAccount {
  display_name: string;
  account_id: string;
  entity?: string;
  tax_basis?: string;
  revenue_scope?: string[];
  production_webhook?: boolean;
  status: string;
}

export interface StripeControlMap {
  primary_llc: StripeAccount;
  duplicate_review: StripeAccount[];
}

export function loadStripeControlMap(path = 'operations/stripe_control_map.yaml'): StripeControlMap {
  const file = fs.readFileSync(path, 'utf8');
  const doc = yaml.load(file) as any;
  return doc.stripe_accounts;
}

export function getPrimaryLLCAccount(map: StripeControlMap): StripeAccount {
  return map.primary_llc;
}

export function getDuplicateAccounts(map: StripeControlMap): StripeAccount[] {
  return map.duplicate_review;
}
