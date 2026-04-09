function parseSignatureHeader(header: string): { timestamp: number; signatures: string[] } | null {
  const parts = header.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);

  if (!timestampPart || signatures.length === 0) {
    return null;
  }

  const timestamp = Number.parseInt(timestampPart.slice(2), 10);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return { timestamp, signatures };
}

async function sign(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export async function verifyStripeSignature(
  rawBody: Uint8Array | string,
  header: string,
  secret: string,
  toleranceSeconds = 300
): Promise<boolean> {
  if (!secret || !header) return false;

  const parsed = parseSignatureHeader(header);
  if (!parsed) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > toleranceSeconds) {
    return false;
  }

  const body = typeof rawBody === "string" ? rawBody : new TextDecoder().decode(rawBody);
  const expected = await sign(secret, `${parsed.timestamp}.${body}`);
  return parsed.signatures.some((signature) => timingSafeEqual(expected, signature));
}

export async function createStripeSignatureHeader(rawBody: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): Promise<string> {
  const signature = await sign(secret, `${timestamp}.${rawBody}`);
  return `t=${timestamp},v1=${signature}`;
}
