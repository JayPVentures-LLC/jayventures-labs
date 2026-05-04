#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredWorkflowFiles = [
  ".github/workflows/jpv-os-enforcement.yml"
];

const forbiddenPatterns = [
  {
    pattern: /bypass_jpv_os\s*[:=]\s*true/i,
    reason: "bypass_jpv_os_true"
  },
  {
    pattern: /skip_enforcement\s*[:=]\s*true/i,
    reason: "skip_enforcement_true"
  },
  {
    pattern: /DISABLE_JPV_ENFORCEMENT\s*=\s*true/i,
    reason: "disable_jpv_enforcement_true"
  }
];

const requiredSafetyTerms = [
  "decision_reason",
  "appeal_path",
  "rollback_supported"
];

const scanExtensions = new Set([
  ".js",
  ".mjs",
  ".ts",
  ".tsx",
  ".json",
  ".yml",
  ".yaml",
  ".md"
]);

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".wrangler",
  "dist",
  "build",
  ".next",
  "coverage"
]);

const violations = [];

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(root, fullPath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (scanExtensions.has(ext)) scanFile(fullPath, relPath);
  }
}

function scanFile(fullPath, relPath) {
  const content = fs.readFileSync(fullPath, "utf8");

  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(content)) {
      violations.push({
        file: relPath,
        reason: rule.reason
      });
    }
  }

  if (
    content.includes("DENIED_BY_JPV_SAFETY") ||
    content.includes("JPV_SAFETY") ||
    content.includes("safety-test")
  ) {
    for (const term of requiredSafetyTerms) {
      if (!content.includes(term)) {
        violations.push({
          file: relPath,
          reason: `missing_${term}`
        });
      }
    }
  }
}

for (const file of requiredWorkflowFiles) {
  if (!exists(file)) {
    violations.push({
      file,
      reason: "missing_required_workflow"
    });
  }
}

walk(root);

if (violations.length > 0) {
  console.error("JPV-OS enforcement failed.");
  console.error(JSON.stringify({ violations }, null, 2));
  process.exit(1);
}

console.log("JPV-OS enforcement passed.");

