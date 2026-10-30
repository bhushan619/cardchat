import { canTransition, type AgentOrderStatus } from "@/lib/orderStateMachine";

export type SimulationOrder = {
  id: string;
  card: string;
  status: AgentOrderStatus;
};

export function createSimulationOrders(): SimulationOrder[] {
  return [
    { id: "SIM-001", card: "Amazon", status: "pending" },
    { id: "SIM-002", card: "Apple", status: "in_trade" },
    { id: "SIM-003", card: "Steam", status: "in_trade" },
  ];
}

// Only the selected order's state determines eligibility; siblings never block it.
export function transitionSimulationOrder(
  orders: SimulationOrder[],
  id: string,
  status: AgentOrderStatus,
): SimulationOrder[] {
  const selected = orders.find((order) => order.id === id);
  if (!selected || !canTransition(selected.status, status)) return orders;
  return orders.map((order) => order.id === id ? { ...order, status } : order);
}

export type SimulationState = { orders: SimulationOrder[]; activity: string[] };
const storageKey = (customer: string) => `cc_independent_order_simulation_${customer}`;

export function loadOrderSimulation(customer: string): SimulationState {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey(customer)) ?? "null");
    if (stored && typeof stored === "object" && "orders" in stored && "activity" in stored) {
      const { orders, activity } = stored;
      const seed = createSimulationOrders();
      if (Array.isArray(orders) && orders.length === seed.length && orders.every((order, index) =>
        order && order.id === seed[index]?.id && order.card === seed[index]?.card &&
        ["pending", "in_trade", "success", "order_cancelled"].includes(order.status)) &&
        Array.isArray(activity) && activity.every((entry) => typeof entry === "string")) {
        return { orders, activity };
      }
    }
  } catch { /* Reset invalid prototype state. */ }
  return { orders: createSimulationOrders(), activity: [] };
}

export function saveOrderSimulation(customer: string, state: SimulationState): void {
  sessionStorage.setItem(storageKey(customer), JSON.stringify(state));
}