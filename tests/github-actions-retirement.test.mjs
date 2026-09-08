import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const testFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(testFile), '..');
const enforcementScript = path.join(repoRoot, 'scripts', 'jpv-enforce.mjs');

function runEnforcement(setup) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jpv-no-actions-'));
  try {
    setup?.(fixture);
    return spawnSync(process.execPath, [enforcementScript], {
      cwd: fixture,
      encoding: 'utf8'
    });
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

test('JPV enforcement accepts an Action-free repository', () => {
  const result = runEnforcement((fixture) => {
    fs.writeFileSync(path.join(fixture, 'README.md'), '# fixture\n');
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('JPV enforcement rejects a GitHub Actions workflow surface', () => {
  const result = runEnforcement((fixture) => {
    const workflows = path.join(fixture, '.github', 'workflows');
    fs.mkdirSync(workflows, { recursive: true });
    fs.writeFileSync(path.join(workflows, 'jpv-os-enforcement.yml'), 'name: forbidden\n');
  });

  assert.notEqual(result.status, 0, 'workflow surface must be rejected');
  assert.match(result.stderr, /github_actions_forbidden/i);
});
