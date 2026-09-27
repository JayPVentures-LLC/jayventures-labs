import type { Env } from "../types/env";

export async function getIntakeSecret(env: Env): Promise<string> {
  const value=env.INTAKE_HMAC_SECRET?.trim();
  if (!value) throw new Error("Missing INTAKE_HMAC_SECRET");
  return value;
}
export async function getMemberstackPublicKey(env: Env): Promise<string> {
  const value=env.MEMBERSTACK_JWT_PUBLIC_KEY?.trim();
  if (!value) throw new Error("Missing MEMBERSTACK_JWT_PUBLIC_KEY");
  return value;
}
export async function getSharePointAccessToken(env: Env): Promise<string | null> { return env.SHAREPOINT_ACCESS_TOKEN?.trim() || null; }
export async function getDataLakeToken(env: Env): Promise<string | null> { return env.DATALAKE_TOKEN?.trim() || null; }
