#!/usr/bin/env node
/**
 * Deployment Freeze Governance Gate
 *
 * This script checks the deployment freeze state and fails closed if deployments
 * are blocked. Required before any production mutation step.
 *
 * Valid states:
 *   - NORMAL: deployments allowed (when frozen: false)
 *   - FROZEN: deployments blocked; rollback and observability allowed
 *   - ROLLBACK: controlled recovery mode (deployments blocked except rollback)
 *   - RECOVERY_VERIFIED: deployments allowed after recovery (when frozen: false)
 *
 * Exit codes:
 *   - 0: deployment allowed (frozen: false AND state is NORMAL or RECOVERY_VERIFIED)
 *   - 1: deployment blocked (frozen: true OR state is FROZEN/ROLLBACK) or error reading freeze file
 */

import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FREEZE_FILE_PATH = resolve(__dirname, '../../.github/deployment-freeze.json');

/**
 * @typedef {Object} FreezeState
 * @property {boolean} frozen
 * @property {'NORMAL' | 'FROZEN' | 'ROLLBACK' | 'RECOVERY_VERIFIED'} state
 * @property {string} reason
 * @property {string} requestedBy
 * @property {string} approvedBy
 * @property {string} timestampUtc
 * @property {string} incidentId
 */

/**
 * Writes output to GitHub Actions step summary if available
 * @param {string} content - Markdown content to write
 */
function writeToStepSummary(content) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, content + '\n');
  }
}

/**
 * Formats a deployment blocked summary for GitHub Actions
 * @param {FreezeState} freezeState - The current freeze state
 * @returns {string} Markdown formatted summary
 */
function formatBlockedSummary(freezeState) {
  const timestamp = new Date().toISOString();
  return `## 🚫 Deployment Blocked - Freeze Active

| Field | Value |
|-------|-------|
| **Status** | BLOCKED |
| **Freeze State** | \`${freezeState.state}\` |
| **Reason** | ${freezeState.reason || 'No reason provided'} |
| **Incident ID** | ${freezeState.incidentId || 'N/A'} |
| **Requested By** | ${freezeState.requestedBy || 'Unknown'} |
| **Approved By** | ${freezeState.approvedBy || 'N/A'} |
| **Freeze Timestamp** | ${freezeState.timestampUtc || 'N/A'} |
| **Check Timestamp** | ${timestamp} |

### Governance Enforcement

Deployment was denied because the repository is in a \`${freezeState.state}\` state.
No production mutation will occur until the freeze is lifted through a reviewed PR.

**Required Actions:**
1. Address the incident described in the freeze reason
2. Complete rollback if necessary (rollback workflows are allowed during freeze)
3. Submit an unfreeze PR for review
4. Obtain approval before merging the unfreeze PR
`;
}

/**
 * Formats a deployment allowed summary for GitHub Actions
 * @param {FreezeState} freezeState - The current freeze state
 * @returns {string} Markdown formatted summary
 */
function formatAllowedSummary(freezeState) {
  const timestamp = new Date().toISOString();
  return `## ✅ Deployment Allowed

| Field | Value |
|-------|-------|
| **Status** | ALLOWED |
| **Freeze State** | \`${freezeState.state}\` |
| **Check Timestamp** | ${timestamp} |

Deployment freeze check passed. Production deployment may proceed.
`;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Checking deployment freeze state...');
  console.log(`   Freeze file: ${FREEZE_FILE_PATH}`);

  // Check if freeze file exists
  if (!existsSync(FREEZE_FILE_PATH)) {
    console.error('❌ ERROR: Deployment freeze file not found');
    console.error(`   Expected at: ${FREEZE_FILE_PATH}`);
    console.error('   Failing closed - deployment blocked');
    writeToStepSummary(`## ❌ Deployment Blocked - Missing Freeze File

The deployment freeze governance file was not found at:
\`\`\`
${FREEZE_FILE_PATH}
\`\`\`

Deployment is blocked until the freeze file exists and is in a valid state.
`);
    process.exit(1);
  }

  // Read and parse freeze file
  /** @type {FreezeState} */
  let freezeState;
  try {
    const content = readFileSync(FREEZE_FILE_PATH, 'utf-8');
    freezeState = JSON.parse(content);
  } catch (error) {
    console.error('❌ ERROR: Failed to read or parse deployment freeze file');
    console.error(`   Error: ${error.message}`);
    console.error('   Failing closed - deployment blocked');
    writeToStepSummary(`## ❌ Deployment Blocked - Invalid Freeze File

Failed to read or parse the deployment freeze file:
\`\`\`
${error.message}
\`\`\`

Deployment is blocked until the freeze file is valid JSON.
`);
    process.exit(1);
  }

  // Validate required fields
  if (typeof freezeState.frozen !== 'boolean') {
    console.error('❌ ERROR: Invalid freeze file - "frozen" field must be boolean');
    console.error('   Failing closed - deployment blocked');
    writeToStepSummary(`## ❌ Deployment Blocked - Invalid Freeze File

The \`frozen\` field must be a boolean value.

Deployment is blocked until the freeze file is valid.
`);
    process.exit(1);
  }

  const validStates = ['NORMAL', 'FROZEN', 'ROLLBACK', 'RECOVERY_VERIFIED'];
  if (!validStates.includes(freezeState.state)) {
    console.error(`❌ ERROR: Invalid freeze state "${freezeState.state}"`);
    console.error(`   Valid states: ${validStates.join(', ')}`);
    console.error('   Failing closed - deployment blocked');
    writeToStepSummary(`## ❌ Deployment Blocked - Invalid State

The freeze state \`${freezeState.state}\` is not valid.
Valid states: ${validStates.join(', ')}

Deployment is blocked until the freeze file has a valid state.
`);
    process.exit(1);
  }

  // Check if deployment is allowed
  const deploymentAllowed = !freezeState.frozen && 
    (freezeState.state === 'NORMAL' || freezeState.state === 'RECOVERY_VERIFIED');

  if (!deploymentAllowed) {
    console.log('');
    console.log('🚫 DEPLOYMENT BLOCKED');
    console.log('');
    console.log(`   State:        ${freezeState.state}`);
    console.log(`   Frozen:       ${freezeState.frozen}`);
    console.log(`   Reason:       ${freezeState.reason || 'No reason provided'}`);
    console.log(`   Incident ID:  ${freezeState.incidentId || 'N/A'}`);
    console.log(`   Requested By: ${freezeState.requestedBy || 'Unknown'}`);
    console.log(`   Approved By:  ${freezeState.approvedBy || 'N/A'}`);
    console.log(`   Timestamp:    ${freezeState.timestampUtc || 'N/A'}`);
    console.log('');
    console.log('   Deployment denied. No production mutation will occur.');
    console.log('   Rollback workflows are allowed during freeze.');
    console.log('');

    writeToStepSummary(formatBlockedSummary(freezeState));
    process.exit(1);
  }

  // Deployment allowed
  console.log('');
  console.log('✅ DEPLOYMENT ALLOWED');
  console.log('');
  console.log(`   State:  ${freezeState.state}`);
  console.log(`   Frozen: ${freezeState.frozen}`);
  console.log('');
  console.log('   Production deployment may proceed.');
  console.log('');

  writeToStepSummary(formatAllowedSummary(freezeState));
  process.exit(0);
}

main();
