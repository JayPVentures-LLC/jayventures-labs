import type { Env } from "../types/env";

export async function ensureIdempotent(env: Env, key: string): Promise<boolean> {
  if (!env.IDEMPOTENCY_KV) return true;
  const existing = await env.IDEMPOTENCY_KV.get(key);
  if (existing) return false;
  await env.IDEMPOTENCY_KV.put(key, "1", { expirationTtl: 60 * 60 * 24 * 7 });
  return true;
}
