type JwtHeader = { alg: string; typ?: string; kid?: string };
type JwtPayload = Record<string, unknown>;

function base64UrlToUint8Array(b64url: string): Uint8Array {
  const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64UrlToString(b64url: string): string {
  const bytes = base64UrlToUint8Array(b64url);
  return new TextDecoder().decode(bytes);
}

function parseJwt(token: string): {
  header: JwtHeader;
  payload: JwtPayload;
  signingInput: string;
  signature: Uint8Array;
} {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const [h, p, s] = parts;
  const header = JSON.parse(base64UrlToString(h)) as JwtHeader;
  const payload = JSON.parse(base64UrlToString(p)) as JwtPayload;
  const signingInput = `${h}.${p}`;
  const signature = base64UrlToUint8Array(s);
  return { header, payload, signingInput, signature };
}

function pemToSpkiDer(pem: string): ArrayBuffer {
  const clean = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  const bytes = base64UrlToUint8Array(clean.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""));
  return bytes.buffer;
}

export async function verifyMemberstackJwtRS256(token: string, publicKeyPem: string): Promise<JwtPayload> {
  const { header, payload, signingInput, signature } = parseJwt(token);

  if (header.alg !== "RS256") throw new Error("Unsupported JWT alg");

  const keyData = pemToSpkiDer(publicKeyPem);
  const key = await crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    new TextEncoder().encode(signingInput)
  );

  if (!ok) throw new Error("JWT signature invalid");

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && typeof payload.exp === "number" && payload.exp < now) {
    throw new Error("JWT expired");
  }

  return payload;
}
