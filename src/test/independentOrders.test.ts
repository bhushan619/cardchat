import { beforeEach, describe, expect, it } from "vitest";
import { canCompleteOrder, loadProcessingState, resolveProcessingEntry, saveProcessingState, updateProcessingOrder, workflowOrders } from "@/lib/independentOrders";

beforeEach(() => sessionStorage.clear());
describe("per-order processing in the order list", () => {
  it("completes a ready order while an earlier order of the same customer stays in trade", () => {
    const state = { earlier: { status: "in_trade" as const, buyerComplete: false }, later: { status: "in_trade" as const, buyerComplete: true } };
    const next = updateProcessingOrder(state, "later", state.later, "complete");
    expect(next.later.status).toBe("success");
    expect(next.earlier).toBe(state.earlier);
  });
  it("does not allow completing an order before its own buyer result is complete", () => {
    const entry = { status: "in_trade" as const, buyerComplete: false };
    expect(canCompleteOrder(entry)).toBe(false);
    const ready = updateProcessingOrder({}, "a", entry, "buyer_complete");
    expect(canCompleteOrder(ready.a)).toBe(true);
    expect(updateProcessingOrder({}, "a", entry, "complete")).toEqual({});
  });
  it("does not complete a finished order twice", () => {
    const entry = { status: "success" as const, buyerComplete: true };
    const state = { a: entry };
    expect(updateProcessingOrder(state, "a", entry, "complete")).toBe(state);
  });
  it("persists only order states and leaves payment and wallet state untouched", () => {
    sessionStorage.setItem("cardchat_transfer_completed", '["old-order"]');
    sessionStorage.setItem("wallet", "1234");
    saveProcessingState({ a: { status: "success", buyerComplete: true } });
    expect(loadProcessingState().a.status).toBe("success");
    expect(sessionStorage.getItem("cardchat_transfer_completed")).toBe('["old-order"]');
    expect(sessionStorage.getItem("wallet")).toBe("1234");
  });
  it("seeds a ready and unfinished order together for each demo customer", () => {
    const sameCustomer = workflowOrders.filter((o) => o.customer === "K9M2BL");
    expect(sameCustomer.map((o) => o.id)).toContain("ORD-DEMO-2-01");
    expect(sameCustomer.map((o) => o.id)).toContain("ORD-DEMO-2-02");
    expect(resolveProcessingEntry("ORD-DEMO-2-01", "in_trade", {}, false).buyerComplete).toBe(false);
    expect(resolveProcessingEntry("ORD-DEMO-2-02", "in_trade", {}, true).buyerComplete).toBe(true);
  });
});