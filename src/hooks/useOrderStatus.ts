import { useState, useCallback, useEffect } from "react";
import {
  AgentOrderStatus,
  canTransition,
  getTabForStatus,
  agentStatusLabels,
  type ConversationTab,
} from "@/lib/orderStateMachine";

const STORAGE_KEY = "cardchat_order_statuses";

export interface OrderStatusEntry {
  conversationId: string;
  orderId: string;
  status: AgentOrderStatus;
  updatedAt: string;
}

function loadFromStorage(): Record<string, OrderStatusEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data: Record<string, OrderStatusEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useOrderStatus() {
  const [entries, setEntries] = useState<Record<string, OrderStatusEntry>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(entries);
  }, [entries]);

  const getStatus = useCallback(
    (conversationId: string): AgentOrderStatus | null => {
      return entries[conversationId]?.status ?? null;
    },
    [entries]
  );

  const getOrderId = useCallback(
    (conversationId: string): string | null => {
      return entries[conversationId]?.orderId ?? null;
    },
    [entries]
  );

  const createOrder = useCallback(
    (conversationId: string, orderId: string): string | null => {
      const entry: OrderStatusEntry = {
        conversationId,
        orderId,
        status: "pending_sale",
        updatedAt: new Date().toISOString(),
      };
      setEntries((prev) => ({ ...prev, [conversationId]: entry }));
      return `📌 Order #${orderId} created. Status: ${agentStatusLabels.pending_sale}`;
    },
    []
  );

  const transitionStatus = useCallback(
    (conversationId: string, newStatus: AgentOrderStatus): string | null => {
      let result: string | null = null;
      setEntries((prev) => {
        const current = prev[conversationId];
        if (!current) return prev;
        if (!canTransition(current.status, newStatus)) return prev;

        result = `📌 Order #${current.orderId} status changed to ${agentStatusLabels[newStatus]}.`;
        return {
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            status: newStatus,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      return result;
    },
    []
  );

  const getConversationTab = useCallback(
    (conversationId: string): ConversationTab => {
      const status = entries[conversationId]?.status ?? null;
      return getTabForStatus(status);
    },
    [entries]
  );

  const resetAll = useCallback(() => {
    setEntries({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    entries,
    getStatus,
    getOrderId,
    createOrder,
    transitionStatus,
    getConversationTab,
    resetAll,
  };
}
