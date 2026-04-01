// Order Status State Machine for CardChat

export type AgentOrderStatus =
  | "pending_sale"
  | "pending"
  | "in_trade"
  | "order_cancelled"
  | "success";

export type CustomerOrderStatus =
  | "order_created"
  | "order_processing"
  | "failed"
  | "success";

export type ConversationTab = "consulting" | "trading";

// Valid transitions
const validTransitions: Record<AgentOrderStatus, AgentOrderStatus[]> = {
  pending_sale: ["pending"],
  pending: ["in_trade"],
  in_trade: ["success", "order_cancelled"],
  order_cancelled: [],
  success: [],
};

export function canTransition(from: AgentOrderStatus, to: AgentOrderStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: AgentOrderStatus): AgentOrderStatus[] {
  return validTransitions[current] || [];
}

// Agent status → Customer-facing status
export function toCustomerStatus(status: AgentOrderStatus): CustomerOrderStatus {
  switch (status) {
    case "pending_sale":
    case "pending":
      return "order_created";
    case "in_trade":
    case "negotiation":
      return "order_processing";
    case "order_cancelled":
      return "failed";
    case "success":
      return "success";
  }
}

// Agent status → which tab the conversation belongs to
export function getTabForStatus(status: AgentOrderStatus | null): ConversationTab {
  if (!status) return "consulting";
  switch (status) {
    case "pending_sale":
    case "pending":
    case "order_cancelled":
    case "success":
      return "consulting";
    case "in_trade":
    case "negotiation":
      return "trading";
    default:
      return "consulting";
  }
}

// Display labels for agent-side statuses
export const agentStatusLabels: Record<AgentOrderStatus, string> = {
  pending_sale: "Pending Sale",
  pending: "Pending",
  in_trade: "In Trade",
  negotiation: "Negotiation",
  order_cancelled: "Order Cancelled",
  success: "Success",
};

// Display labels for customer-side statuses
export const customerStatusLabels: Record<CustomerOrderStatus, string> = {
  order_created: "Order Created",
  order_processing: "Order Processing",
  failed: "Failed",
  success: "Success",
};

// Status styling for UI
export const agentStatusStyles: Record<AgentOrderStatus, { color: string; bg: string }> = {
  pending_sale: { color: "text-warning", bg: "bg-warning/10" },
  pending: { color: "text-primary", bg: "bg-primary/10" },
  in_trade: { color: "text-accent", bg: "bg-accent/10" },
  negotiation: { color: "text-warning", bg: "bg-warning/10" },
  order_cancelled: { color: "text-destructive", bg: "bg-destructive/10" },
  success: { color: "text-success", bg: "bg-success/10" },
};
