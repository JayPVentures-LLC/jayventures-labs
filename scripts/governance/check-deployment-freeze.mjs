#!/usr/bin/env node
// JPV-OS Deployment Freeze Governance Gate
// Reads .github/deployment-freeze.json, validates schema, prints state, writes to $GITHUB_STEP_SUMMARY, and fails closed if frozen or malformed.

import fs from 'fs';
import path from 'path';

const freezePath = path.resolve('.github/deployment-freeze.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function fail(msg) {
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `\n**Deployment Freeze Check Failed:** ${msg}\n`);
  }
  console.error(msg);
  process.exit(1);
}

function writeSummary(freeze) {
  if (!summaryPath) return;
  fs.appendFileSync(
    summaryPath,
    [
      '\n## Deployment Freeze Status',
      `- **Frozen:** ${freeze.frozen}`,
      `- **Reason:** ${freeze.reason || 'N/A'}`,
      `- **Requested By:** ${freeze.requestedBy || 'N/A'}`,
      `- **Approved By:** ${freeze.approvedBy || 'N/A'}`,
      `- **Timestamp UTC:** ${freeze.timestampUtc || 'N/A'}`,
      `- **Incident ID:** ${freeze.incidentId || 'N/A'}`,
      ''
    ].join('\n')
  );
}

// Check if freeze file exists
if (!fs.existsSync(freezePath)) {
  // Not frozen if file does not exist
  if (summaryPath) {
    fs.appendFileSync(summaryPath, '\nDeployment freeze file not found. Deployments allowed.\n');
  }
  process.exit(0);
}

let freeze;
try {
  const raw = fs.readFileSync(freezePath, 'utf8');
  freeze = JSON.parse(raw);
} catch (e) {
  fail('Malformed .github/deployment-freeze.json: ' + e.message);
}

// Validate schema
if (typeof freeze.frozen !== 'boolean') fail('Missing or invalid "frozen" field.');
if (freeze.frozen) {
  writeSummary(freeze);
  fail('Deployment is frozen: ' + (freeze.reason || 'No reason provided.'));
} else {
  writeSummary(freeze);
  if (summaryPath) {
    fs.appendFileSync(summaryPath, '\nDeployment freeze is not active. Deployments allowed.\n');
  }
  process.exit(0);
}
