// Agent remarks attached to a WhatsApp customer (prototype).
// Stored in sessionStorage so it survives navigation but resets on tab close.

export type CustomerRemark = {
  id: string;
  alias: string;
  text: string;
  quote?: string; // the message bubble the remark was created from
  author: string;
  createdAt: string; // ISO
};

const KEY = "cc_customer_remarks_v1";
const EVENT = "cc:customer-remarks-updated";

export function loadRemarks(): CustomerRemark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CustomerRemark[]) : [];
  } catch {
    return [];
  }
}

function save(list: CustomerRemark[]) {
  sessionStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function remarksFor(alias: string, list = loadRemarks()): CustomerRemark[] {
  return list
    .filter((r) => r.alias === alias)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addRemark(r: Omit<CustomerRemark, "id" | "createdAt">): CustomerRemark {
  const created: CustomerRemark = {
    ...r,
    id: `rmk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  save([created, ...loadRemarks()]);
  return created;
}

export function removeRemark(id: string) {
  save(loadRemarks().filter((r) => r.id !== id));
}

export function onRemarksChange(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
