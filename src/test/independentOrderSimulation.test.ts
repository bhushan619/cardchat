import { beforeEach, describe, expect, it } from "vitest";
import { createSimulationOrders, loadOrderSimulation, saveOrderSimulation, transitionSimulationOrder } from "@/lib/independentOrderSimulation";

beforeEach(() => sessionStorage.clear());

describe("independent order simulation", () => {
  it("completes SIM-003 without waiting for earlier pending or in-trade orders", () => {
    const orders = createSimulationOrders();
    const updated = transitionSimulationOrder(orders, "SIM-003", "success");
    expect(updated.map((order) => order.status)).toEqual(["pending", "in_trade", "success"]);
    expect(updated[0]).toBe(orders[0]);
    expect(updated[1]).toBe(orders[1]);
  });

  it("requires only the selected order to be in trade before completing it", () => {
    const orders = createSimulationOrders();
    expect(transitionSimulationOrder(orders, "SIM-001", "success")).toBe(orders);
    const started = transitionSimulationOrder(orders, "SIM-001", "in_trade");
    expect(transitionSimulationOrder(started, "SIM-001", "success")[0]?.status).toBe("success");
  });

  it("does not complete the same order twice", () => {
    const completed = transitionSimulationOrder(createSimulationOrders(), "SIM-003", "success");
    expect(transitionSimulationOrder(completed, "SIM-003", "success")).toBe(completed);
  });

  it("retains simulation state per customer without modifying the seed orders", () => {
    const state = { orders: transitionSimulationOrder(createSimulationOrders(), "SIM-003", "success"), activity: ["SIM-003 completed"] };
    saveOrderSimulation("DEMO01", state);
    expect(loadOrderSimulation("DEMO01")).toEqual(state);
    expect(loadOrderSimulation("DEMO02").orders[2]?.status).toBe("in_trade");
    expect(createSimulationOrders()[2]?.status).toBe("in_trade");
  });
});