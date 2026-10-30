import { useEffect, useState } from "react";
import { loadProcessingState, ORDER_PROCESSING_EVENT, resolveProcessingEntry, saveProcessingState, updateProcessingOrder } from "@/lib/independentOrders";

export function useIndependentOrders() {
  const [state, setState] = useState(loadProcessingState);
  useEffect(() => {
    const refresh = () => setState(loadProcessingState());
    window.addEventListener(ORDER_PROCESSING_EVENT, refresh);
    return () => window.removeEventListener(ORDER_PROCESSING_EVENT, refresh);
  }, []);
  function update(id: string, status: string, buyerComplete: boolean, action: "start" | "buyer_complete" | "complete") {
    const latest = loadProcessingState();
    const next = updateProcessingOrder(latest, id, resolveProcessingEntry(id, status, latest, buyerComplete), action);
    if (next === latest) return false;
    saveProcessingState(next);
    setState(next);
    return true;
  }
  return { state, update };
}