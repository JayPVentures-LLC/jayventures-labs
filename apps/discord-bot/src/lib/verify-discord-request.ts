/**
 * Verify a Discord interaction request using Ed25519.
 *
 * Discord signs every interaction POST with the application's Ed25519 private key.
 * We verify the signature using the application's public key (available in the
 * Discord Developer Portal under "General Information → Public Key").
 *
 * Spec reference: https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
 */

function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string length");
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    array[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return array;
}

/**
 * Returns true if the Discord request carries a valid Ed25519 signature.
 *
 * @param publicKey  App public key in lowercase hex (from Discord Developer Portal)
 * @param signature  Value of the X-Signature-Ed25519 request header (hex)
 * @param timestamp  Value of the X-Signature-Timestamp request header
 * @param rawBody    Raw request body string (must not be parsed/modified first)
 */
export async function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  rawBody: string
): Promise<boolean> {
  if (!publicKey || !signature || !timestamp || rawBody === undefined) return false;

  try {
    const keyBytes = hexToUint8Array(publicKey);
    const sigBytes = hexToUint8Array(signature);
    // Discord signs: timestamp bytes || body bytes
    const message = new TextEncoder().encode(timestamp + rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      // "Ed25519" is the standard Web Crypto algorithm name; supported on all recent
      // Cloudflare Workers compatibility dates without nodejs_compat.
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify({ name: "Ed25519" }, cryptoKey, sigBytes, message);
  } catch {
    return false;
  }
}
