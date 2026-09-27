import type { Env } from "../config/env";
const required=(v:string|undefined,e:string)=>{const x=v?.trim();if(!x)throw new Error(e);return x;};
export async function getStripeWebhookSecret(env:Env){return required(env.STRIPE_WEBHOOK_SECRET,"Missing Stripe webhook secret");}
export async function getDiscordBotToken(env:Env){return required(env.DISCORD_BOT_TOKEN,"Missing Discord bot token");}
export async function getAdminOverrideKey(env:Env){return required(env.ADMIN_OVERRIDE_KEY,"Missing admin override key");}
