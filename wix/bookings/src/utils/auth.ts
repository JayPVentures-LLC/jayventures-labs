import type { Env } from "../types/env";
import { verifyMemberstackJwtRS256 } from "./jwt";

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((item) => item.trim());
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx);
    const value = part.slice(idx + 1);
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

export function getAuthToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  const cookieToken = getCookie(request, "jvp_token");
  if (cookieToken) return cookieToken;
  return null;
}

function tierFromClaims(claims: Record<string, unknown>): string | null {
  const raw =
    (claims.tier as unknown) ??
    (claims.membership_tier as unknown) ??
    (claims.plan as unknown) ??
    (claims.membership as unknown) ??
    (claims.role as unknown) ??
    null;

  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw && "name" in raw) return String((raw as { name?: string }).name);
  return null;
}

export async function requireInnerCircle(
  request: Request,
  env: Env
): Promise<{ ok: true; claims: Record<string, unknown> } | { ok: false; status: number; body: Record<string, string> }> {
  const token = getAuthToken(request);
  if (!token) return { ok: false, status: 401, body: { error: "Unauthorized" } };

  if (!env.MEMBERSTACK_JWT_PUBLIC_KEY) {
    return { ok: false, status: 500, body: { error: "Server misconfigured" } };
  }

  try {
    const claims = await verifyMemberstackJwtRS256(token, env.MEMBERSTACK_JWT_PUBLIC_KEY);
    const tier = tierFromClaims(claims);

    const isInnerCircle = tier === "Inner Circle" || tier === "inner_circle" || tier === "InnerCircle";

    if (!isInnerCircle) return { ok: false, status: 403, body: { error: "Forbidden" } };

    return { ok: true, claims };
  } catch {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
}
