// WhatsApp wwebjs (whatsapp-web.js) session registry — prototype
// Replaces the previous Meta WhatsApp Business Cloud API integration.
// Each session represents a single WhatsApp number running as its own
// Puppeteer / wwebjs Client behind the CardChat Gateway Service.
// Shared-pool ownership: Super Admin links numbers; inbound conversations
// are auto-routed to available agents.
//
// Persisted to sessionStorage so it survives navigation but resets on tab close.
// A production build would keep this in Lovable Cloud and sync with the
// Gateway's REST/webhook contract.

export type WaSessionStatus =
  | "connected"
  | "linking"        // QR displayed, waiting for phone scan
  | "initializing"   // Puppeteer booting the Web session
  | "paused"         // agent-paused, not receiving new conversations
  | "disconnected"   // phone offline / logged out / server crashed
  | "banned";        // WhatsApp locked this number

export type WaAuditEvent = {
  ts: string;
  event:
    | "created" | "linked" | "disconnected" | "reconnected"
    | "paused" | "resumed" | "relinked" | "removed" | "warmup_advanced";
  actor: string; // admin display name (mock)
  note?: string;
};

// The original card called these "WaBusinessNumber" values. We keep the
// type name for backward compatibility with existing consumers while the
// shape now describes a wwebjs session.
export type WaBusinessNumber = {
  id: string;
  label: string;              // human-friendly name, e.g. "Support Line"
  phone: string;              // E.164, e.g. "+2348011112222"
  status: WaSessionStatus;
  active: boolean;            // false when paused/disconnected/banned
  color: string;              // tailwind hue token used for badge accent

  // wwebjs / gateway telemetry
  warmupDay: number | null;   // 1..14; null once warmed up
  dailyMsgCount: number;      // outbound today
  dailyConvCount: number;     // new conversations today
  replyRatio: number;         // 0..1 — inbound/outbound in last 24h
  memoryMB: number;           // Puppeteer RSS
  sessionStartedAt: string;   // ISO
  lastSeenAt: string;         // ISO
  proxyRegion: string;        // e.g. "NG-Lagos-Residential"
  assignedAgent: string | null; // shared pool → null; otherwise agent display name
  auditLog: WaAuditEvent[];

  // Legacy (kept for existing card code that references them; ignored by wwebjs)
  phoneNumberId?: string;
  wabaId?: string;
};

const KEY = "cc_wa_sessions_v2";
const EVENT = "cc:wa-sessions-updated";

const now = () => new Date().toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86_400_000).toISOString();

const DEFAULTS: WaBusinessNumber[] = [
  {
    id: "wa_main", label: "Main Sales", phone: "+2348000000001",
    status: "connected", active: true, color: "emerald",
    warmupDay: null, dailyMsgCount: 187, dailyConvCount: 34, replyRatio: 0.71,
    memoryMB: 412, sessionStartedAt: daysAgo(6), lastSeenAt: now(),
    proxyRegion: "NG-Lagos-Residential", assignedAgent: null,
    auditLog: [
      { ts: daysAgo(30), event: "created", actor: "Admin One" },
      { ts: daysAgo(30), event: "linked", actor: "Admin One", note: "QR scanned from Main Sales handset" },
    ],
  },
  {
    id: "wa_support", label: "Support Line", phone: "+2348000000002",
    status: "connected", active: true, color: "sky",
    warmupDay: 9, dailyMsgCount: 63, dailyConvCount: 11, replyRatio: 0.64,
    memoryMB: 386, sessionStartedAt: daysAgo(2), lastSeenAt: now(),
    proxyRegion: "NG-Abuja-Residential", assignedAgent: null,
    auditLog: [
      { ts: daysAgo(9), event: "created", actor: "Admin One" },
      { ts: daysAgo(9), event: "linked", actor: "Admin One" },
    ],
  },
  {
    id: "wa_vip", label: "VIP Desk", phone: "+2348000000003",
    status: "paused", active: false, color: "violet",
    warmupDay: null, dailyMsgCount: 0, dailyConvCount: 0, replyRatio: 0.82,
    memoryMB: 0, sessionStartedAt: daysAgo(14), lastSeenAt: daysAgo(1),
    proxyRegion: "NG-Lagos-Residential", assignedAgent: null,
    auditLog: [
      { ts: daysAgo(60), event: "created", actor: "Admin One" },
      { ts: daysAgo(60), event: "linked", actor: "Admin One" },
      { ts: daysAgo(1), event: "paused", actor: "Sarah Lead", note: "Paused for weekend anti-ban cooldown" },
    ],
  },
  {
    id: "wa_broadcast", label: "Broadcast", phone: "+2348000000004",
    status: "disconnected", active: false, color: "amber",
    warmupDay: 3, dailyMsgCount: 8, dailyConvCount: 2, replyRatio: 0.35,
    memoryMB: 0, sessionStartedAt: daysAgo(3), lastSeenAt: daysAgo(0.02),
    proxyRegion: "NG-Lagos-Residential", assignedAgent: null,
    auditLog: [
      { ts: daysAgo(4), event: "created", actor: "Admin One" },
      { ts: daysAgo(4), event: "linked", actor: "Admin One" },
      { ts: daysAgo(0.02), event: "disconnected", actor: "system", note: "Handset offline — auto-reconnect scheduled (attempt 2/3)" },
    ],
  },
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

const DEFAULT_NEW: Omit<WaBusinessNumber, "id" | "label" | "phone"> = {
  status: "linking",
  active: false,
  color: "emerald",
  warmupDay: 1,
  dailyMsgCount: 0,
  dailyConvCount: 0,
  replyRatio: 0,
  memoryMB: 0,
  sessionStartedAt: now(),
  lastSeenAt: now(),
  proxyRegion: "NG-Lagos-Residential",
  assignedAgent: null,
  auditLog: [],
};

export function upsertWaNumber(
  n: Partial<WaBusinessNumber> & { label: string; phone: string }
): WaBusinessNumber {
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
    ...DEFAULT_NEW,
    id: `wa_${Math.random().toString(36).slice(2, 8)}`,
    ...n,
  } as WaBusinessNumber;
  const seed: WaAuditEvent = { ts: now(), event: "created", actor: "Admin One", note: `Added ${created.label}` };
  created.auditLog = [seed, ...(created.auditLog || [])];
  list.push(created);
  write(list);
  return created;
}

export function removeWaNumber(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function appendAudit(id: string, event: WaAuditEvent) {
  const list = read();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], auditLog: [event, ...list[idx].auditLog].slice(0, 50) };
  write(list);
}

export function setStatus(
  id: string,
  status: WaSessionStatus,
  note?: string,
  actor = "Admin One"
) {
  const list = read();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return;
  const active = status === "connected";
  const eventMap: Record<WaSessionStatus, WaAuditEvent["event"]> = {
    connected: "reconnected",
    linking: "relinked",
    initializing: "relinked",
    paused: "paused",
    disconnected: "disconnected",
    banned: "disconnected",
  };
  list[idx] = {
    ...list[idx],
    status,
    active,
    lastSeenAt: now(),
    auditLog: [
      { ts: now(), event: eventMap[status], actor, note },
      ...list[idx].auditLog,
    ].slice(0, 50),
  };
  write(list);
}

export function completeLink(id: string, actor = "Admin One") {
  const list = read();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    status: "connected",
    active: true,
    sessionStartedAt: now(),
    lastSeenAt: now(),
    memoryMB: 380,
    warmupDay: list[idx].warmupDay ?? 1,
    auditLog: [
      { ts: now(), event: "linked" as const, actor, note: "QR scanned from handset" },
      ...list[idx].auditLog,
    ].slice(0, 50),
  };
  write(list);
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

// Deterministic pick so a customer always routes to the same session number
// in the prototype, based on their id. Only connected sessions participate.
export function pickBusinessNumberFor(customerId: string): WaBusinessNumber {
  const all = read();
  const pool = all.filter((n) => n.status === "connected" && n.active);
  const list = pool.length ? pool : all;
  if (list.length === 0) return DEFAULTS[0];
  let hash = 0;
  for (let i = 0; i < customerId.length; i++) hash = (hash * 31 + customerId.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

// ---- Gateway-level (mock) telemetry -------------------------------------
export type GatewayHealth = {
  uptimeHours: number;
  activeSessions: number;
  totalSessions: number;
  totalMemoryMB: number;
  disconnectAlerts: number;
  lastRestart: string;
};

export function gatewayHealth(): GatewayHealth {
  const list = read();
  const active = list.filter((n) => n.status === "connected").length;
  return {
    uptimeHours: 42.7,
    activeSessions: active,
    totalSessions: list.length,
    totalMemoryMB: list.reduce((s, n) => s + (n.memoryMB || 0), 0),
    disconnectAlerts: list.filter((n) => n.status === "disconnected" || n.status === "banned").length,
    lastRestart: daysAgo(1.78),
  };
}

// ---- Warmup / anti-ban policy (shared config) ---------------------------
export type WarmupPolicy = {
  dailyCaps: { day: string; conv: number; msg: number }[];
  minReplyRatio: number;   // 0..1
  proxyRegion: string;
  numberRotation: boolean;
  dailyRestartAt: string;  // "HH:MM"
};

const POLICY_KEY = "cc_wa_warmup_policy_v1";
const POLICY_EVENT = "cc:wa-warmup-policy-updated";

const DEFAULT_POLICY: WarmupPolicy = {
  dailyCaps: [
    { day: "Day 1–3",  conv: 20,  msg: 50 },
    { day: "Day 4–7",  conv: 50,  msg: 150 },
    { day: "Day 8–14", conv: 100, msg: 400 },
    { day: "Day 15+",  conv: 0,   msg: 0 }, // 0 = no enforced cap
  ],
  minReplyRatio: 0.5,
  proxyRegion: "NG-Lagos-Residential",
  numberRotation: true,
  dailyRestartAt: "03:00",
};

export function getWarmupPolicy(): WarmupPolicy {
  if (typeof window === "undefined") return DEFAULT_POLICY;
  try {
    const raw = sessionStorage.getItem(POLICY_KEY);
    return raw ? { ...DEFAULT_POLICY, ...JSON.parse(raw) } : DEFAULT_POLICY;
  } catch {
    return DEFAULT_POLICY;
  }
}

export function saveWarmupPolicy(p: WarmupPolicy) {
  sessionStorage.setItem(POLICY_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(POLICY_EVENT));
}

export function onWarmupPolicyChange(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(POLICY_EVENT, h);
  return () => window.removeEventListener(POLICY_EVENT, h);
}
