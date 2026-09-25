// Push notification campaign store (prototype: localStorage-backed).

export type NotificationStatus = "scheduled" | "sent" | "ended";
export type NotificationAction = "native" | "h5" | "browser" | "none";
export type NotificationAudience = "everyone" | "specified";
export type NotificationSendType = "immediate" | "scheduled";
export type NotificationTrigger =
  | "manual"
  | "daily_marketing_scan"
  | "order_failed"
  | "new_user_label";
export type NotificationMessageType = "in_app" | "external";

export interface AppNotification {
  id: string;
  code: string; // B0000456
  title: string; // message name
  body: string; // message content
  site: string; // cardchat
  notificationType: "automatic"; // reserved for future manual types
  trigger: NotificationTrigger;
  messageType: NotificationMessageType;
  platforms: ("android" | "ios")[];
  action: NotificationAction;
  pathParam: string;
  startVersion: string;
  endVersion: string;
  sendType: NotificationSendType;
  sendAt: string; // ISO datetime (for scheduled)
  audience: NotificationAudience;
  recipients: string[]; // aliases when audience === "specified"
  recipientCount: number; // targeted recipients
  deliveredCount: number;
  clickCount: number;
  remark: string;
  addedBy: string;
  createdAt: string;
  endedManually?: boolean;
}

const KEY = "cc_notifications";

const SEED: AppNotification[] = [
  {
    id: "n8",
    code: "B0000456",
    title: "Dashboard Inner (Baseline B)",
    body: "You have a new order update — open the app to view it.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "daily_marketing_scan",
    messageType: "in_app",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-21T17:27",
    audience: "specified",
    recipients: ["A1B2C3", "M4V9QZ", "K9M2BL"],
    recipientCount: 5492,
    deliveredCount: 5492,
    clickCount: 0,
    remark: "Daily scan baseline group B (inner).",
    addedBy: "Admin One",
    createdAt: "2026-09-21T17:00:00Z",
  },
  {
    id: "n7",
    code: "B0000455",
    title: "Dashboard Outer (Baseline B)",
    body: "You have a new order update — open the app to view it.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "daily_marketing_scan",
    messageType: "external",
    platforms: ["android", "ios"],
    action: "browser",
    pathParam: "https://cardchat.lovable.app/customer",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-21T17:13",
    audience: "specified",
    recipients: ["R4P8TN"],
    recipientCount: 1,
    deliveredCount: 1,
    clickCount: 1,
    remark: "Baseline B external control.",
    addedBy: "Admin One",
    createdAt: "2026-09-21T16:55:00Z",
    endedManually: true,
  },
  {
    id: "n6",
    code: "B0000454",
    title: "Dashboard Outer (Baseline B)",
    body: "You have a new order update — open the app to view it.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "daily_marketing_scan",
    messageType: "external",
    platforms: ["android", "ios"],
    action: "browser",
    pathParam: "https://cardchat.lovable.app/customer",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-21T17:07",
    audience: "specified",
    recipients: ["Z7Q2WX"],
    recipientCount: 1,
    deliveredCount: 0,
    clickCount: 0,
    remark: "Device token invalid — no delivery.",
    addedBy: "Admin One",
    createdAt: "2026-09-21T16:50:00Z",
    endedManually: true,
  },
  {
    id: "n5",
    code: "B0000453",
    title: "Dashboard Outer (Baseline A)",
    body: "You have a new order update — open the app to view it.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "daily_marketing_scan",
    messageType: "external",
    platforms: ["android", "ios"],
    action: "browser",
    pathParam: "https://cardchat.lovable.app/customer",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-20T16:40",
    audience: "specified",
    recipients: ["A1B2C3", "M4V9QZ", "K9M2BL", "R4P8TN"],
    recipientCount: 15,
    deliveredCount: 15,
    clickCount: 7,
    remark: "Baseline A external group.",
    addedBy: "Admin One",
    createdAt: "2026-09-20T16:20:00Z",
    endedManually: true,
  },
  {
    id: "n4",
    code: "B0000452",
    title: "Dashboard (Baseline A)",
    body: "You have a new order update — open the app to view it.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "daily_marketing_scan",
    messageType: "in_app",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-20T16:40",
    audience: "specified",
    recipients: [],
    recipientCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    remark: "Empty label group — no targets matched.",
    addedBy: "Admin One",
    createdAt: "2026-09-20T16:20:00Z",
    endedManually: true,
  },
  {
    id: "n3",
    code: "B0000451",
    title: "Order Failed Alert",
    body: "Hello, how are you? Your recent order could not be completed — tap to retry.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "order_failed",
    messageType: "in_app",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer/chat",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-18T18:06",
    audience: "everyone",
    recipients: [],
    recipientCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    remark: "Triggered on order transaction failure.",
    addedBy: "Admin One",
    createdAt: "2026-09-18T17:45:00Z",
  },
  {
    id: "n2",
    code: "B0000450",
    title: "Order Failed Alert",
    body: "Hello, how are you? Your recent order could not be completed — tap to retry.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "order_failed",
    messageType: "in_app",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer/chat",
    startVersion: "1.0.0",
    endVersion: "5.0.0",
    sendType: "scheduled",
    sendAt: "2026-09-18T17:06",
    audience: "everyone",
    recipients: [],
    recipientCount: 0,
    deliveredCount: 0,
    clickCount: 0,
    remark: "Completed order-failure run.",
    addedBy: "Admin One",
    createdAt: "2026-09-18T16:50:00Z",
    endedManually: true,
  },
  {
    id: "n1",
    code: "B0000448",
    title: "New User Label Test 5 (Inner)",
    body: "We miss you! Users without a trade in 9–54 days get a boosted rate this week.",
    site: "cardchat",
    notificationType: "automatic",
    trigger: "new_user_label",
    messageType: "in_app",
    platforms: ["android", "ios"],
    action: "native",
    pathParam: "/customer",
    startVersion: "1.0.0",
    endVersion: "5.1.0",
    sendType: "scheduled",
    sendAt: "2026-09-18T14:48",
    audience: "specified",
    recipients: ["A1B2C3", "M4V9QZ"],
    recipientCount: 54,
    deliveredCount: 54,
    clickCount: 0,
    remark: "New-user label re-engagement test.",
    addedBy: "Admin One",
    createdAt: "2026-09-18T14:30:00Z",
    endedManually: true,
  },
];

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppNotification>[];
      // Normalize records saved before the activity-code/trigger/stats fields existed.
      return parsed.map(
        (n) =>
          ({
            site: "cardchat",
            notificationType: "automatic",
            trigger: "manual",
            messageType: "in_app",
            recipientCount:
              n.audience === "specified" ? (n.recipients?.length ?? 0) : 0,
            deliveredCount: 0,
            clickCount: 0,
            ...n,
          }) as AppNotification
      );
    }
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
  return `B${String(max + 1).padStart(6, "0")}`;
}

export function notificationStatus(n: AppNotification, now = new Date()): NotificationStatus {
  if (n.endedManually) return "ended";
  if (n.sendType === "immediate") return "sent";
  const sendAt = new Date(n.sendAt);
  return now >= sendAt ? "sent" : "scheduled";
}

export function clickRate(n: AppNotification): string {
  if (!n.deliveredCount) return "0";
  return String(Number(((n.clickCount / n.deliveredCount) * 100).toFixed(4)));
}

export function formatSendTime(n: AppNotification): string {
  const raw = n.sendType === "immediate" ? n.createdAt : n.sendAt;
  if (!raw) return "—";
  const s = raw.slice(0, 19).replace("T", " ");
  return s.length === 16 ? `${s}:00` : s;
}

export const NOTIF_STATUS_LABEL: Record<NotificationStatus, string> = {
  scheduled: "Scheduled",
  sent: "Sending",
  ended: "Closed",
};

export const NOTIF_ACTION_LABEL: Record<NotificationAction, string> = {
  native: "Open Native Page",
  h5: "Open H5 Page",
  browser: "Open Page in Browser",
  none: "No Redirect",
};

export const NOTIF_TRIGGER_LABEL: Record<NotificationTrigger, string> = {
  manual: "Manual Send",
  daily_marketing_scan: "Automated Marketing · Daily Scan",
  order_failed: "Order Transaction Failed",
  new_user_label: "New User Label Test",
};

export const NOTIF_MSG_TYPE_LABEL: Record<NotificationMessageType, string> = {
  in_app: "In-App",
  external: "External",
};
