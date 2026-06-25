// Client-side PIN hashing helper.
// NOTE: Hashing on the client is a hardening step only — it prevents casual
// inspection of stored values via DevTools/XSS dumps. For real authorization
// security, PIN validation must be performed server-side (e.g. an edge
// function backed by Lovable Cloud) so the hash never leaves the server.

const SALT = "cardchat:v1";

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;
  const computed = await hashPin(pin);
  // Constant-time-ish compare
  if (computed.length !== storedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
