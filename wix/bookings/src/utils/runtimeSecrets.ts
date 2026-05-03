import type { Env } from "../types/env";
import { resolveSecret } from "../core/azure/keyVault";

export async function getIntakeSecret(env: Env): Promise<string> {
  const value = await resolveSecret(env.INTAKE_HMAC_SECRET, env, env.INTAKE_HMAC_SECRET_SECRET_NAME);
  if (!value) throw new Error("Missing INTAKE_HMAC_SECRET");
  return value;
}

export async function getMemberstackPublicKey(env: Env): Promise<string> {
  const value = await resolveSecret(env.MEMBERSTACK_JWT_PUBLIC_KEY, env, env.MEMBERSTACK_JWT_PUBLIC_KEY_SECRET_NAME);
  if (!value) throw new Error("Missing MEMBERSTACK_JWT_PUBLIC_KEY");
  return value;
}

export async function getSharePointAccessToken(env: Env): Promise<string | null> {
  return resolveSecret(env.SHAREPOINT_ACCESS_TOKEN, env, env.SHAREPOINT_ACCESS_TOKEN_SECRET_NAME);
}

export async function getDataLakeToken(env: Env): Promise<string | null> {
  return resolveSecret(env.DATALAKE_TOKEN, env, env.DATALAKE_TOKEN_SECRET_NAME);
}
