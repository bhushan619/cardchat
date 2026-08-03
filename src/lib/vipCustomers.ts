// Shared VIP customer store (prototype: sessionStorage-backed, volatile).
// Administrators set / cancel a customer's VIP status from the Customers page.

const KEY = "cardchat_vip_customers";

type Listener = () => void;
const listeners = new Set<Listener>();

// Seed: customers already tagged "VIP" in mock data.
const SEED = ["A7X3KP", "R4P8TN", "W8T4FJ"];

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  write(SEED);
  return [...SEED];
}

function write(list: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function listVipAliases(): string[] {
  return read();
}

export function isVip(alias?: string | null): boolean {
  if (!alias) return false;
  return read().includes(alias);
}

export function setVip(alias: string, vip: boolean) {
  const current = read();
  const next = vip
    ? Array.from(new Set([...current, alias]))
    : current.filter((a) => a !== alias);
  write(next);
  listeners.forEach((l) => l());
}

export function toggleVip(alias: string): boolean {
  const next = !isVip(alias);
  setVip(alias, next);
  return next;
}

export function onVipChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
