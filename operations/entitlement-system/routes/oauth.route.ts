import { Hono } from 'hono';

export type OAuthEnv = {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_OAUTH_REDIRECT_URI: string;
  PUBLIC_BASE_URL: string;
  OAUTH_STATE_SECRET: string;
  ENTITLEMENT_KV: KVNamespace;
};

const DISCORD_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function signState(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

async function createState(env: OAuthEnv): Promise<string> {
  const nonce = crypto.randomUUID();
  const issuedAt = Date.now();
  const payload = `${nonce}.${issuedAt}`;
  const signature = await signState(env.OAUTH_STATE_SECRET, payload);
  return `${payload}.${signature}`;
}

async function verifyState(env: OAuthEnv, state: string | null): Promise<boolean> {
  if (!state) return false;
  const parts = state.split('.');
  if (parts.length !== 3) return false;
  const [nonce, issuedAt, signature] = parts;
  const payload = `${nonce}.${issuedAt}`;
  const expected = await signState(env.OAUTH_STATE_SECRET, payload);
  const ageMs = Date.now() - Number(issuedAt);
  return signature === expected && Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= 10 * 60 * 1000;
}

export const oauthRoute = new Hono<{ Bindings: OAuthEnv }>();

oauthRoute.get('/discord/start', async (c) => {
  const state = await createState(c.env);
  const authorize = new URL(DISCORD_AUTHORIZE_URL);
  authorize.searchParams.set('client_id', c.env.DISCORD_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', c.env.DISCORD_OAUTH_REDIRECT_URI);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', 'identify');
  authorize.searchParams.set('state', state);
  return c.redirect(authorize.toString(), 302);
});

oauthRoute.get('/discord/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  if (!code || !(await verifyState(c.env, state ?? null))) {
    return c.json({ ok: false, error: 'invalid_oauth_callback' }, 400);
  }

  const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.DISCORD_CLIENT_ID,
      client_secret: c.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: c.env.DISCORD_OAUTH_REDIRECT_URI,
    }),
  });

  if (!tokenResponse.ok) return c.json({ ok: false, error: 'discord_token_exchange_failed' }, 502);
  const token = await tokenResponse.json<{ access_token: string }>();

  const userResponse = await fetch(DISCORD_USER_URL, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });

  if (!userResponse.ok) return c.json({ ok: false, error: 'discord_identity_fetch_failed' }, 502);
  const user = await userResponse.json<{ id: string; username?: string }>();

  await c.env.ENTITLEMENT_KV.put(`discord:oauth:${user.id}`, JSON.stringify({
    discord_user_id: user.id,
    username: user.username ?? null,
    verified_at: new Date().toISOString(),
  }), { expirationTtl: 15 * 60 });

  const activate = new URL('/activate', c.env.PUBLIC_BASE_URL);
  activate.searchParams.set('discord_user_id', user.id);
  return c.redirect(activate.toString(), 302);
});
