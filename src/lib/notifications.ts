// Push notification campaign store (prototype: localStorage-backed).

export type NotificationStatus = "scheduled" | "sent" | "ended";
export type NotificationAction = "native" | "h5" | "browser" | "none";
export type NotificationAudience = "everyone" | "specified";
export type NotificationSendType = "immediate" | "scheduled";

export interface AppNotification {
  id: string;
  code: string; // NTF-001
  title: string;
  body: string;
  platforms: ("android" | "ios")[];
  action: NotificationAction;
  pathParam: string;
  startVersion: string;
  endVersion: string;
  sendType: NotificationSendType;
  sendAt: string; // ISO datetime (for scheduled)
  audience: NotificationAudience;
  recipients: string[]; // aliases when audience === "specified"
  remark: string;
  addedBy: string;
  createdAt: string;
  endedManually?: boolean;
}

const KEY = "cc_notifications";

const SEED: AppNotification[] = [
  {
    id: "n1",
    code: "NTF-001",
    title: "Weekend Rate Boost 🚀",
    body: "iTunes US rates are up 3% this weekend only. Trade now to lock in the boost!",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer",
    startVersion: "1.0.0",
    endVersion: "3.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-26T09:00",
    audience: "everyone",
    recipients: [],
    remark: "Weekend promo push.",
    addedBy: "Admin One",
    createdAt: "2026-09-20T08:00:00Z",
  },
  {
    id: "n2",
    code: "NTF-002",
    title: "Your reward is waiting 🎁",
    body: "You climbed the ranking this period — open the app to claim your reward.",
    platforms: ["android"],
    action: "native",
    pathParam: "/customer/rewards",
    startVersion: "2.0.0",
    endVersion: "3.5.0",
    sendType: "immediate",
    sendAt: "2026-09-18T14:30",
    audience: "specified",
    recipients: ["A1B2C3", "M4V9QZ"],
    remark: "VIP reward nudge.",
    addedBy: "Admin One",
    createdAt: "2026-09-18T14:00:00Z",
  },
  {
    id: "n3",
    code: "NTF-003",
    title: "Scheduled maintenance",
    body: "CardChat will be briefly unavailable on Sunday 02:00–03:00 UTC for maintenance.",
    platforms: ["android", "ios"],
    action: "none",
    pathParam: "",
    startVersion: "1.0.0",
    endVersion: "2.9.9",
    sendType: "scheduled",
    sendAt: "2026-08-30T18:00",
    audience: "everyone",
    recipients: [],
    remark: "Completed maintenance notice.",
    addedBy: "Admin One",
    createdAt: "2026-08-28T08:00:00Z",
    endedManually: true,
  },
];

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {
    /* ignore */
  }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

export function saveNotifications(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("cc_notifications_changed"));
}

export function nextNotificationCode(list: AppNotification[]): string {
  const max = list.reduce((m, p) => {
    const n = Number(p.code.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `NTF-${String(max + 1).padStart(3, "0")}`;
}

export function notificationStatus(n: AppNotification, now = new Date()): NotificationStatus {
  if (n.endedManually) return "ended";
  if (n.sendType === "immediate") return "sent";
  const sendAt = new Date(n.sendAt);
  return now >= sendAt ? "sent" : "scheduled";
}

export const NOTIF_STATUS_LABEL: Record<NotificationStatus, string> = {
  scheduled: "Scheduled",
  sent: "Sent",
  ended: "Ended",
};

export const NOTIF_ACTION_LABEL: Record<NotificationAction, string> = {
  native: "Open Native Page",
  h5: "Open H5 Page",
  browser: "Open Page in Browser",
  none: "No Redirect",
};
