import { beforeEach, describe, expect, it } from "vitest";
import { acknowledgeOrders, loadOrderAcknowledgements, ORDER_ATTENTION_KEY, pendingOrderAttention, type AttentionOrder } from "@/lib/orderAttention";

const orders: AttentionOrder[] = [
  { id: "a", customer: "A7X3KP", status: "in_trade", buyerComplete: false },
  { id: "b", customer: "K9M2BL", status: "success", buyerComplete: true },
  { id: "c", customer: "K9M2BL", status: "in_trade", buyerComplete: true },
];
beforeEach(() => sessionStorage.clear());
describe("successful order conversation attention", () => {
  it("alerts another customer's successful order while unfinished orders stay unchanged", () => {
    expect(pendingOrderAttention(orders, {}).map((order) => order.id)).toEqual(["b", "c"]);
    expect(orders[0].status).toBe("in_trade");
  });
  it("keeps alerts pending across reads until explicitly acknowledged", () => {
    expect(pendingOrderAttention(orders, {}).length).toBe(2);
    expect(pendingOrderAttention(orders, {}).length).toBe(2);
    const acknowledged = acknowledgeOrders({}, [orders[1]]);
    expect(pendingOrderAttention(orders, acknowledged).map((order) => order.id)).toEqual(["c"]);
  });
  it("acknowledges only the acted-on order, not siblings or other customers", () => {
    const other = { id: "d", customer: "A7X3KP", status: "success" as const, buyerComplete: true };
    const acknowledged = acknowledgeOrders({}, [orders[1]]);
    expect(pendingOrderAttention([...orders, other], acknowledged).map((order) => order.id)).toEqual(["c", "d"]);
  });
  it("alerts again when an acknowledged buyer result becomes a successful order", () => {
    const acknowledged = acknowledgeOrders({}, [orders[2]]);
    expect(pendingOrderAttention([orders[2]], acknowledged)).toEqual([]);
    expect(pendingOrderAttention([{ ...orders[2], status: "success" }], acknowledged).map((order) => order.id)).toEqual(["c"]);
  });
  it("retains acknowledgements through session reload", () => {
    sessionStorage.setItem(ORDER_ATTENTION_KEY, JSON.stringify(acknowledgeOrders({}, [orders[1]])));
    expect(pendingOrderAttention(orders, loadOrderAcknowledgements()).map((order) => order.id)).toEqual(["c"]);
  });
});