import { formatDateTime, parseDateTime } from "@/lib/dateTime";

export type CustomerDateFilters = {
  lastActiveFrom?: Date; lastActiveTo?: Date; joinedFrom?: Date; joinedTo?: Date;
};

export function customerMatchesDates(customer: { lastActive: string; joinedDate: string }, filters: CustomerDateFilters): boolean {
  const matches = (value: string, from?: Date, to?: Date) => {
    if (!from && !to) return true;
    const date = parseDateTime(value);
    return !!date && (!from || date >= from) && (!to || date <= to);
  };
  return matches(customer.lastActive, filters.lastActiveFrom, filters.lastActiveTo) && matches(customer.joinedDate, filters.joinedFrom, filters.joinedTo);
}

export function customersCsv(customers: { alias: string; status: string; channel: string; goodRate: number; totalOrders: number; totalValue: string | number; walletBalance: number; lastActive: string; joinedDate: string }[], vipAliases: string[]): string {
  const headers = ["Alias", "VIP", "Status", "Channel", "Good Rate (%)", "Total Orders", "Total Points", "Points Account", "Last Active", "Joined"];
  const rows = customers.map(c => [c.alias, vipAliases.includes(c.alias) ? "Yes" : "No", c.status, c.channel, c.goodRate, c.totalOrders, String(c.totalValue).replace(/[^\d.]/g, ""), c.walletBalance, formatDateTime(c.lastActive), formatDateTime(c.joinedDate)]);
  return [headers, ...rows].map(row => row.map(value => {
    const text = String(value);
    return `"${(/^[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
  }).join(",")).join("\r\n");
}