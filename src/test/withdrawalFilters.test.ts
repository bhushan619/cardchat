import { describe, expect, it } from "vitest";
import { emptyWithdrawalFilters, withdrawalMatchesFilters } from "@/lib/withdrawalFilters";

const record = {
  id: "202603100100", alias: "A7X3KP", orderId: "ORD-20260318-001",
  status: "pending", channel: "palmpay1", bankName: "First Bank",
  accountNumber: "****1000", reference: "REF0", requestedAt: "10/03/2026 · 08:00 AM", amount: 3000,
};

describe("withdrawal filters matching Transfers", () => {
  it("cleared filters restore every record", () => {
    expect(withdrawalMatchesFilters(record, emptyWithdrawalFilters)).toBe(true);
  });

  for (const [field, match, miss] of [
    ["id", "0100", "9999"], ["alias", "a7x", "other"],
    ["order", "0318-001", "0318-002"], ["reference", "ref0", "ref9"],
    ["account", "10 00", "2000"], ["status", "pending", "successful"],
    ["channel", "palmpay1", "palmpay2"], ["bank", "First Bank", "Opay"],
  ] as const) {
    it(`matches the ${field} filter and rejects unrelated records`, () => {
      expect(withdrawalMatchesFilters(record, { ...emptyWithdrawalFilters, [field]: match })).toBe(true);
      expect(withdrawalMatchesFilters(record, { ...emptyWithdrawalFilters, [field]: miss })).toBe(false);
    });
  }

  it("combines inclusive amount limits", () => {
    expect(withdrawalMatchesFilters(record, { ...emptyWithdrawalFilters, min: "3000", max: "3000" })).toBe(true);
    expect(withdrawalMatchesFilters(record, { ...emptyWithdrawalFilters, min: "3001" })).toBe(false);
    expect(withdrawalMatchesFilters(record, { ...emptyWithdrawalFilters, max: "2999" })).toBe(false);
  });

  it("combines the requested date range with account matching", () => {
    const filters = { ...emptyWithdrawalFilters, account: "1000", from: "2026-03-10T08:00", to: "2026-03-10T08:00" };
    expect(withdrawalMatchesFilters(record, filters)).toBe(true);
    expect(withdrawalMatchesFilters(record, { ...filters, from: "2026-03-10T08:01" })).toBe(false);
    expect(withdrawalMatchesFilters(record, { ...filters, account: "2000" })).toBe(false);
  });
});