import { describe, expect, it } from "vitest";
import { formatDateTime, formatDateAndTime, parseDateTime } from "@/lib/dateTime";
describe("system dates", () => {
  it("uses dd-MMM-yyyy HH:mm with English months and 24-hour time", () => {
    expect(formatDateTime(new Date(2026, 10, 2, 21, 23))).toBe("02-Nov-2026 21:23");
    expect(formatDateTime(0)).not.toBe("—");
  });
  it("converts legacy ledger dates without losing time", () => {
    expect(formatDateTime("18/03/2026 · 02:30 PM")).toBe("18-Mar-2026 14:30");
    expect(formatDateAndTime("18/03/2026", "02:30 PM")).toBe("18-Mar-2026 14:30");
    expect(formatDateAndTime("18-Mar-2026 14:30", "02:30 PM")).toBe("18-Mar-2026 14:30");
  });
  it("resolves relative prototype times to stable absolute dates", () => {
    expect(parseDateTime("2m ago", new Date(2026, 10, 2, 9, 23))).toEqual(new Date(2026, 10, 2, 9, 21));
  });
  it("does not invent a date for an invalid or missing timestamp", () => {
    expect(formatDateTime("invalid")).toBe("—");
    expect(formatDateTime(null)).toBe("—");
  });
});