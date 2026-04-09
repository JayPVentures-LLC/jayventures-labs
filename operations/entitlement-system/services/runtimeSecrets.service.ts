import type { Env } from "../config/env";
import { resolveSecret } from "./azure/keyVault.service";

export async function getStripeWebhookSecret(env: Env): Promise<string> {
  const value = await resolveSecret(env.STRIPE_WEBHOOK_SECRET, env, env.STRIPE_WEBHOOK_SECRET_SECRET_NAME);
  if (!value) throw new Error("Missing Stripe webhook secret");
  return value;
}

export async function getDiscordBotToken(env: Env): Promise<string> {
  const value = await resolveSecret(env.DISCORD_BOT_TOKEN, env, env.DISCORD_BOT_TOKEN_SECRET_NAME);
  if (!value) throw new Error("Missing Discord bot token");
  return value;
}

export async function getAdminOverrideKey(env: Env): Promise<string> {
  const value = await resolveSecret(env.ADMIN_OVERRIDE_KEY, env, env.ADMIN_OVERRIDE_KEY_SECRET_NAME);
  if (!value) throw new Error("Missing admin override key");
  return value;
}
