// Mock data for Cardchat interactive prototypes

export const cardRates = [
  { id: 1, cardType: "iTunes US", currency: "USD", cardFormat: "Physical" as const, buyRate: 680, sellRate: 720, lastUpdated: "2 min ago" },
  { id: 2, cardType: "iTunes US", currency: "USD", cardFormat: "E-Code" as const, buyRate: 700, sellRate: 740, lastUpdated: "2 min ago" },
  { id: 3, cardType: "Amazon US", currency: "USD", cardFormat: "Physical" as const, buyRate: 620, sellRate: 660, lastUpdated: "2 min ago" },
  { id: 4, cardType: "Amazon US", currency: "USD", cardFormat: "E-Code" as const, buyRate: 640, sellRate: 680, lastUpdated: "2 min ago" },
  { id: 5, cardType: "Steam US", currency: "USD", cardFormat: "Physical" as const, buyRate: 600, sellRate: 640, lastUpdated: "3 min ago" },
  { id: 6, cardType: "Steam US", currency: "USD", cardFormat: "E-Code" as const, buyRate: 620, sellRate: 660, lastUpdated: "3 min ago" },
  { id: 7, cardType: "Google Play US", currency: "USD", cardFormat: "Physical" as const, buyRate: 590, sellRate: 630, lastUpdated: "2 min ago" },
  { id: 8, cardType: "iTunes UK", currency: "GBP", cardFormat: "Physical" as const, buyRate: 850, sellRate: 900, lastUpdated: "5 min ago" },
  { id: 9, cardType: "Amazon UK", currency: "GBP", cardFormat: "Physical" as const, buyRate: 780, sellRate: 830, lastUpdated: "3 min ago" },
  { id: 10, cardType: "Vanilla Visa", currency: "USD", cardFormat: "Physical" as const, buyRate: 550, sellRate: 590, lastUpdated: "1 min ago" },
  { id: 11, cardType: "eBay US", currency: "USD", cardFormat: "E-Code" as const, buyRate: 570, sellRate: 610, lastUpdated: "4 min ago" },
];

export const systemNairaRate = 289;
export const systemDenomination = 100;
export const systemPriceControl = 85.00; // percentage 1.00% - 100.00%

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

export const conversations = [
  { id: "c1", alias: "A7X3KP", lastMessage: "I have iTunes $100 cards to sell", time: "2m", unread: 2, status: "consulting" as const, goodRate: 85, totalValue: "₦450,000", tags: ["VIP", "Repeat"] },
  { id: "c2", alias: "K9M2BL", lastMessage: "Card images sent", time: "5m", unread: 0, status: "trading" as const, goodRate: 72, totalValue: "₦120,000", tags: ["New"] },
  { id: "c3", alias: "R4P8TN", lastMessage: "When will I receive payment?", time: "8m", unread: 1, status: "trading" as const, goodRate: 90, totalValue: "₦2,100,000", tags: ["VIP"] },
  { id: "c4", alias: "B5N1QW", lastMessage: "Thanks for the quick transfer!", time: "15m", unread: 0, status: "consulting" as const, goodRate: 65, totalValue: "₦80,000", tags: [] },
  { id: "c5", alias: "H2L6YD", lastMessage: "Sending Amazon $50 card now", time: "20m", unread: 0, status: "trading" as const, goodRate: 78, totalValue: "₦340,000", tags: ["Repeat"] },
  { id: "c6", alias: "W8T4FJ", lastMessage: "Please check my bank details", time: "25m", unread: 3, status: "consulting" as const, goodRate: 88, totalValue: "₦1,500,000", tags: ["VIP", "Priority"] },
  { id: "c7", alias: "D3F9RX", lastMessage: "I want to sell Steam cards", time: "30m", unread: 0, status: "consulting" as const, goodRate: 60, totalValue: "₦45,000", tags: [] },
];

export const chatMessages = [
  { id: 1, sender: "customer", text: "Hi, I have 2x iTunes $100 cards to sell", time: "10:32 AM" },
  { id: 2, sender: "agent", text: "Hello! Sure, please send clear images of both cards (front and back)", time: "10:33 AM" },
  { id: 3, sender: "customer", text: "", time: "10:35 AM", image: true },
  { id: 4, sender: "agent", text: "Cards received. Let me verify them now.", time: "10:36 AM" },
  { id: 5, sender: "system", text: "Order #ORD-20260318-001 created. Card: iTunes US $100 ×2.", time: "10:37 AM", isOrder: true },
  { id: 6, sender: "agent", text: "Cards verified ✅ Order created. Processing your billing now.", time: "10:38 AM" },
];

export const orders = [
  { id: "ORD-20260318-001", customer: "A7X3KP", cardType: "iTunes US", amount: 200, nairaRate: 289, unitPrice: 680, status: "success" as const, created: "10:37 AM" },
  { id: "ORD-20260318-002", customer: "K9M2BL", cardType: "Amazon US", amount: 150, nairaRate: 289, unitPrice: 620, status: "in_trade" as const, created: "09:15 AM" },
  { id: "ORD-20260318-003", customer: "R4P8TN", cardType: "Steam US", amount: 200, nairaRate: 289, unitPrice: 600, status: "order_cancelled" as const, created: "08:45 AM" },
];

export const bankAccounts = [
  { id: 1, bankName: "First Bank", accountNumber: "****1234", holderName: "JOHN A. DOE", verified: true },
  { id: 2, bankName: "GTBank", accountNumber: "****5678", holderName: "JOHN ADEBAYO", verified: true },
  { id: 3, bankName: "Access Bank", accountNumber: "****9012", holderName: "J.A. DOE", verified: true },
];

export const transactions = [
  { id: "TXN-001", orderId: "ORD-20260318-001", amount: "₦215,200", status: "success" as const, date: "Mar 18, 2026", bank: "First Bank ****1234" },
  { id: "TXN-002", orderId: "ORD-20260317-005", amount: "₦93,000", status: "success" as const, date: "Mar 17, 2026", bank: "GTBank ****5678" },
  { id: "TXN-003", orderId: "ORD-20260316-003", amount: "₦186,000", status: "failed" as const, date: "Mar 16, 2026", bank: "Access Bank ****9012" },
  { id: "TXN-004", orderId: "ORD-20260315-008", amount: "₦62,000", status: "success" as const, date: "Mar 15, 2026", bank: "First Bank ****1234" },
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
  { timestamp: "Mar 18, 10:00 AM", oldRate: 270, newRate: 289, changedBy: "Admin One", reason: "Market adjustment" },
  { timestamp: "Mar 17, 02:30 PM", oldRate: 255, newRate: 270, changedBy: "Admin One", reason: "Daily update" },
  { timestamp: "Mar 16, 09:00 AM", oldRate: 240, newRate: 255, changedBy: "Admin One", reason: "Weekly review" },
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
];

// Wallet data
export const walletBalance = 556200;

export const walletTransactions = [
  { id: "WT-001", type: "credit" as const, amount: 215200, description: "Order #ORD-20260318-001 — iTunes US", date: "Mar 18, 2026", time: "10:42 AM" },
  { id: "WT-002", type: "withdrawal" as const, amount: 150000, description: "Withdrawal to First Bank ****1234", date: "Mar 18, 2026", time: "11:15 AM" },
  { id: "WT-003", type: "credit" as const, amount: 93000, description: "Order #ORD-20260317-005 — Amazon US", date: "Mar 17, 2026", time: "03:20 PM" },
  { id: "WT-004", type: "withdrawal" as const, amount: 80000, description: "Withdrawal to GTBank ****5678", date: "Mar 17, 2026", time: "04:00 PM" },
  { id: "WT-005", type: "credit" as const, amount: 62000, description: "Order #ORD-20260315-008 — iTunes UK", date: "Mar 15, 2026", time: "02:10 PM" },
  { id: "WT-006", type: "credit" as const, amount: 186000, description: "Order #ORD-20260316-003 — Steam US", date: "Mar 16, 2026", time: "09:30 AM" },
  { id: "WT-007", type: "withdrawal" as const, amount: 50000, description: "Withdrawal to Access Bank ****9012", date: "Mar 15, 2026", time: "05:45 PM" },
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
