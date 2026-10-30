import type { ProcessingEntry } from "@/lib/independentOrders";

export type AttentionOrder = ProcessingEntry & { id: string; customer: string };
export type OrderAcknowledgements = Record<string, string>;
export const ORDER_ATTENTION_KEY = "cc_order_attention_acknowledged";

export function attentionSignature(order: ProcessingEntry): string | undefined {
  if (order.status === "success") return "success";
  if (order.status === "in_trade" && order.buyerComplete) return "buyer_successful";
  return undefined;
}

export function pendingOrderAttention(orders: AttentionOrder[], acknowledged: OrderAcknowledgements): AttentionOrder[] {
  return orders.filter((order) => {
    const signature = attentionSignature(order);
    return signature !== undefined && acknowledged[order.id] !== signature;
  });
}

export function acknowledgeOrders(acknowledged: OrderAcknowledgements, orders: AttentionOrder[]): OrderAcknowledgements {
  const next = { ...acknowledged };
  for (const order of orders) {
    const signature = attentionSignature(order);
    if (signature) next[order.id] = signature;
  }
  return next;
}

export function loadOrderAcknowledgements(): OrderAcknowledgements {
  try { return JSON.parse(sessionStorage.getItem(ORDER_ATTENTION_KEY) ?? "{}"); }
  catch { return {}; }
}