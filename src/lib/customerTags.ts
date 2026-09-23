// Shared customer tag definitions — managed on /admin/customer-tags,
// used by agents when tagging customers in App Messages / WhatsApp.
// Prototype: persisted in localStorage.

export interface CustomerTagDef {
  id: string;
  label: string;
  color: string; // hex, e.g. "#faad14"
  order: number;
  active: boolean;
}

export const DEFAULT_CUSTOMER_TAGS: CustomerTagDef[] = [
  { id: "vip", label: "VIP", color: "#faad14", order: 10, active: true },
  { id: "fraud-risk", label: "Fraud risk", color: "#ff4d4f", order: 20, active: true },
  { id: "slow-payer", label: "Slow payer", color: "#fa8c16", order: 30, active: true },
  { id: "bulk-trader", label: "Bulk trader", color: "#52c41a", order: 40, active: true },
  { id: "new-customer", label: "New customer", color: "#1677ff", order: 50, active: true },
];

const STORAGE_KEY = "cardchat_customer_tag_defs";

export function getCustomerTags(): CustomerTagDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CustomerTagDef[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_CUSTOMER_TAGS];
}

export function saveCustomerTags(tags: CustomerTagDef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  window.dispatchEvent(new Event("customer-tags-updated"));
}

export function getActiveCustomerTags(): CustomerTagDef[] {
  return getCustomerTags()
    .filter((t) => t.active)
    .sort((a, b) => a.order - b.order);
}

// Helpers to render a colored tag pill from a hex colour.
export function tagPillStyle(color: string): React.CSSProperties {
  return {
    color,
    backgroundColor: `${color}1a`, // ~10% alpha
    borderColor: `${color}55`,
  };
}
