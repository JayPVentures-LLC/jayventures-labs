export interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_WEBHOOK_SECRET_SECRET_NAME?: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_BOT_TOKEN_SECRET_NAME?: string;
  ADMIN_OVERRIDE_KEY?: string;
  ADMIN_OVERRIDE_KEY_SECRET_NAME?: string;
  ENTITLEMENT_KV: KVNamespace;
  IDEMPOTENCY_KV: KVNamespace;
  RETRY_QUEUE_KV?: KVNamespace;
  WORKER_EVENTS_QUEUE?: Queue<unknown>;
  AZURE_KEY_VAULT_URL?: string;
  AZURE_TENANT_ID?: string;
  AZURE_CLIENT_ID?: string;
  AZURE_CLIENT_SECRET?: string;
  APPINSIGHTS_CONNECTION_STRING?: string;
  AZURE_ARCHIVE_ENDPOINT?: string;
  AZURE_ARCHIVE_TOKEN?: string;
  AZURE_ARCHIVE_TOKEN_SECRET_NAME?: string;
  LOG_LEVEL?: string;
}

function assertKv(value: unknown, key: keyof Env): KVNamespace {
  if (!value || typeof (value as KVNamespace).get !== "function" || typeof (value as KVNamespace).put !== "function") {
    throw new Error(`Missing required KV binding: ${key}`);
  }
  return value as KVNamespace;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function getEnv(env: Record<string, unknown>): Env {
  return {
    STRIPE_WEBHOOK_SECRET: optionalString(env.STRIPE_WEBHOOK_SECRET),
    STRIPE_WEBHOOK_SECRET_SECRET_NAME: optionalString(env.STRIPE_WEBHOOK_SECRET_SECRET_NAME),
    DISCORD_BOT_TOKEN: optionalString(env.DISCORD_BOT_TOKEN),
    DISCORD_BOT_TOKEN_SECRET_NAME: optionalString(env.DISCORD_BOT_TOKEN_SECRET_NAME),
    ADMIN_OVERRIDE_KEY: optionalString(env.ADMIN_OVERRIDE_KEY),
    ADMIN_OVERRIDE_KEY_SECRET_NAME: optionalString(env.ADMIN_OVERRIDE_KEY_SECRET_NAME),
    ENTITLEMENT_KV: assertKv(env.ENTITLEMENT_KV, "ENTITLEMENT_KV"),
    IDEMPOTENCY_KV: assertKv(env.IDEMPOTENCY_KV, "IDEMPOTENCY_KV"),
    RETRY_QUEUE_KV: env.RETRY_QUEUE_KV as KVNamespace | undefined,
    WORKER_EVENTS_QUEUE: env.WORKER_EVENTS_QUEUE as Queue<unknown> | undefined,
    AZURE_KEY_VAULT_URL: optionalString(env.AZURE_KEY_VAULT_URL),
    AZURE_TENANT_ID: optionalString(env.AZURE_TENANT_ID),
    AZURE_CLIENT_ID: optionalString(env.AZURE_CLIENT_ID),
    AZURE_CLIENT_SECRET: optionalString(env.AZURE_CLIENT_SECRET),
    APPINSIGHTS_CONNECTION_STRING: optionalString(env.APPINSIGHTS_CONNECTION_STRING),
    AZURE_ARCHIVE_ENDPOINT: optionalString(env.AZURE_ARCHIVE_ENDPOINT),
    AZURE_ARCHIVE_TOKEN: optionalString(env.AZURE_ARCHIVE_TOKEN),
    AZURE_ARCHIVE_TOKEN_SECRET_NAME: optionalString(env.AZURE_ARCHIVE_TOKEN_SECRET_NAME),
    LOG_LEVEL: optionalString(env.LOG_LEVEL),
  };
}
