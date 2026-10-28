import { describe, expect, it } from "vitest";
import { accountNumberMatches, parseLedgerDate, withinDateRange } from "@/lib/utils";

// Bank account number filter used on /admin/withdrawals and /admin/transfers.
// Stored account numbers are masked (e.g. "****1000"), so matching is on digits only.
describe("accountNumberMatches", () => {
  it("matches the exact account number", () => {
    expect(accountNumberMatches("1000", "****1000")).toBe(true);
  });

  it("matches a partial account number", () => {
    expect(accountNumberMatches("137", "****1137")).toBe(true);
    expect(accountNumberMatches("11", "****2211")).toBe(true);
  });

  it("ignores spaces and dashes typed by the user", () => {
    expect(accountNumberMatches("10 00", "****1000")).toBe(true);
    expect(accountNumberMatches("0807-0001-0001", "080700010001")).toBe(true);
  });

  it("ignores masking characters typed into the filter", () => {
    expect(accountNumberMatches("****1000", "****1000")).toBe(true);
  });

  it("treats an empty or symbol-only filter as no filter", () => {
    expect(accountNumberMatches("", "****1000")).toBe(true);
    expect(accountNumberMatches("   ", "****1000")).toBe(true);
    expect(accountNumberMatches("---", "****1000")).toBe(true);
  });

  it("rejects an account number that is not present", () => {
    expect(accountNumberMatches("000099997777", "****1000")).toBe(false);
    expect(accountNumberMatches("1001", "****1000")).toBe(false);
  });

  it("does not throw on missing stored values", () => {
    expect(accountNumberMatches("1000", null)).toBe(false);
    expect(accountNumberMatches("", undefined)).toBe(true);
  });
});

// Date-range filter on /admin/transfers. Ledger timestamps use "dd/mm/yyyy · hh:mm AM/PM".
describe("parseLedgerDate", () => {
  it("parses a morning timestamp", () => {
    const d = parseLedgerDate("11/03/2026 · 09:22 AM");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(2);
    expect(d?.getDate()).toBe(11);
    expect(d?.getHours()).toBe(9);
    expect(d?.getMinutes()).toBe(22);
  });

  it("converts PM times to 24h", () => {
    expect(parseLedgerDate("12/03/2026 · 01:05 PM")?.getHours()).toBe(13);
    expect(parseLedgerDate("12/03/2026 · 12:00 PM")?.getHours()).toBe(12);
    expect(parseLedgerDate("12/03/2026 · 12:00 AM")?.getHours()).toBe(0);
  });

  it("returns null for unexpected formats", () => {
    expect(parseLedgerDate("2026-03-11")).toBeNull();
    expect(parseLedgerDate("")).toBeNull();
    expect(parseLedgerDate(null)).toBeNull();
  });
});

describe("withinDateRange", () => {
  const stamp = "11/03/2026 · 09:22 AM";

  it("matches everything when no bounds are set", () => {
    expect(withinDateRange(stamp, "", "")).toBe(true);
  });

  it("keeps timestamps inside the range", () => {
    expect(withinDateRange(stamp, "2026-03-11T00:00", "2026-03-11T23:59")).toBe(true);
  });

  it("drops timestamps before the from bound", () => {
    expect(withinDateRange(stamp, "2026-03-11T10:00", "")).toBe(false);
  });

  it("drops timestamps after the to bound", () => {
    expect(withinDateRange(stamp, "", "2026-03-11T09:00")).toBe(false);
  });

  it("keeps unparseable timestamps so records never vanish", () => {
    expect(withinDateRange("not a date", "2026-03-11T00:00", "")).toBe(true);
  });
});
