import { describe, expect, it } from "vitest";
import { accountNumberMatches } from "@/lib/utils";

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
