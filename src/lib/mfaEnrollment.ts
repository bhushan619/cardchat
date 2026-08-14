// Prototype-only MFA binding registry.
// Tracks which accounts have bound an authenticator. Production must store
// this server-side alongside the encrypted TOTP secret.

const KEY = "cc_mfa_bound";

function readAll(): Record<string, { boundAt: string }> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, { boundAt: string }>) {
  sessionStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("cc-mfa-changed"));
}

const norm = (account: string) => account.trim().toLowerCase();

export function isMfaBound(account: string): boolean {
  return !!readAll()[norm(account)];
}

export function bindMfa(account: string) {
  const all = readAll();
  all[norm(account)] = { boundAt: new Date().toISOString() };
  writeAll(all);
}

export function resetMfa(account: string) {
  const all = readAll();
  delete all[norm(account)];
  writeAll(all);
}
