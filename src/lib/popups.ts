// Popup & in-app marketing banner store (prototype: localStorage-backed).

export type PopupStatus = "not_started" | "live" | "ended";
export type PopupType = "full_screen" | "in_between";
export type PopupFrequency = "once" | "daily" | "every_launch";
export type PopupAudience = "everyone" | "specified";
export type PopupAction = "native" | "h5" | "browser" | "none";
export type PopupScreen =
  | "Home"
  | "Chat"
  | "Wallet"
  | "Rates"
  | "Rewards"
  | "Ranking"
  | "Settings";

export const POPUP_SCREENS: PopupScreen[] = [
  "Home",
  "Chat",
  "Wallet",
  "Rates",
  "Rewards",
  "Ranking",
  "Settings",
];

export interface Popup {
  id: string;
  code: string; // POP-001
  name: string;
  type: PopupType;
  platforms: ("android" | "ios")[];
  screen: PopupScreen;
  action: PopupAction;
  pathParam: string;
  startVersion: string;
  endVersion: string;
  order: number;
  image: string; // data URL or remote URL
  startDate: string; // YYYY-MM-DD
  endDate: string;
  frequency: PopupFrequency;
  audience: PopupAudience;
  recipients: string[]; // aliases when audience === "specified"
  remark: string;
  addedBy: string;
  createdAt: string;
  endedManually?: boolean;
}

const KEY = "cc_popups";

const SEED: Popup[] = [
  {
    id: "p1",
    code: "POP-001",
    name: "September Rate Boost",
    type: "full_screen",
    platforms: ["android", "ios"],
    screen: "Home",
    action: "native",
    pathParam: "/customer/rewards",
    startVersion: "1.0.0",
    endVersion: "3.0.0",
    order: 1,
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=60",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    frequency: "daily",
    audience: "everyone",
    recipients: [],
    remark: "Promote boosted iTunes rates for the month.",
    addedBy: "Admin One",
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "p2",
    code: "POP-002",
    name: "Ranking Season Launch",
    type: "in_between",
    platforms: ["android"],
    screen: "Ranking",
    action: "none",
    pathParam: "",
    startVersion: "2.0.0",
    endVersion: "3.5.0",
    order: 2,
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=60",
    startDate: "2026-10-01",
    endDate: "2026-10-15",
    frequency: "once",
    audience: "specified",
    recipients: ["A1B2C3", "M4V9QZ"],
    remark: "VIP-only teaser for the new ranking season.",
    addedBy: "Admin One",
    createdAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "p3",
    code: "POP-003",
    name: "August Referral Push",
    type: "full_screen",
    platforms: ["android", "ios"],
    screen: "Home",
    action: "browser",
    pathParam: "https://cardchat.lovable.app/landing",
    startVersion: "1.0.0",
    endVersion: "2.9.9",
    order: 3,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=60",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    frequency: "every_launch",
    audience: "everyone",
    recipients: [],
    remark: "Completed campaign.",
    addedBy: "Admin One",
    createdAt: "2026-07-25T08:00:00Z",
    endedManually: true,
  },
];

export function loadPopups(): Popup[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Popup[];
  } catch {
    /* ignore */
  }
  localStorage.setItem(KEY, JSON.stringify(SEED));
  return SEED;
}

export function savePopups(list: Popup[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("cc_popups_changed"));
}

export function nextCode(list: Popup[]): string {
  const max = list.reduce((m, p) => {
    const n = Number(p.code.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `POP-${String(max + 1).padStart(3, "0")}`;
}

export function popupStatus(p: Popup, now = new Date()): PopupStatus {
  if (p.endedManually) return "ended";
  const start = new Date(`${p.startDate}T00:00:00`);
  const end = new Date(`${p.endDate}T23:59:59`);
  if (now < start) return "not_started";
  if (now > end) return "ended";
  return "live";
}

export const STATUS_LABEL: Record<PopupStatus, string> = {
  not_started: "Not Started",
  live: "Live",
  ended: "Ended",
};

export const FREQUENCY_LABEL: Record<PopupFrequency, string> = {
  once: "Pop Up Once",
  daily: "Pop Up Daily",
  every_launch: "Pop Up on Every Launch",
};

export const ACTION_LABEL: Record<PopupAction, string> = {
  native: "Open Native Page",
  h5: "Open H5 Page",
  browser: "Open Page in Browser",
  none: "No Redirect",
};

export const TYPE_LABEL: Record<PopupType, string> = {
  full_screen: "Full Screen",
  in_between: "In-Between Screen",
};

function verParts(v: string) {
  return v.split(".").map((n) => Number(n) || 0);
}

export function compareVersion(a: string, b: string): number {
  const pa = verParts(a);
  const pb = verParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}

export function isValidSemver(v: string) {
  return /^\d+\.\d+\.\d+$/.test(v.trim());
}

// ---- Customer-side frequency tracking ----

const SEEN_KEY = "cc_popup_seen";

function readSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}

export function markSeen(code: string) {
  const seen = readSeen();
  seen[code] = new Date().toISOString();
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

export function resetSeen() {
  localStorage.removeItem(SEEN_KEY);
}

function frequencyAllows(p: Popup): boolean {
  const seen = readSeen()[p.code];
  if (p.frequency === "every_launch") return true;
  if (!seen) return true;
  if (p.frequency === "once") return false;
  return new Date(seen).toDateString() !== new Date().toDateString();
}

export interface AppContextForPopups {
  screen: PopupScreen;
  platform: "android" | "ios";
  appVersion: string;
  alias?: string;
}

export function eligiblePopups(ctx: AppContextForPopups, list = loadPopups()): Popup[] {
  return list
    .filter((p) => popupStatus(p) === "live")
    .filter((p) => p.screen === ctx.screen)
    .filter((p) => p.platforms.includes(ctx.platform))
    .filter(
      (p) =>
        compareVersion(ctx.appVersion, p.startVersion) >= 0 &&
        compareVersion(ctx.appVersion, p.endVersion) <= 0
    )
    .filter(
      (p) =>
        p.audience === "everyone" ||
        (ctx.alias ? p.recipients.includes(ctx.alias) : false)
    )
    .filter(frequencyAllows)
    .sort((a, b) => a.order - b.order);
}
