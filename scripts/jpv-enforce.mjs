#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const forbiddenWorkflowRoot = ".github/workflows";

const forbiddenPatterns = [
  { pattern: /bypass_jpv_os\s*[:=]\s*true/i, reason: "bypass_jpv_os_true" },
  { pattern: /skip_enforcement\s*[:=]\s*true/i, reason: "skip_enforcement_true" },
  { pattern: /DISABLE_JPV_ENFORCEMENT\s*=\s*true/i, reason: "disable_jpv_enforcement_true" }
];
const requiredSafetyTerms = ["decision_reason", "appeal_path", "rollback_supported"];
const scanExtensions = new Set([".js", ".mjs", ".ts", ".tsx", ".json", ".yml", ".yaml", ".md"]);
const ignoredDirs = new Set([".git", "node_modules", ".wrangler", "dist", "build", ".next", "coverage"]);
const violations = [];
function exists(relPath) { return fs.existsSync(path.join(root, relPath)); }
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(root, fullPath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath);
      continue;
    }
    if (scanExtensions.has(path.extname(entry.name))) scanFile(fullPath, relPath);
  }
}
function scanFile(fullPath, relPath) {
  const content = fs.readFileSync(fullPath, "utf8");
  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(content)) violations.push({ file: relPath, reason: rule.reason });
  }
  if (content.includes("DENIED_BY_JPV_SAFETY") || content.includes("JPV_SAFETY") || content.includes("safety-test")) {
    for (const term of requiredSafetyTerms) {
      if (!content.includes(term)) violations.push({ file: relPath, reason: `missing_${term}` });
    }
  }
}

if (exists(forbiddenWorkflowRoot)) {
  violations.push({
    file: forbiddenWorkflowRoot,
    reason: "github_actions_forbidden"
  });
}
walk(root);
if (violations.length > 0) {
  console.error("JPV-OS enforcement failed.");
  console.error(JSON.stringify({ violations }, null, 2));
  process.exit(1);
}

console.log("JPV-OS enforcement passed.");
