import type { Env } from "../config/env";
const required=(value:string|undefined,code:string)=>{const v=value?.trim();if(!v)throw new Error(code);return v;};
export async function getStripeWebhookSecret(env: Env): Promise<string> { return required(env.STRIPE_WEBHOOK_SECRET,"Missing Stripe webhook secret"); }
export async function getDiscordBotToken(env: Env): Promise<string> { return required(env.DISCORD_BOT_TOKEN,"Missing Discord bot token"); }
export async function getAdminOverrideKey(env: Env): Promise<string> { return required(env.ADMIN_OVERRIDE_KEY,"Missing admin override key"); }
