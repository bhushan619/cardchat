// Mock dataset + analytics helpers for the Customer Trading Analytics admin page.

export type Channel = "trtc" | "whatsapp";
export type AgentName = "Admin One" | "Sarah Lead" | "Mike Agent";

export type TradeOrder = {
  id: string;
  date: string; // ISO timestamp
  channel: Channel;
  agent: AgentName;
  customerAlias: string;
  cardType: string;
  volumePoints: number;
};

// ---------------- Seeded PRNG (mulberry32) ----------------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260318);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rand() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function genAlias(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHANUM[randInt(0, ALPHANUM.length - 1)];
  return s;
}

const AGENTS: AgentName[] = ["Admin One", "Sarah Lead", "Mike Agent"];

const CARD_TYPES_WEIGHTED: { value: string; weight: number }[] = [
  { value: "iTunes", weight: 22 },
  { value: "Steam", weight: 16 },
  { value: "Amazon", weight: 14 },
  { value: "Google Play", weight: 11 },
  { value: "Apple", weight: 9 },
  { value: "eBay", weight: 7 },
  { value: "Walmart", weight: 6 },
  { value: "Sephora", weight: 4 },
  { value: "Nike", weight: 3 },
  { value: "Visa", weight: 3 },
  { value: "Xbox", weight: 1.5 },
  { value: "Razer Gold", weight: 1.2 },
  { value: "Netflix", weight: 1.1 },
  { value: "Foot Locker", weight: 0.8 },
  { value: "Macy's", weight: 0.4 },
];

// ~40 recurring aliases with weights (some heavier traders than others)
const RECURRING_ALIASES: { value: string; weight: number }[] = Array.from({ length: 40 }).map(() => ({
  value: genAlias(),
  weight: randInt(1, 10),
}));

function randomAlias(): string {
  // 80% chance of recurring customer, 20% one-time
  if (rand() < 0.8) {
    return weightedPick(RECURRING_ALIASES);
  }
  return genAlias();
}

function randomVolume(): number {
  // most orders small-medium, some big
  const base = randInt(2000, 50000);
  const bigBoost = rand() < 0.08 ? randInt(50000, 400000) : 0;
  return base + bigBoost;
}

// Weighted hour-of-day distribution: weekday 10-13 & 19-22 busiest
function weightedHour(isWeekend: boolean): number {
  const weights: number[] = [];
  for (let h = 0; h < 24; h++) {
    let w = 1;
    if (!isWeekend && ((h >= 10 && h < 13) || (h >= 19 && h < 22))) w = 8;
    else if (!isWeekend && h >= 8 && h < 23) w = 3;
    else if (isWeekend && h >= 11 && h < 22) w = 4;
    else w = 1;
    weights.push(w);
  }
  const items = weights.map((w, h) => ({ value: h, weight: w }));
  return weightedPick(items);
}

const NOW = new Date("2026-03-20T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function buildOrders(): TradeOrder[] {
  const orders: TradeOrder[] = [];
  const totalOrders = 400;
  for (let i = 0; i < totalOrders; i++) {
    const daysAgo = randInt(0, 89);
    const dayStart = new Date(NOW.getTime() - daysAgo * DAY_MS);
    const isWeekend = dayStart.getUTCDay() === 0 || dayStart.getUTCDay() === 6;
    const hour = weightedHour(isWeekend);
    const minute = randInt(0, 59);
    const second = randInt(0, 59);
    const date = new Date(Date.UTC(
      dayStart.getUTCFullYear(),
      dayStart.getUTCMonth(),
      dayStart.getUTCDate(),
      hour, minute, second,
    ));

    orders.push({
      id: `ORD-${date.getTime()}-${i}`,
      date: date.toISOString(),
      channel: rand() < 0.62 ? "trtc" : "whatsapp",
      agent: pick(AGENTS),
      customerAlias: randomAlias(),
      cardType: weightedPick(CARD_TYPES_WEIGHTED),
      volumePoints: randomVolume(),
    });
  }
  return orders.sort((a, b) => a.date.localeCompare(b.date));
}

export const tradingOrders: TradeOrder[] = buildOrders();

// ---------------- Helpers ----------------

export function getOrdersInRange(
  start: Date,
  end: Date,
  channel?: Channel | "all",
  agent?: AgentName | "all",
): TradeOrder[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return tradingOrders.filter((o) => {
    const t = new Date(o.date).getTime();
    if (t < startMs || t > endMs) return false;
    if (channel && channel !== "all" && o.channel !== channel) return false;
    if (agent && agent !== "all" && o.agent !== agent) return false;
    return true;
  });
}

export function summarize(orders: TradeOrder[]): {
  totalVolume: number;
  totalOrders: number;
  avgOrderValue: number;
  activeCustomers: number;
} {
  const totalVolume = orders.reduce((s, o) => s + o.volumePoints, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? Math.round(totalVolume / totalOrders) : 0;
  const activeCustomers = new Set(orders.map((o) => o.customerAlias)).size;
  return { totalVolume, totalOrders, avgOrderValue, activeCustomers };
}

export function volumeByDay(orders: TradeOrder[]): { date: string; volume: number; orders: number }[] {
  const map = new Map<string, { volume: number; orders: number }>();
  for (const o of orders) {
    const day = o.date.slice(0, 10);
    const cur = map.get(day) || { volume: 0, orders: 0 };
    cur.volume += o.volumePoints;
    cur.orders += 1;
    map.set(day, cur);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, ...v }));
}

export function volumeByCardType(orders: TradeOrder[]): { cardType: string; volume: number; orders: number }[] {
  const map = new Map<string, { volume: number; orders: number }>();
  for (const o of orders) {
    const cur = map.get(o.cardType) || { volume: 0, orders: 0 };
    cur.volume += o.volumePoints;
    cur.orders += 1;
    map.set(o.cardType, cur);
  }
  const list = Array.from(map.entries())
    .map(([cardType, v]) => ({ cardType, ...v }))
    .sort((a, b) => b.volume - a.volume);

  const top = list.slice(0, 10);
  const rest = list.slice(10);
  if (rest.length) {
    const othersVolume = rest.reduce((s, r) => s + r.volume, 0);
    const othersOrders = rest.reduce((s, r) => s + r.orders, 0);
    top.push({ cardType: "Others", volume: othersVolume, orders: othersOrders });
  }
  return top;
}

export type PeakCell = { orders: number; volume: number; customers: Set<string> };

export function peakHoursMatrix(orders: TradeOrder[]): {
  matrix: number[][]; // 7 x 24, orders count
  detail: { orders: number; volume: number; customers: number }[][];
} {
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const cells: PeakCell[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ orders: 0, volume: 0, customers: new Set<string>() })),
  );

  for (const o of orders) {
    const d = new Date(o.date);
    // Monday = 0 ... Sunday = 6
    const jsDay = d.getUTCDay(); // 0 = Sunday
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
    const hour = d.getUTCHours();
    matrix[dayIdx][hour] += 1;
    cells[dayIdx][hour].orders += 1;
    cells[dayIdx][hour].volume += o.volumePoints;
    cells[dayIdx][hour].customers.add(o.customerAlias);
  }

  const detail = cells.map((row) =>
    row.map((c) => ({ orders: c.orders, volume: c.volume, customers: c.customers.size })),
  );

  return { matrix, detail };
}

export type CustomerMovement = {
  alias: string;
  currentVolume: number;
  previousVolume: number;
  growthPct: number;
};

export function customerGrowth(
  currentOrders: TradeOrder[],
  previousOrders: TradeOrder[],
): { growing: CustomerMovement[]; declining: CustomerMovement[] } {
  const curMap = new Map<string, number>();
  for (const o of currentOrders) curMap.set(o.customerAlias, (curMap.get(o.customerAlias) || 0) + o.volumePoints);
  const prevMap = new Map<string, number>();
  for (const o of previousOrders) prevMap.set(o.customerAlias, (prevMap.get(o.customerAlias) || 0) + o.volumePoints);

  const aliases = new Set([...curMap.keys(), ...prevMap.keys()]);
  const movements: CustomerMovement[] = [];
  for (const alias of aliases) {
    const currentVolume = curMap.get(alias) || 0;
    const previousVolume = prevMap.get(alias) || 0;
    if (previousVolume === 0 && currentVolume === 0) continue;
    let growthPct: number;
    if (previousVolume === 0) growthPct = 100;
    else growthPct = Math.round(((currentVolume - previousVolume) / previousVolume) * 100);
    movements.push({ alias, currentVolume, previousVolume, growthPct });
  }

  const growing = movements
    .filter((m) => m.growthPct > 0)
    .sort((a, b) => b.growthPct - a.growthPct)
    .slice(0, 10);
  const declining = movements
    .filter((m) => m.growthPct < 0)
    .sort((a, b) => a.growthPct - b.growthPct)
    .slice(0, 10);

  return { growing, declining };
}

export function newVsReturning(
  orders: TradeOrder[],
  allOrdersBefore: TradeOrder[],
): { newVolume: number; returningVolume: number; newCount: number; returningCount: number } {
  const priorAliases = new Set(allOrdersBefore.map((o) => o.customerAlias));
  let newVolume = 0;
  let returningVolume = 0;
  const newAliases = new Set<string>();
  const returningAliases = new Set<string>();

  for (const o of orders) {
    if (priorAliases.has(o.customerAlias)) {
      returningVolume += o.volumePoints;
      returningAliases.add(o.customerAlias);
    } else {
      newVolume += o.volumePoints;
      newAliases.add(o.customerAlias);
    }
  }

  return {
    newVolume,
    returningVolume,
    newCount: newAliases.size,
    returningCount: returningAliases.size,
  };
}

export type CardTypeRankShift = {
  cardType: string;
  thisWeekRank: number;
  lastWeekRank: number | null; // null = did not appear last week
  change: "up" | "down" | "same" | "new";
  thisWeekVolume: number;
  thisWeekOrders: number;
};

export function cardTypeRankShifts(): CardTypeRankShift[] {
  const thisWeekStart = new Date(NOW.getTime() - 7 * DAY_MS);
  const lastWeekStart = new Date(NOW.getTime() - 14 * DAY_MS);
  const lastWeekEnd = thisWeekStart;

  const thisWeekOrders = getOrdersInRange(thisWeekStart, NOW);
  const lastWeekOrders = getOrdersInRange(lastWeekStart, lastWeekEnd);

  const thisWeekByType = volumeByCardType(thisWeekOrders).filter((c) => c.cardType !== "Others");
  const lastWeekByType = volumeByCardType(lastWeekOrders).filter((c) => c.cardType !== "Others");

  const thisRankMap = new Map<string, number>();
  thisWeekByType
    .sort((a, b) => b.volume - a.volume)
    .forEach((c, i) => thisRankMap.set(c.cardType, i + 1));

  const lastRankMap = new Map<string, number>();
  lastWeekByType
    .sort((a, b) => b.volume - a.volume)
    .forEach((c, i) => lastRankMap.set(c.cardType, i + 1));

  const thisWeekDetail = new Map(thisWeekByType.map((c) => [c.cardType, c]));

  const result: CardTypeRankShift[] = [];
  for (const [cardType, thisWeekRank] of thisRankMap.entries()) {
    const lastWeekRank = lastRankMap.get(cardType) ?? null;
    let change: CardTypeRankShift["change"];
    if (lastWeekRank === null) change = "new";
    else if (thisWeekRank < lastWeekRank) change = "up";
    else if (thisWeekRank > lastWeekRank) change = "down";
    else change = "same";

    const detail = thisWeekDetail.get(cardType);
    result.push({
      cardType,
      thisWeekRank,
      lastWeekRank,
      change,
      thisWeekVolume: detail?.volume ?? 0,
      thisWeekOrders: detail?.orders ?? 0,
    });
  }

  return result.sort((a, b) => a.thisWeekRank - b.thisWeekRank);
}

export const ANALYTICS_NOW = NOW;
