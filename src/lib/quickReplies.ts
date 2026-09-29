// Quick Reply Templates store (prototype: localStorage-backed).

export type QuickReplyCategory =
  | "greeting"
  | "card_request"
  | "verification"
  | "rate_quote"
  | "payout"
  | "follow_up"
  | "custom";

export interface QuickReplyTemplate {
  id: string;
  name: string;
  category: QuickReplyCategory;
  message: string;
  language: "en" | "zh" | "both";
  shortcut?: string;
  createdBy: string;
  createdAt: string;
  order: number;
}

export const CATEGORY_LABEL: Record<QuickReplyCategory, string> = {
  greeting: "Greeting",
  card_request: "Card Request",
  verification: "Verification",
  rate_quote: "Rate Quote",
  payout: "Payout",
  follow_up: "Follow-Up",
  custom: "Custom",
};

export const CATEGORY_COLOR: Record<QuickReplyCategory, string> = {
  greeting: "bg-accent/10 text-accent",
  card_request: "bg-primary/10 text-primary",
  verification: "bg-warning/10 text-warning",
  rate_quote: "bg-emerald-500/10 text-emerald-500",
  payout: "bg-blue-500/10 text-blue-500",
  follow_up: "bg-purple-500/10 text-purple-500",
  custom: "bg-muted text-muted-foreground",
};

export const CATEGORIES: QuickReplyCategory[] = [
  "greeting",
  "card_request",
  "verification",
  "rate_quote",
  "payout",
  "follow_up",
  "custom",
];

const KEY = "cardchat_quick_replies";
const USAGE_KEY = "cardchat_quick_reply_usage";
const EVENT = "quick-replies-updated";

export interface SupportedVariable {
  key: string;
  description: string;
}

export const SUPPORTED_VARIABLES: SupportedVariable[] = [
  { key: "alias", description: "Customer's alias / username" },
  { key: "agent_name", description: "Name of the assigned agent" },
  { key: "card_type", description: "Type of gift card (e.g. iTunes, Amazon)" },
  { key: "rate", description: "Quoted exchange rate" },
  { key: "amount", description: "Card face value / amount" },
  { key: "total_release", description: "Total points/amount to be released" },
  { key: "bank_name", description: "Customer's bank name" },
];

const SEED: QuickReplyTemplate[] = [
  {
    id: "qr1",
    name: "Warm Greeting",
    category: "greeting",
    message: "Hi {alias}, welcome to CardChat! I'm {agent_name}, happy to help you today. 😊",
    language: "both",
    shortcut: "hello",
    createdBy: "Admin One",
    createdAt: "2026-08-01T09:00:00Z",
    order: 1,
  },
  {
    id: "qr2",
    name: "Request Card Images",
    category: "card_request",
    message: "Hi {alias}, please send clear photos of the front and back of your {card_type} card.",
    language: "en",
    shortcut: "cardimg",
    createdBy: "Admin One",
    createdAt: "2026-08-02T09:00:00Z",
    order: 2,
  },
  {
    id: "qr3",
    name: "Verification In Progress",
    category: "verification",
    message: "Thanks {alias}, we're verifying your {card_type} card now. This usually takes a few minutes.",
    language: "en",
    shortcut: "verifying",
    createdBy: "Sarah Lead",
    createdAt: "2026-08-03T09:00:00Z",
    order: 3,
  },
  {
    id: "qr4",
    name: "Verification Failed",
    category: "verification",
    message: "Hi {alias}, unfortunately your {card_type} card could not be verified. Please double-check the code and resend a clear photo.",
    language: "en",
    shortcut: "verifail",
    createdBy: "Sarah Lead",
    createdAt: "2026-08-04T09:00:00Z",
    order: 4,
  },
  {
    id: "qr5",
    name: "Rate Quote",
    category: "rate_quote",
    message: "Hi {alias}, the current rate for {card_type} is {rate} per {amount}. Let me know if you'd like to proceed.",
    language: "both",
    shortcut: "rate",
    createdBy: "Admin One",
    createdAt: "2026-08-05T09:00:00Z",
    order: 5,
  },
  {
    id: "qr6",
    name: "Payout Notification",
    category: "payout",
    message: "Hi {alias}, Pts {total_release} has been released to your {bank_name} account. Thank you for trading with us!",
    language: "en",
    shortcut: "payout",
    createdBy: "Mike Agent",
    createdAt: "2026-08-06T09:00:00Z",
    order: 6,
  },
  {
    id: "qr7",
    name: "Follow Up - No Response",
    category: "follow_up",
    message: "Hi {alias}, just checking in — are you still there? Let me know if you need any help with your {card_type} card.",
    language: "en",
    shortcut: "followup",
    createdBy: "Mike Agent",
    createdAt: "2026-08-07T09:00:00Z",
    order: 7,
  },
  {
    id: "qr8",
    name: "Thank You Closing",
    category: "custom",
    message: "Thank you {alias} for choosing CardChat! Have a great day. 🙏",
    language: "both",
    shortcut: "thanks",
    createdBy: "Admin One",
    createdAt: "2026-08-08T09:00:00Z",
    order: 8,
  },
];

export function loadTemplates(): QuickReplyTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as QuickReplyTemplate[];
  } catch {
    /* ignore */
  }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

export function saveTemplates(list: QuickReplyTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: list }));
}

export function validateTemplateVariables(message: string): string[] {
  const found = Array.from(message.matchAll(/\{([a-zA-Z0-9_]+)\}/g)).map((m) => m[1]);
  const valid = new Set(SUPPORTED_VARIABLES.map((v) => v.key));
  return Array.from(new Set(found.filter((v) => !valid.has(v))));
}

export interface TemplateResolveContext {
  alias?: string;
  agentName?: string;
  cardType?: string;
  rate?: string;
  amount?: string;
  totalRelease?: string;
  bankName?: string;
}

export function resolveTemplateVariables(
  message: string,
  ctx: TemplateResolveContext
): string {
  const map: Record<string, string | undefined> = {
    alias: ctx.alias,
    agent_name: ctx.agentName,
    card_type: ctx.cardType,
    rate: ctx.rate,
    amount: ctx.amount,
    total_release: ctx.totalRelease,
    bank_name: ctx.bankName,
  };
  return message.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => map[key] ?? "");
}

export interface UsageEvent {
  templateId: string;
  agentName: string;
  at: string;
}

export function loadUsage(): UsageEvent[] {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) return JSON.parse(raw) as UsageEvent[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveUsage(list: UsageEvent[]) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(list));
}

export function recordTemplateUsage(templateId: string, agentName: string) {
  const list = loadUsage();
  list.push({ templateId, agentName, at: new Date().toISOString() });
  saveUsage(list);
}

export function getUsageByTemplate(): Record<string, number> {
  const list = loadUsage();
  const out: Record<string, number> = {};
  for (const u of list) out[u.templateId] = (out[u.templateId] || 0) + 1;
  return out;
}

export function getUsageByAgent(): Record<string, number> {
  const list = loadUsage();
  const out: Record<string, number> = {};
  for (const u of list) out[u.agentName] = (out[u.agentName] || 0) + 1;
  return out;
}

export function getUsageByCategory(): Record<QuickReplyCategory, number> {
  const list = loadUsage();
  const templates = loadTemplates();
  const catById: Record<string, QuickReplyCategory> = {};
  templates.forEach((t) => (catById[t.id] = t.category));
  const out = {} as Record<QuickReplyCategory, number>;
  CATEGORIES.forEach((c) => (out[c] = 0));
  for (const u of list) {
    const cat = catById[u.templateId];
    if (cat) out[cat] = (out[cat] || 0) + 1;
  }
  return out;
}

export function getUsageTrend(days = 14): { date: string; count: number }[] {
  const list = loadUsage();
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = list.filter((u) => u.at.slice(0, 10) === key).length;
    out.push({ date: key, count });
  }
  return out;
}

export function seedMockUsageIfEmpty() {
  const existing = loadUsage();
  if (existing.length) return;
  const templates = loadTemplates();
  const agents = ["Admin One", "Sarah Lead", "Mike Agent"];
  const events: UsageEvent[] = [];
  const totalEvents = 120;
  for (let i = 0; i < totalEvents; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));
    const template = templates[Math.floor(Math.random() * templates.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];
    events.push({ templateId: template.id, agentName: agent, at: d.toISOString() });
  }
  saveUsage(events);
}
