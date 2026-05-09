#!/usr/bin/env node
const fs = require("node:fs");

const file = "operations/entitlement-system/wrangler.toml";
const required = [
  "AZURE_KEY_VAULT_URL",
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "APPINSIGHTS_CONNECTION_STRING",
  "AZURE_ARCHIVE_ENDPOINT",
  "ENTITLEMENT_KV_ID",
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

const replacements = {
  "https://replace-me.vault.azure.net": process.env.AZURE_KEY_VAULT_URL,
  '"replace-me"': `"${process.env.AZURE_TENANT_ID}"`,
  "InstrumentationKey=replace-me;IngestionEndpoint=https://eastus-0.in.applicationinsights.azure.com/":
    process.env.APPINSIGHTS_CONNECTION_STRING,
  "https://replace-me.example/archive/entitlements": process.env.AZURE_ARCHIVE_ENDPOINT,
  REPLACE_WITH_ENTITLEMENT_KV_ID: process.env.ENTITLEMENT_KV_ID,
  REPLACE_WITH_ENTITLEMENT_KV_PREVIEW_ID: process.env.ENTITLEMENT_KV_PREVIEW_ID,
  REPLACE_WITH_IDEMPOTENCY_KV_ID: process.env.IDEMPOTENCY_KV_ID,
  REPLACE_WITH_IDEMPOTENCY_KV_PREVIEW_ID: process.env.IDEMPOTENCY_KV_PREVIEW_ID,
  REPLACE_WITH_RETRY_QUEUE_KV_ID: process.env.RETRY_QUEUE_KV_ID,
  REPLACE_WITH_RETRY_QUEUE_KV_PREVIEW_ID: process.env.RETRY_QUEUE_KV_PREVIEW_ID,
  REPLACE_WITH_ENTITLEMENT_EVENTS_QUEUE: process.env.ENTITLEMENT_EVENTS_QUEUE,
};

let content = fs.readFileSync(file, "utf8");
content = content.replace(
  'AZURE_CLIENT_ID = "replace-me"',
  `AZURE_CLIENT_ID = "${process.env.AZURE_CLIENT_ID}"`,
);

for (const [placeholder, value] of Object.entries(replacements)) {
  content = content.split(placeholder).join(value);
}

fs.writeFileSync(file, content);
