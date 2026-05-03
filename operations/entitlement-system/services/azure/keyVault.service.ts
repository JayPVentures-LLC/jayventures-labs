import type { Env } from "../../config/env";

const cache = new Map<string, string>();

async function getAzureAccessToken(env: Env): Promise<string | null> {
  if (!env.AZURE_TENANT_ID || !env.AZURE_CLIENT_ID || !env.AZURE_CLIENT_SECRET) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: env.AZURE_CLIENT_ID,
    client_secret: env.AZURE_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "https://vault.azure.net/.default",
  });

  const response = await fetch(`https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json() as { access_token?: string };
  return payload.access_token ?? null;
}

export async function getKeyVaultSecret(env: Env, secretName?: string): Promise<string | null> {
  if (!secretName) return null;
  if (cache.has(secretName)) return cache.get(secretName)!;
  if (!env.AZURE_KEY_VAULT_URL) return null;

  const token = await getAzureAccessToken(env);
  if (!token) return null;

  const vaultBase = env.AZURE_KEY_VAULT_URL.replace(/\/$/, "");
  const response = await fetch(`${vaultBase}/secrets/${secretName}?api-version=7.4`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json() as { value?: string };
  if (!payload.value) return null;
  cache.set(secretName, payload.value);
  return payload.value;
}

export async function resolveSecret(value: string | undefined, env: Env, secretName?: string): Promise<string | null> {
  if (value && value.trim()) return value;
  return getKeyVaultSecret(env, secretName);
}
