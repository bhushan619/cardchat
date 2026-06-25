// Demo-only TOTP helpers for the prototype.
// Generates a per-user random Base32 secret and renders the QR client-side
// so the secret never leaves the browser. Real production 2FA must mint
// secrets server-side and verify codes server-side with a TOTP library.

import QRCode from "qrcode";

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += B32_ALPHABET[b % 32];
  return out;
}

export function buildOtpAuthUri(opts: { issuer: string; account: string; secret: string }): string {
  const label = encodeURIComponent(`${opts.issuer}:${opts.account}`);
  const params = new URLSearchParams({ secret: opts.secret, issuer: opts.issuer });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export async function renderQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 200 });
}
