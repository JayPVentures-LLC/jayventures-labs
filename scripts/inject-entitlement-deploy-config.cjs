#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "operations/entitlement-system/wrangler.toml");
const required = [  "ENTITLEMENT_KV_ID",
  "ENTITLEMENT_KV_PREVIEW_ID",
  "IDEMPOTENCY_KV_ID",
  "IDEMPOTENCY_KV_PREVIEW_ID",
  "RETRY_QUEUE_KV_ID",
  "RETRY_QUEUE_KV_PREVIEW_ID",
  "ENTITLEMENT_EVENTS_QUEUE",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing entitlement deployment secret(s): ${missing.join(", ")}`);
}

const replacements = {  REPLACE_WITH_ENTITLEMENT_KV_ID: process.env.ENTITLEMENT_KV_ID,
  REPLACE_WITH_ENTITLEMENT_KV_PREVIEW_ID: process.env.ENTITLEMENT_KV_PREVIEW_ID,
  REPLACE_WITH_IDEMPOTENCY_KV_ID: process.env.IDEMPOTENCY_KV_ID,
  REPLACE_WITH_IDEMPOTENCY_KV_PREVIEW_ID: process.env.IDEMPOTENCY_KV_PREVIEW_ID,
  REPLACE_WITH_RETRY_QUEUE_KV_ID: process.env.RETRY_QUEUE_KV_ID,
  REPLACE_WITH_RETRY_QUEUE_KV_PREVIEW_ID: process.env.RETRY_QUEUE_KV_PREVIEW_ID,
  REPLACE_WITH_ENTITLEMENT_EVENTS_QUEUE: process.env.ENTITLEMENT_EVENTS_QUEUE,
};

let content;
try {
  content = fs.readFileSync(file, "utf8");
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error(`Entitlement deploy config not found at ${file}`);
  }
  throw error;
}

for (const [placeholder, value] of Object.entries(replacements)) {
  content = content.split(placeholder).join(value);
}

fs.writeFileSync(file, content);
