export type ActivationTokenPayload = {
  customer_id: string;
  entitlement_id: string;
  issued_at: number;
  expires_at: number;
  nonce: string;
};

function toBase64Url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
}

export async function createActivationToken(secret: string, customerId: string, entitlementId: string, ttlSeconds = 600): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: ActivationTokenPayload = {
    customer_id: customerId,
    entitlement_id: entitlementId,
    issued_at: now,
    expires_at: now + ttlSeconds,
    nonce: crypto.randomUUID(),
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await hmac(secret, body);
  return `${body}.${signature}`;
}

export async function verifyActivationToken(secret: string, token: string): Promise<ActivationTokenPayload | null> {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = await hmac(secret, body);
  if (signature !== expected) return null;
  const payload = JSON.parse(fromBase64Url(body)) as ActivationTokenPayload;
  const now = Math.floor(Date.now() / 1000);
  if (!payload.customer_id || !payload.entitlement_id || !payload.expires_at || payload.expires_at < now) return null;
  return payload;
}
