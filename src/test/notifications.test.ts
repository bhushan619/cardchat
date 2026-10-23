import { beforeEach, describe, expect, it } from "vitest";
import { campaignRuleError, conversionRate, loadNotifications, notificationStatus, scheduleUtc } from "@/lib/notifications";
import { markNotificationRead, saveNotificationPreference, visibleCampaigns } from "@/lib/customerNotifications";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
describe("notification campaign rules", () => {
  it("interprets scheduled times as UTC+4 rather than browser time", () => {
    expect(new Date(scheduleUtc("2026-10-23T12:30")).toISOString()).toBe("2026-10-23T08:30:00.000Z");
  });
  it("never treats a draft as sent", () => {
    expect(notificationStatus({ ...loadNotifications()[0], lifecycle: "draft", sendType: "immediate" })).toBe("draft");
  });
  it("keeps activated automatic campaigns separate from delivered campaigns", () => {
    expect(notificationStatus({ ...loadNotifications()[0], lifecycle: "active" })).toBe("active");
  });
  it("rejects a manual trigger for an automatic campaign", () => {
    expect(campaignRuleError({ ...loadNotifications()[0], trigger: "manual" })).toBe("Select an automatic trigger scenario");
  });
  it("rejects inverted day ranges", () => {
    expect(campaignRuleError({ ...loadNotifications()[0], minDays: 54, maxDays: 9 })).toBe("Days must be non-negative integers with maximum ≥ minimum");
  });
  it("calculates conversion rate against delivered notifications", () => {
    expect(conversionRate({ ...loadNotifications()[0], deliveredCount: 100, conversionCount: 12 })).toBe("12.00");
    expect(conversionRate({ ...loadNotifications()[0], deliveredCount: 0, conversionCount: 12 })).toBe("0.00");
  });
  it("marks only the opened notification read without duplicates", () => {
    expect(markNotificationRead(["n1"], "n2")).toEqual(["n1", "n2"]);
    expect(markNotificationRead(["n1"], "n1")).toEqual(["n1"]);
  });
  it("hides promotional campaigns without hiding order notifications", () => {
    const campaign = { ...loadNotifications()[0], audience: "everyone" as const, sendType: "immediate" as const };
    const order = { ...campaign, id: "order", trigger: "order_failed" as const };
    expect(visibleCampaigns([campaign, order], false, "J4D9KP", []).map(n => n.id)).toEqual(["order"]);
  });
  it("matches tag audiences rather than interpreting aliases as tags", () => {
    const campaign = { ...loadNotifications()[0], sendType: "immediate" as const, audienceMode: "tags" as const, tagIds: ["vip"] };
    expect(visibleCampaigns([campaign], true, "J4D9KP", ["vip"])).toHaveLength(1);
    expect(visibleCampaigns([campaign], true, "J4D9KP", [])).toHaveLength(0);
  });
  it("saves order notification preferences independently from promotions", () => {
    saveNotificationPreference("Order Updates", false);
    const order = { ...loadNotifications()[0], audience: "everyone" as const, sendType: "immediate" as const, trigger: "order_failed" as const };
    expect(visibleCampaigns([order], true, "J4D9KP", [])).toHaveLength(0);
  });
});