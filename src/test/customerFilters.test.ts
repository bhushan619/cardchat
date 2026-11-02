import { describe, expect, it } from "vitest";
import { customerMatchesDates, customersCsv } from "@/lib/customerFilters";
const customer = { alias: "A7X3KP", status: "trading", channel: "trtc", goodRate: 98, totalOrders: 3, totalValue: "1,000", walletBalance: 500, lastActive: "2026-11-02T09:23:00", joinedDate: "2026-03-18T10:30:00" };
describe("customer date filters", () => {
  it("filters Last Active with inclusive from and to dates", () => {
    expect(customerMatchesDates(customer, { lastActiveFrom: new Date("2026-11-02T09:23"), lastActiveTo: new Date("2026-11-02T09:23") })).toBe(true);
    expect(customerMatchesDates(customer, { lastActiveFrom: new Date("2026-11-03") })).toBe(false);
    expect(customerMatchesDates(customer, { lastActiveTo: new Date("2026-11-01") })).toBe(false);
  });
  it("filters Joined with inclusive from and to dates independently", () => {
    expect(customerMatchesDates(customer, { joinedFrom: new Date("2026-03-18T10:30"), joinedTo: new Date("2026-03-18T10:30") })).toBe(true);
    expect(customerMatchesDates(customer, { joinedFrom: new Date("2026-03-19") })).toBe(false);
    expect(customerMatchesDates(customer, { joinedTo: new Date("2026-03-17") })).toBe(false);
  });
  it("requires both ranges to match and allows empty filters", () => {
    expect(customerMatchesDates(customer, {})).toBe(true);
    expect(customerMatchesDates(customer, { lastActiveFrom: new Date("2026-11-01"), joinedTo: new Date("2026-03-17") })).toBe(false);
  });
  it("exports only supplied filtered customers with absolute dates", () => {
    const csv = customersCsv([customer], []);
    expect(csv.split("\r\n")).toHaveLength(2);
    expect(csv).toContain('"02-Nov-2026 09:23","18-Mar-2026 10:30"');
    expect(customersCsv([], []).split("\r\n")).toHaveLength(1);
  });
});