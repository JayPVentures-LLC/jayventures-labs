export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  ADMIN_OVERRIDE_KEY: string;
  ENTITLEMENT_KV: KVNamespace;
  IDEMPOTENCY_KV: KVNamespace;
  RETRY_QUEUE_KV?: KVNamespace;
  LOG_LEVEL?: string;
}

function assertString(value: unknown, key: keyof Env): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function assertKv(value: unknown, key: keyof Env): KVNamespace {
  if (!value || typeof (value as KVNamespace).get !== "function" || typeof (value as KVNamespace).put !== "function") {
    throw new Error(`Missing required KV binding: ${key}`);
  }
  return value as KVNamespace;
}

export function getEnv(env: Record<string, unknown>): Env {
  return {
    STRIPE_WEBHOOK_SECRET: assertString(env.STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET"),
    DISCORD_BOT_TOKEN: assertString(env.DISCORD_BOT_TOKEN, "DISCORD_BOT_TOKEN"),
    ADMIN_OVERRIDE_KEY: assertString(env.ADMIN_OVERRIDE_KEY, "ADMIN_OVERRIDE_KEY"),
    ENTITLEMENT_KV: assertKv(env.ENTITLEMENT_KV, "ENTITLEMENT_KV"),
    IDEMPOTENCY_KV: assertKv(env.IDEMPOTENCY_KV, "IDEMPOTENCY_KV"),
    RETRY_QUEUE_KV: env.RETRY_QUEUE_KV as KVNamespace | undefined,
    LOG_LEVEL: typeof env.LOG_LEVEL === "string" ? env.LOG_LEVEL : undefined,
  };
}
