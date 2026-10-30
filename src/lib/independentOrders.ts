import { orders as mockOrders } from "@/data/mock";
import { canTransition, type AgentOrderStatus } from "@/lib/orderStateMachine";

export type ProcessingEntry = { status: AgentOrderStatus; buyerComplete: boolean };
export type ProcessingState = Record<string, ProcessingEntry>;
export const ORDER_PROCESSING_KEY = "cc_independent_order_processing";
export const ORDER_PROCESSING_EVENT = "independent-orders-updated";

// Extra prototype orders belong to existing customers and appear in both order views.
export const workflowOrders = [
  ...mockOrders,
  ...["A7X3KP", "K9M2BL"].flatMap((customer, index) => [
    { id: `ORD-DEMO-${index + 1}-01`, customer, cardType: "Steam US", amount: 100, nairaRate: 289, unitPrice: 600, status: "in_trade" as const, source: index === 0 ? "in-app" as const : "whatsapp" as const, transferStatus: "not_transferred" as const, created: "30/10/2026 · 01:50 PM", buyerComplete: false },
    { id: `ORD-DEMO-${index + 1}-02`, customer, cardType: "Amazon US", amount: 50, nairaRate: 289, unitPrice: 620, status: "in_trade" as const, source: index === 0 ? "in-app" as const : "whatsapp" as const, transferStatus: "not_transferred" as const, created: "30/10/2026 · 01:55 PM", buyerComplete: true },
  ]),
];

export function loadProcessingState(): ProcessingState {
  try { return JSON.parse(sessionStorage.getItem(ORDER_PROCESSING_KEY) ?? "{}"); }
  catch { return {}; }
}

export function saveProcessingState(state: ProcessingState) {
  sessionStorage.setItem(ORDER_PROCESSING_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(ORDER_PROCESSING_EVENT));
}

export function resolveProcessingEntry(id: string, status: string, state: ProcessingState, buyerComplete = false): ProcessingEntry {
  const normalized: AgentOrderStatus = status === "processing" ? "pending_sale" : status === "completed" ? "success" : status === "failed" ? "order_cancelled" : status as AgentOrderStatus;
  return state[id] ?? { status: normalized, buyerComplete: buyerComplete || normalized === "success" };
}

export function pickReadyPopupOrder<T extends ProcessingEntry>(orders: (T & { id: string })[]): (T & { id: string }) | null {
  return orders.find(canCompleteOrder) ?? null;
}

export function canCompleteOrder(entry: ProcessingEntry): boolean {
  return entry.status === "in_trade" && entry.buyerComplete;
}

export function summarizeOrders(entries: ProcessingEntry[]) {
  return {
    active: entries.filter((entry) => entry.status !== "success" && entry.status !== "order_cancelled").length,
    ready: entries.filter(canCompleteOrder).length,
    completed: entries.filter((entry) => entry.status === "success").length,
    cancelled: entries.filter((entry) => entry.status === "order_cancelled").length,
  };
}

export function orderSection(status: AgentOrderStatus): "Active" | "Completed" | "Cancelled" {
  return status === "success" ? "Completed" : status === "order_cancelled" ? "Cancelled" : "Active";
}

export function groupProcessingOrders<T extends ProcessingEntry>(entries: T[]): T[] {
  const priority = { Active: 0, Completed: 1, Cancelled: 2 };
  return [...entries].sort((a, b) => priority[orderSection(a.status)] - priority[orderSection(b.status)]);
}

export function updateProcessingOrder(state: ProcessingState, id: string, current: ProcessingEntry, action: "start" | "buyer_complete" | "complete"): ProcessingState {
  const entry = state[id] ?? current;
  if (action === "complete") {
    if (!canCompleteOrder(entry)) return state;
    return { ...state, [id]: { ...entry, status: "success" } };
  }
  if (action === "buyer_complete") {
    if (entry.status !== "in_trade" || entry.buyerComplete) return state;
    return { ...state, [id]: { ...entry, buyerComplete: true } };
  }
  const status = entry.status === "pending_sale" ? "pending" : "in_trade";
  if (!canTransition(entry.status, status)) return state;
  return { ...state, [id]: { ...entry, status } };
}