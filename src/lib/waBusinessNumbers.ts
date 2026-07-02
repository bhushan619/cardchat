// WhatsApp Business Cloud API — multi-number registry (prototype)
// Persisted to sessionStorage so it survives navigation but resets on tab close.
// A production build would store this in Lovable Cloud and sync with Meta's
// WhatsApp Business platform per phone_number_id.

export type WaBusinessNumber = {
  id: string;              // internal id
  label: string;           // human-friendly name, e.g. "Support Line"
  phone: string;           // display phone in E.164, e.g. "+2348011112222"
  phoneNumberId: string;   // Meta phone_number_id (mock)
  wabaId: string;          // Meta WhatsApp Business Account id (mock)
  active: boolean;         // receives new inbound conversations
  color: string;           // tailwind hue token used for badge accent
};

const KEY = "cc_wa_business_numbers_v1";
const EVENT = "cc:wa-business-numbers-updated";

const DEFAULTS: WaBusinessNumber[] = [
  { id: "wa_main",    label: "Main Sales",   phone: "+2348000000001", phoneNumberId: "1055500000001", wabaId: "waba_1001", active: true, color: "emerald" },
  { id: "wa_support", label: "Support Line", phone: "+2348000000002", phoneNumberId: "1055500000002", wabaId: "waba_1001", active: true, color: "sky" },
  { id: "wa_vip",     label: "VIP Desk",     phone: "+2348000000003", phoneNumberId: "1055500000003", wabaId: "waba_1001", active: true, color: "violet" },
];

function read(): WaBusinessNumber[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULTS;
    return parsed as WaBusinessNumber[];
  } catch {
    return DEFAULTS;
  }
}

function write(list: WaBusinessNumber[]) {
  sessionStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function listWaNumbers(): WaBusinessNumber[] {
  return read();
}

export function getWaNumber(id: string): WaBusinessNumber | undefined {
  return read().find((n) => n.id === id);
}

export function upsertWaNumber(n: Omit<WaBusinessNumber, "id"> & { id?: string }): WaBusinessNumber {
  const list = read();
  if (n.id) {
    const idx = list.findIndex((x) => x.id === n.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...n } as WaBusinessNumber;
      write(list);
      return list[idx];
    }
  }
  const created: WaBusinessNumber = {
    id: `wa_${Math.random().toString(36).slice(2, 8)}`,
    active: true,
    color: "emerald",
    ...n,
  } as WaBusinessNumber;
  list.push(created);
  write(list);
  return created;
}

export function removeWaNumber(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function onWaNumbersChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// Deterministic pick so a customer always routes to the same business number
// in the prototype, based on their id.
export function pickBusinessNumberFor(customerId: string): WaBusinessNumber {
  const list = read().filter((n) => n.active);
  if (list.length === 0) return DEFAULTS[0];
  let hash = 0;
  for (let i = 0; i < customerId.length; i++) hash = (hash * 31 + customerId.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}
