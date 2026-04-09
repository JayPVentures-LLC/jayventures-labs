// Environment Variable Loader and Types
export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_GUILD_ID: string;
  DISCORD_ROLE_MAP: string; // JSON string: brand/tier → role ID
  KV_NAMESPACE: any; // Cloudflare KV binding
  ADMIN_OVERRIDE_KEY: string;
  LOG_LEVEL?: string;
}

export function getEnv(env: any): Env {
  // TODO: Validate and return typed env
  return env as Env;
}
