import { AppNotification, notificationStatus } from "./notifications";

export const INBOX_EVENT = "customer-notifications-updated";
const READ_KEY = "cc_notification_reads";
const PREF_KEY = "cc_notification_preferences";

export function readNotificationIds(): string[] {
  try { return JSON.parse(sessionStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
}
export function markNotificationRead(ids: string[], id: string): string[] {
  return [...new Set([...ids, id])];
}
export function saveNotificationRead(id: string) {
  sessionStorage.setItem(READ_KEY, JSON.stringify(markNotificationRead(readNotificationIds(), id)));
  window.dispatchEvent(new Event(INBOX_EVENT));
}
export function notificationPreference(label: string, fallback: boolean): boolean {
  try { return JSON.parse(sessionStorage.getItem(PREF_KEY) || "{}")[label] ?? fallback; } catch { return fallback; }
}
export function saveNotificationPreference(label: string, enabled: boolean) {
  let prefs: Record<string, boolean> = {};
  try { prefs = JSON.parse(sessionStorage.getItem(PREF_KEY) || "{}"); } catch { /* reset malformed prototype state */ }
  sessionStorage.setItem(PREF_KEY, JSON.stringify({ ...prefs, [label]: enabled }));
  window.dispatchEvent(new Event(INBOX_EVENT));
}
export function visibleCampaigns(campaigns: AppNotification[], promotions: boolean, alias: string, tagIds: string[], now = new Date()) {
  return campaigns.filter(n => notificationStatus(n, now) === "sent" &&
    (n.trigger === "order_failed" ? notificationPreference("Order Updates", true) : promotions) &&
    (n.audience === "everyone" || (n.audienceMode === "tags" ? n.tagIds?.some(id => tagIds.includes(id)) : n.recipients.includes(alias))));
}