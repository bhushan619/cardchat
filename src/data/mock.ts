// Mock data for Cardchat interactive prototypes

// denominationSpec: describes how denominations are offered for a rate.
//  - { kind: "list", values }   → discrete list, e.g. $10, $25, $50
//  - { kind: "range", min, max }→ any face value between min and max
//  - { kind: "multiples", of, min?, max? } → any multiple of N (optionally bounded)
//  - { kind: "any" }            → any denomination accepted (empty / unrestricted)
export type DenominationSpec =
  | { kind: "list"; values: number[] }
  | { kind: "range"; min: number; max: number }
  | { kind: "multiples"; of: number; min?: number; max?: number }
  | { kind: "any" };

const baseRates: Array<{
  cardType: string;
  currency: string;
  cardFormat: "Physical" | "E-Code";
  sellRate: number;
  denominationSpec: DenominationSpec;
  lastUpdated: string;
}> = [
  { cardType: "iTunes US", currency: "USD", cardFormat: "Physical", sellRate: 720, denominationSpec: { kind: "list", values: [10, 25, 50, 100, 200, 500] }, lastUpdated: "2 min ago" },
  { cardType: "iTunes US", currency: "USD", cardFormat: "E-Code", sellRate: 740, denominationSpec: { kind: "range", min: 10, max: 500 }, lastUpdated: "2 min ago" },
  { cardType: "Amazon US", currency: "USD", cardFormat: "Physical", sellRate: 660, denominationSpec: { kind: "list", values: [25, 50, 100, 200, 500, 1000] }, lastUpdated: "2 min ago" },
  { cardType: "Amazon US", currency: "USD", cardFormat: "E-Code", sellRate: 680, denominationSpec: { kind: "multiples", of: 5, min: 10, max: 500 }, lastUpdated: "2 min ago" },
  { cardType: "Steam US", currency: "USD", cardFormat: "Physical", sellRate: 640, denominationSpec: { kind: "list", values: [20, 50, 100] }, lastUpdated: "3 min ago" },
  { cardType: "Steam US", currency: "USD", cardFormat: "E-Code", sellRate: 660, denominationSpec: { kind: "multiples", of: 10 }, lastUpdated: "3 min ago" },
  { cardType: "Google Play US", currency: "USD", cardFormat: "Physical", sellRate: 630, denominationSpec: { kind: "list", values: [10, 25, 50, 100] }, lastUpdated: "2 min ago" },
  { cardType: "iTunes UK", currency: "GBP", cardFormat: "Physical", sellRate: 900, denominationSpec: { kind: "range", min: 10, max: 200 }, lastUpdated: "5 min ago" },
  { cardType: "Amazon UK", currency: "GBP", cardFormat: "Physical", sellRate: 830, denominationSpec: { kind: "list", values: [25, 50, 100, 200] }, lastUpdated: "3 min ago" },
  { cardType: "Vanilla Visa", currency: "USD", cardFormat: "Physical", sellRate: 590, denominationSpec: { kind: "any" }, lastUpdated: "1 min ago" },
  { cardType: "eBay US", currency: "USD", cardFormat: "E-Code", sellRate: 610, denominationSpec: { kind: "list", values: [10, 25, 50, 100] }, lastUpdated: "4 min ago" },
  { cardType: "Razer Gold", currency: "USD", cardFormat: "E-Code", sellRate: 700, denominationSpec: { kind: "multiples", of: 5, min: 10, max: 200 }, lastUpdated: "1 min ago" },
  { cardType: "Sephora", currency: "USD", cardFormat: "Physical", sellRate: 520, denominationSpec: { kind: "list", values: [25, 50, 100, 200, 500] }, lastUpdated: "6 min ago" },
  { cardType: "Walmart", currency: "USD", cardFormat: "Physical", sellRate: 560, denominationSpec: { kind: "range", min: 25, max: 500 }, lastUpdated: "4 min ago" },
  { cardType: "Nordstrom", currency: "USD", cardFormat: "E-Code", sellRate: 540, denominationSpec: { kind: "any" }, lastUpdated: "7 min ago" },
];

// Expand a DenominationSpec into a concrete list of denominations for pickers.
export function expandDenominations(spec: DenominationSpec): number[] {
  if (spec.kind === "list") return spec.values;
  if (spec.kind === "range") {
    const step = spec.min >= 100 ? 50 : spec.min >= 25 ? 25 : 5;
    const out: number[] = [];
    for (let v = spec.min; v <= spec.max; v += step) out.push(v);
    return out;
  }
  if (spec.kind === "multiples") {
    const min = spec.min ?? spec.of;
    const max = spec.max ?? spec.of * 20;
    const out: number[] = [];
    for (let v = min; v <= max; v += spec.of) out.push(v);
    return out;
  }
  // "any" — provide a sensible default ladder
  return [10, 25, 50, 100, 200, 500];
}

// Format a DenominationSpec as a compact display string.
export function formatDenominations(spec: DenominationSpec, symbol = "$"): string {
  if (spec.kind === "list") return spec.values.map(v => `${symbol}${v}`).join(", ");
  if (spec.kind === "range") return `${symbol}${spec.min} – ${symbol}${spec.max}`;
  if (spec.kind === "multiples") {
    const bounds =
      spec.min || spec.max
        ? ` (${symbol}${spec.min ?? spec.of}${spec.max ? `–${symbol}${spec.max}` : "+"})`
        : "";
    return `Multiples of ${symbol}${spec.of}${bounds}`;
  }
  return "Any denomination";
}

const remarksByFormat: Record<string, string[]> = {
  Physical: [
    "Fast card · Horizontal cards only · Clear picture required",
    "Single card only · Clear picture required",
    "Accepts multiples · Horizontal cards only",
    "Face value only · Clear picture required. For high-volume submissions, stack cards neatly and capture all corners in one frame. Processing may take 5–10 minutes during peak hours; contact support if delay exceeds 30 minutes.",
  ],
  "E-Code": [
    "Fast card · Accepts multiples of 5",
    "E-codes only · Instant processing",
    "Accepts multiples of 10 · No screenshots",
    "High-volume cards welcome. Please ensure codes are clearly visible and unused. Processing may take 5–10 minutes during peak hours. Contact support if delay exceeds 30 minutes.",
  ],
};

export const cardRates = baseRates.map((r, i) => {
  const pool = remarksByFormat[r.cardFormat] || [""];
  const buyRate = Math.round(r.sellRate * 0.94);
  return {
    id: i + 1,
    ...r,
    buyRate,
    // VIP customers get the VIP price control band (88% vs 85%)
    vipBuyRate: Math.round(buyRate * (88 / 85)),
    remarks: pool[i % pool.length],
  };
});

export const systemNairaRate = 289;
export const systemDenomination = 100;
export const systemPriceControl = 85.00; // normal price control, percentage 1.00% - 100.00%
export const systemVipPriceControl = 88.00; // VIP price control, percentage 1.00% - 100.00%

// Fund adjustment records
export type FundAdjustment = {
  id: string;
  customerAlias: string;
  type: "addition" | "deduction";
  amount: number;
  reason: string;
  performedBy: string;
  timestamp: string;
};

export const fundAdjustments: FundAdjustment[] = [];

// Channel a customer is currently messaging from. TRTC.io = native in-app chat; WhatsApp = WhatsApp Business Cloud API (Meta).
export type MessagingChannel = "trtc" | "whatsapp";

export const conversations = [
  { id: "c1", alias: "A7X3KP", lastMessage: "I have iTunes $100 cards to sell", time: "2m", unread: 2, status: "consulting" as const, goodRate: 85, totalValue: "₦450,000", tags: ["VIP", "Repeat"], channel: "trtc" as MessagingChannel, whatsappNumber: "+234 803 111 2222" },
  { id: "c2", alias: "K9M2BL", lastMessage: "Card images sent", time: "5m", unread: 0, status: "trading" as const, goodRate: 72, totalValue: "₦120,000", tags: ["New"], channel: "whatsapp" as MessagingChannel, whatsappNumber: "+234 805 444 7788" },
  { id: "c3", alias: "R4P8TN", lastMessage: "When will I receive payment?", time: "8m", unread: 1, status: "trading" as const, goodRate: 90, totalValue: "₦2,100,000", tags: ["VIP"], channel: "trtc" as MessagingChannel, whatsappNumber: "+234 809 222 3344" },
  { id: "c4", alias: "B5N1QW", lastMessage: "Thanks for the quick transfer!", time: "15m", unread: 0, status: "consulting" as const, goodRate: 65, totalValue: "₦80,000", tags: [], channel: "whatsapp" as MessagingChannel, whatsappNumber: "+234 812 998 5566" },
  { id: "c5", alias: "H2L6YD", lastMessage: "Sending Amazon $50 card now", time: "20m", unread: 0, status: "trading" as const, goodRate: 78, totalValue: "₦340,000", tags: ["Repeat"], channel: "trtc" as MessagingChannel, whatsappNumber: "+234 807 661 2233" },
  { id: "c6", alias: "W8T4FJ", lastMessage: "Please check my bank details", time: "25m", unread: 3, status: "consulting" as const, goodRate: 88, totalValue: "₦1,500,000", tags: ["VIP", "Priority"], channel: "whatsapp" as MessagingChannel, whatsappNumber: "+234 814 770 9911" },
  { id: "c7", alias: "D3F9RX", lastMessage: "I want to sell Steam cards", time: "30m", unread: 0, status: "consulting" as const, goodRate: 60, totalValue: "₦45,000", tags: [], channel: "trtc" as MessagingChannel, whatsappNumber: "" },
];

export const chatMessages = [
  { id: 1, sender: "customer", text: "Hi, I have 2x iTunes $100 cards to sell", time: "10:32 AM" },
  { id: 2, sender: "agent", text: "Hello! Sure, please send clear images of both cards (front and back)", time: "10:33 AM" },
  { id: 3, sender: "customer", text: "", time: "10:35 AM", image: true },
  { id: 4, sender: "agent", text: "Cards received. Let me verify them now.", time: "10:36 AM" },
  { id: 5, sender: "system", text: "Order #ORD-20260318-001 created. Card: iTunes US $100 ×2.", time: "10:37 AM", isOrder: true },
  { id: 6, sender: "agent", text: "Cards verified ✅ Order created. Processing your billing now.", time: "10:38 AM" },
  { id: 7, sender: "customer", text: "Please send payout to GTB 0123456789 John Adebayo", time: "10:40 AM" },
  { id: 8, sender: "customer", text: "Actually use this one instead: Ecobank 1122334433 Jane Smith", time: "10:41 AM" },
];

export type OrderSource = "in-app" | "whatsapp";
export type OrderTransferStatus = "pending" | "processing" | "successful" | "failed" | "not_transferred";

export const orders = [
  { id: "ORD-20260318-001", customer: "A7X3KP", cardType: "iTunes US", amount: 200, nairaRate: 289, unitPrice: 680, status: "success" as const, source: "in-app" as OrderSource, transferStatus: "successful" as OrderTransferStatus, created: "18/03/2026 · 10:37 AM" },
  { id: "ORD-20260318-002", customer: "K9M2BL", cardType: "Amazon US", amount: 150, nairaRate: 289, unitPrice: 620, status: "in_trade" as const, source: "whatsapp" as OrderSource, transferStatus: "pending" as OrderTransferStatus, created: "18/03/2026 · 09:15 AM" },
  { id: "ORD-20260318-003", customer: "R4P8TN", cardType: "Steam US", amount: 200, nairaRate: 289, unitPrice: 600, status: "order_cancelled" as const, source: "in-app" as OrderSource, transferStatus: "not_transferred" as OrderTransferStatus, created: "18/03/2026 · 08:45 AM" },
];

export const bankAccounts = [
  { id: 1, bankName: "First Bank", accountNumber: "****1234", holderName: "JOHN A. DOE", verified: true },
  { id: 2, bankName: "GTBank", accountNumber: "****5678", holderName: "JOHN ADEBAYO", verified: true },
  { id: 3, bankName: "Access Bank", accountNumber: "****9012", holderName: "J.A. DOE", verified: true },
];

export const transactions = [
  { id: "TXN-001", orderId: "ORD-20260318-001", amount: "₦215,200", status: "success" as const, date: "18/03/2026", bank: "First Bank ****1234" },
  { id: "TXN-002", orderId: "ORD-20260317-005", amount: "₦93,000", status: "success" as const, date: "17/03/2026", bank: "GTBank ****5678" },
  { id: "TXN-003", orderId: "ORD-20260316-003", amount: "₦186,000", status: "failed" as const, date: "16/03/2026", bank: "Access Bank ****9012" },
  { id: "TXN-004", orderId: "ORD-20260315-008", amount: "₦62,000", status: "success" as const, date: "15/03/2026", bank: "First Bank ****1234" },
];

export const adminUsers = [
  { id: 1, name: "Admin One", email: "admin@cardchat.com", role: "super_admin" as const, status: "active" as const, lastLogin: "2 min ago" },
  { id: 2, name: "Sarah Lead", email: "sarah@cardchat.com", role: "team_lead" as const, status: "active" as const, lastLogin: "10 min ago" },
  { id: 3, name: "Mike Agent", email: "mike@cardchat.com", role: "agent" as const, status: "active" as const, lastLogin: "5 min ago" },
  { id: 4, name: "Tunde Agent", email: "tunde@cardchat.com", role: "agent" as const, status: "active" as const, lastLogin: "1 hr ago" },
  { id: 5, name: "Joy Agent", email: "joy@cardchat.com", role: "agent" as const, status: "offline" as const, lastLogin: "3 hrs ago" },
  { id: 6, name: "Femi Finance", email: "femi@cardchat.com", role: "finance" as const, status: "active" as const, lastLogin: "15 min ago" },
];

export const nairaRateHistory = [
  { timestamp: "18/03/2026 · 10:00 AM", oldRate: 270, newRate: 289, oldPriceControl: 84.0, newPriceControl: 85.0, oldVipPriceControl: 87.0, newVipPriceControl: 88.0, changedBy: "Admin One", reason: "Market adjustment" },
  { timestamp: "17/03/2026 · 02:30 PM", oldRate: 255, newRate: 270, oldPriceControl: 84.0, newPriceControl: 84.0, oldVipPriceControl: 86.5, newVipPriceControl: 87.0, changedBy: "Admin One", reason: "Daily update" },
  { timestamp: "16/03/2026 · 09:00 AM", oldRate: 240, newRate: 255, oldPriceControl: 83.5, newPriceControl: 84.0, oldVipPriceControl: 86.5, newVipPriceControl: 86.5, changedBy: "Admin One", reason: "Weekly review" },
];


export const promoBanners = [
  { id: 1, title: "Sell iTunes Cards", subtitle: "Best rates guaranteed!", color: "accent" },
  { id: 2, title: "Refer & Earn", subtitle: "Get ₦500 for every referral", color: "primary" },
  { id: 3, title: "New: Steam Cards", subtitle: "Now accepting Steam gift cards", color: "warning" },
];

export const customerContacts = [
  { id: 1, name: "CardChat Support", status: "online" as const, isAgent: true, lastSeen: "Online" },
  { id: 2, name: "Agent Mike", status: "online" as const, isAgent: true, lastSeen: "Online" },
  { id: 3, name: "Agent Tunde", status: "away" as const, isAgent: true, lastSeen: "15 min ago" },
  { id: 4, name: "Agent Joy", status: "saturated" as const, isAgent: true, lastSeen: "Active — high volume" },
];

// Wallet data
export const tradingBalance = 550000;
export const rewardsBalance = 6200;
export const walletBalance = tradingBalance + rewardsBalance;

export const walletTransactions = [
  { id: "WT-001", type: "credit" as const, amount: 215200, description: "Order #ORD-20260318-001 — iTunes US", date: "18/03/2026", time: "10:42 AM" },
  { id: "WT-002", type: "withdrawal" as const, amount: 150000, description: "Withdrawal to First Bank ****1234", date: "18/03/2026", time: "11:15 AM" },
  { id: "WT-003", type: "credit" as const, amount: 93000, description: "Order #ORD-20260317-005 — Amazon US", date: "17/03/2026", time: "03:20 PM" },
  { id: "WT-004", type: "withdrawal" as const, amount: 80000, description: "Withdrawal to GTBank ****5678", date: "17/03/2026", time: "04:00 PM" },
  { id: "WT-005", type: "credit" as const, amount: 62000, description: "Order #ORD-20260315-008 — iTunes UK", date: "15/03/2026", time: "02:10 PM" },
  { id: "WT-006", type: "credit" as const, amount: 186000, description: "Order #ORD-20260316-003 — Steam US", date: "16/03/2026", time: "09:30 AM" },
  { id: "WT-007", type: "withdrawal" as const, amount: 50000, description: "Withdrawal to Access Bank ****9012", date: "15/03/2026", time: "05:45 PM" },
];

// Customer wallet data for admin view
export const customerWallets = [
  { alias: "A7X3KP", balance: 265200, totalCredits: 556200, totalWithdrawals: 291000 },
  { alias: "K9M2BL", balance: 45000, totalCredits: 120000, totalWithdrawals: 75000 },
  { alias: "R4P8TN", balance: 830000, totalCredits: 2100000, totalWithdrawals: 1270000 },
  { alias: "B5N1QW", balance: 12000, totalCredits: 80000, totalWithdrawals: 68000 },
  { alias: "H2L6YD", balance: 98000, totalCredits: 340000, totalWithdrawals: 242000 },
  { alias: "W8T4FJ", balance: 620000, totalCredits: 1500000, totalWithdrawals: 880000 },
  { alias: "D3F9RX", balance: 15000, totalCredits: 45000, totalWithdrawals: 30000 },
];

// ---------------------------------------------------------------------------
// WhatsApp GROUP conversations (prototype mock)
// Groups have many participants; some are known customers (matched alias),
// others are unknown WhatsApp contacts.
// ---------------------------------------------------------------------------
export type GroupParticipant = {
  id: string;
  waName: string;
  phone: string;
  alias: string | null; // matched customer alias, null = not a customer
};

export type WhatsAppGroup = {
  id: string;
  isGroup: true;
  groupName: string;
  participants: GroupParticipant[];
  lastMessage: string;
  time: string;
  unread: number;
  tab: "consulting" | "trading";
  channel: MessagingChannel;
};

export type GroupMessage = {
  id: number;
  sender: "participant" | "agent";
  participantId?: string;
  text: string;
  time: string;
};

export const whatsappGroups: WhatsAppGroup[] = [
  {
    id: "g1",
    isGroup: true,
    groupName: "Lagos Traders Circle",
    channel: "whatsapp",
    lastMessage: "Amara: Rates for iTunes today?",
    time: "3m",
    unread: 4,
    tab: "consulting",
    participants: [
      { id: "g1p1", waName: "Amara", phone: "+234 803 111 2222", alias: "A7X3KP" },
      { id: "g1p2", waName: "Tobi Bello", phone: "+234 805 444 7788", alias: "K9M2BL" },
      { id: "g1p3", waName: "Chidi O.", phone: "+234 811 233 9080", alias: null },
      { id: "g1p4", waName: "Mama Nkechi", phone: "+234 802 556 1177", alias: "B5N1QW" },
      { id: "g1p5", waName: "Segun", phone: "+234 809 771 6644", alias: null },
      { id: "g1p6", waName: "Ifeanyi Cards", phone: "+234 813 900 2211", alias: "H2L6YD" },
      { id: "g1p7", waName: "Blessing A.", phone: "+234 806 122 8890", alias: null },
      { id: "g1p8", waName: "Kola", phone: "+234 814 665 3300", alias: null },
    ],
  },
  {
    id: "g2",
    isGroup: true,
    groupName: "Abuja Card Hub",
    channel: "whatsapp",
    lastMessage: "Segun: Sent the Steam codes ✅",
    time: "22m",
    unread: 0,
    tab: "consulting",
    participants: [
      { id: "g2p1", waName: "Segun", phone: "+234 809 771 6644", alias: "R4P8TN" },
      { id: "g2p2", waName: "Hauwa", phone: "+234 807 330 4455", alias: null },
      { id: "g2p3", waName: "Emeka Ent.", phone: "+234 812 998 5566", alias: "W8T4FJ" },
      { id: "g2p4", waName: "Deji", phone: "+234 815 220 7788", alias: null },
      { id: "g2p5", waName: "Grace", phone: "+234 803 909 1212", alias: "D3F9RX" },
    ],
  },
  {
    id: "g3",
    isGroup: true,
    groupName: "VIP Resellers 🇳🇬",
    channel: "whatsapp",
    lastMessage: "Hauwa: Any Amazon buyers today?",
    time: "1h",
    unread: 2,
    tab: "consulting",
    participants: [
      { id: "g3p1", waName: "Hauwa", phone: "+234 807 330 4455", alias: null },
      { id: "g3p2", waName: "Amara", phone: "+234 803 111 2222", alias: "A7X3KP" },
      { id: "g3p3", waName: "Bayo Trades", phone: "+234 810 445 2233", alias: null },
      { id: "g3p4", waName: "Uche", phone: "+234 816 700 1199", alias: "K9M2BL" },
    ],
  },
];

export const groupMessages: Record<string, GroupMessage[]> = {
  g1: [
    { id: 1, sender: "participant", participantId: "g1p1", text: "Good morning all 👋 Rates for iTunes today?", time: "09:02 AM" },
    { id: 2, sender: "agent", text: "Morning! iTunes US physical is 720 today.", time: "09:04 AM" },
    { id: 3, sender: "participant", participantId: "g1p3", text: "What about Steam e-code?", time: "09:06 AM" },
    { id: 4, sender: "participant", participantId: "g1p4", text: "I have 3x $100 Amazon to move.", time: "09:08 AM" },
    { id: 5, sender: "agent", text: "Steam e-code is 660. Amara, please DM me for the Amazon batch.", time: "09:10 AM" },
    { id: 6, sender: "participant", participantId: "g1p7", text: "Is the rate fixed for the whole day?", time: "09:14 AM" },
    { id: 7, sender: "participant", participantId: "g1p6", text: "Rates were solid yesterday, paid within 5 mins 🙏", time: "09:18 AM" },
    { id: 8, sender: "participant", participantId: "g1p1", text: "Sending pictures shortly.", time: "09:21 AM" },
  ],
  g2: [
    { id: 1, sender: "participant", participantId: "g2p2", text: "Anyone trading Razer Gold here?", time: "08:31 AM" },
    { id: 2, sender: "agent", text: "Yes, Razer Gold e-code at 700.", time: "08:33 AM" },
    { id: 3, sender: "participant", participantId: "g2p3", text: "Noted. I'll send mine after lunch.", time: "08:40 AM" },
    { id: 4, sender: "participant", participantId: "g2p1", text: "Sent the Steam codes ✅", time: "08:52 AM" },
  ],
  g3: [
    { id: 1, sender: "participant", participantId: "g3p3", text: "Group is quiet today 😅", time: "07:45 AM" },
    { id: 2, sender: "participant", participantId: "g3p2", text: "I just cashed out, smooth as usual.", time: "07:50 AM" },
    { id: 3, sender: "agent", text: "Glad to hear it! VIP rates are live all day.", time: "07:52 AM" },
    { id: 4, sender: "participant", participantId: "g3p1", text: "Any Amazon buyers today?", time: "08:05 AM" },
  ],
};

// ---------------------------------------------------------------------------
// Customer directory — used by the group-chat Customer selector (alias / name / phone)
// ---------------------------------------------------------------------------
export type DirectoryCustomer = { alias: string; name: string; phone: string };

export const customerDirectory: DirectoryCustomer[] = [
  { alias: "A7X3KP", name: "Amara Okafor", phone: "+234 803 111 2222" },
  { alias: "K9M2BL", name: "Tobi Bello", phone: "+234 805 444 7788" },
  { alias: "R4P8TN", name: "Segun Adeyemi", phone: "+234 809 222 3344" },
  { alias: "B5N1QW", name: "Nkechi Eze", phone: "+234 802 556 1177" },
  { alias: "H2L6YD", name: "Ifeanyi Nwosu", phone: "+234 807 661 2233" },
  { alias: "W8T4FJ", name: "Emeka Obi", phone: "+234 812 998 5566" },
  { alias: "D3F9RX", name: "Grace Johnson", phone: "+234 803 909 1212" },
];

// Additional WhatsApp groups requested for order/transfer handling in groups
whatsappGroups.push(
  {
    id: "g4",
    isGroup: true,
    groupName: "VIP Trading Group",
    channel: "whatsapp",
    lastMessage: "Amara: Ready to sell 5x iTunes $100",
    time: "6m",
    unread: 3,
    tab: "consulting",
    participants: [
      { id: "g4p1", waName: "Amara", phone: "+234 803 111 2222", alias: "A7X3KP" },
      { id: "g4p2", waName: "Segun", phone: "+234 809 222 3344", alias: "R4P8TN" },
      { id: "g4p3", waName: "Emeka Ent.", phone: "+234 812 998 5566", alias: "W8T4FJ" },
      { id: "g4p4", waName: "Zainab", phone: "+234 810 220 4411", alias: null },
      { id: "g4p5", waName: "Ifeanyi Cards", phone: "+234 807 661 2233", alias: "H2L6YD" },
    ],
  },
  {
    id: "g5",
    isGroup: true,
    groupName: "Card Sellers Group",
    channel: "whatsapp",
    lastMessage: "Tobi: Amazon $50 x3 available",
    time: "35m",
    unread: 1,
    tab: "consulting",
    participants: [
      { id: "g5p1", waName: "Tobi Bello", phone: "+234 805 444 7788", alias: "K9M2BL" },
      { id: "g5p2", waName: "Mama Nkechi", phone: "+234 802 556 1177", alias: "B5N1QW" },
      { id: "g5p3", waName: "Grace", phone: "+234 803 909 1212", alias: "D3F9RX" },
      { id: "g5p4", waName: "Kola", phone: "+234 814 665 3300", alias: null },
    ],
  },
);

groupMessages.g4 = [
  { id: 1, sender: "participant", participantId: "g4p1", text: "Ready to sell 5x iTunes $100 today", time: "10:02 AM" },
  { id: 2, sender: "agent", text: "Noted Amara — send the images here and I'll raise the order.", time: "10:03 AM" },
  { id: 3, sender: "participant", participantId: "g4p3", text: "I also have Razer Gold $200.", time: "10:07 AM" },
  { id: 4, sender: "participant", participantId: "g4p4", text: "What's the VIP rate right now?", time: "10:11 AM" },
];

groupMessages.g5 = [
  { id: 1, sender: "participant", participantId: "g5p1", text: "Amazon $50 x3 available", time: "09:20 AM" },
  { id: 2, sender: "participant", participantId: "g5p2", text: "Please pay my Opay account when done 🙏", time: "09:24 AM" },
  { id: 3, sender: "agent", text: "Sure — creating the order now.", time: "09:26 AM" },
  { id: 4, sender: "participant", participantId: "g5p3", text: "Steam codes coming after lunch.", time: "09:31 AM" },
];
