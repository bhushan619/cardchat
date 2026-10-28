import { accountNumberMatches, withinDateRange } from "@/lib/utils";

export type WithdrawalFilters = {
  id: string; alias: string; order: string;
  status: string; channel: string; bank: string;
  account: string; reference: string;
  min: string; max: string; from: string; to: string;
};

export const emptyWithdrawalFilters: WithdrawalFilters = {
  id: "", alias: "", order: "",
  status: "all", channel: "all", bank: "all",
  account: "", reference: "", min: "", max: "", from: "", to: "",
};

type FilterableWithdrawal = {
  id: string; alias: string; orderId: string;
  status: string; channel: string; bankName: string;
  accountNumber: string; reference: string; requestedAt: string; amount: number;
};

export function withdrawalMatchesFilters(w: FilterableWithdrawal, filters: WithdrawalFilters): boolean {
  const matches = (value: string, query: string) => value.toLowerCase().includes(query.trim().toLowerCase());
  return (filters.status === "all" || w.status === filters.status) &&
    (filters.channel === "all" || w.channel === filters.channel) &&
    (filters.bank === "all" || w.bankName === filters.bank) &&
    matches(w.id, filters.id) && matches(w.alias, filters.alias) &&
    matches(w.orderId, filters.order) && matches(w.reference, filters.reference) &&
    accountNumberMatches(filters.account, w.accountNumber) &&
    withinDateRange(w.requestedAt, filters.from, filters.to) &&
    w.amount >= (filters.min === "" ? -Infinity : Number(filters.min)) &&
    w.amount <= (filters.max === "" ? Infinity : Number(filters.max));
}