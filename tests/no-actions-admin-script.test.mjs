import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(testFile), '..');
const scriptPath = path.join(repoRoot, 'scripts', 'github', 'Set-JPVNoActionsMode.ps1');

test('canonical GitHub admin script disables CodeQL default setup and repository Actions with readback', () => {
  assert.equal(fs.existsSync(scriptPath), true, 'missing canonical no-Actions admin script');
  const script = fs.readFileSync(scriptPath, 'utf8');

  const codeqlMutation = script.indexOf('code-scanning/default-setup');
  const actionsMutation = script.indexOf('actions/permissions');

  assert.ok(codeqlMutation >= 0, 'CodeQL default-setup endpoint missing');
  assert.ok(actionsMutation > codeqlMutation, 'Actions mutation must follow CodeQL default-setup retirement');
  assert.match(script, /"state"\s*:\s*"not-configured"/);
  assert.match(script, /"enabled"\s*:\s*false/);
  assert.match(script, /verified_at/);
  assert.match(script, /CODEQL_DEFAULT_SETUP_NOT_RETIRED/);
  assert.match(script, /GITHUB_ACTIONS_STILL_ENABLED/);
});
