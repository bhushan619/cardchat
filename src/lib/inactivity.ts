// Inactivity Follow-Up settings + stats store (prototype: localStorage-backed).

export interface InactivitySettings {
  enabled: boolean;
  warningThresholdMin: number;
  reminderThresholdMin: number;
  reminderMessage: string;
  maxRemindersPerConversation: number;
  activeHoursOnly: boolean;
}

export const DEFAULT_INACTIVITY_SETTINGS: InactivitySettings = {
  enabled: false,
  warningThresholdMin: 15,
  reminderThresholdMin: 30,
  reminderMessage:
    "Hi! Are you still looking to complete the trade? We're here whenever you're ready.",
  maxRemindersPerConversation: 1,
  activeHoursOnly: true,
};

const SETTINGS_KEY = "cardchat_inactivity_settings";
const PAUSED_KEY = "cardchat_inactivity_paused";
const STATS_KEY = "cardchat_inactivity_stats";

export function loadInactivitySettings(): InactivitySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_INACTIVITY_SETTINGS, ...(JSON.parse(raw) as Partial<InactivitySettings>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_INACTIVITY_SETTINGS;
}

export function saveInactivitySettings(settings: InactivitySettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("inactivity-settings-updated", { detail: settings }));
}

// ---- Paused conversations ----

export function loadPausedConversations(): string[] {
  try {
    const raw = localStorage.getItem(PAUSED_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  return [];
}

export function isInactivityPaused(convoId: string): boolean {
  return loadPausedConversations().includes(convoId);
}

export function setInactivityPaused(convoId: string, paused: boolean) {
  const list = loadPausedConversations();
  const next = paused
    ? Array.from(new Set([...list, convoId]))
    : list.filter((id) => id !== convoId);
  localStorage.setItem(PAUSED_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("inactivity-paused-updated", { detail: { conversationId: convoId, paused } })
  );
}

// ---- Stats ----

export type InactivityEventType = "flagged" | "reminder_sent" | "recovered";

export interface InactivityEvent {
  type: InactivityEventType;
  conversationId: string;
  at: string; // ISO date
  recoveryMinutes?: number;
}

function readEvents(): InactivityEvent[] {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as InactivityEvent[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeEvents(events: InactivityEvent[]) {
  localStorage.setItem(STATS_KEY, JSON.stringify(events));
}

function seedMockStats(): InactivityEvent[] {
  const events: InactivityEvent[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const flaggedCount = 47;
  const remindersCount = 38;
  const recoveredCount = 11;

  for (let i = 0; i < flaggedCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    events.push({
      type: "flagged",
      conversationId: `convo-${1000 + i}`,
      at: new Date(now - daysAgo * dayMs - Math.random() * dayMs).toISOString(),
    });
  }
  for (let i = 0; i < remindersCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    events.push({
      type: "reminder_sent",
      conversationId: `convo-${1000 + i}`,
      at: new Date(now - daysAgo * dayMs - Math.random() * dayMs).toISOString(),
    });
  }
  for (let i = 0; i < recoveredCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const recoveryMinutes = Math.round(15 + Math.random() * 20); // avg ~24 min
    events.push({
      type: "recovered",
      conversationId: `convo-${1000 + i}`,
      at: new Date(now - daysAgo * dayMs - Math.random() * dayMs).toISOString(),
      recoveryMinutes,
    });
  }
  writeEvents(events);
  return events;
}

export function recordInactivityEvent(event: InactivityEvent) {
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export interface InactivityStats {
  flagged: number;
  remindersSent: number;
  recovered: number;
  recoveryRatePct: number;
  avgRecoveryMinutes: number;
}

export function getInactivityStats(periodDays: number): InactivityStats {
  let events = readEvents();
  if (events.length === 0) {
    events = seedMockStats();
  }

  const cutoff = Date.now() - periodDays * 24 * 60 * 60 * 1000;
  const inPeriod = events.filter((e) => new Date(e.at).getTime() >= cutoff);

  const flagged = inPeriod.filter((e) => e.type === "flagged").length;
  const remindersSent = inPeriod.filter((e) => e.type === "reminder_sent").length;
  const recoveredEvents = inPeriod.filter((e) => e.type === "recovered");
  const recovered = recoveredEvents.length;
  const recoveryRatePct = flagged > 0 ? Math.round((recovered / flagged) * 1000) / 10 : 0;
  const avgRecoveryMinutes =
    recovered > 0
      ? Math.round(
          recoveredEvents.reduce((sum, e) => sum + (e.recoveryMinutes || 0), 0) / recovered
        )
      : 0;

  return { flagged, remindersSent, recovered, recoveryRatePct, avgRecoveryMinutes };
}
