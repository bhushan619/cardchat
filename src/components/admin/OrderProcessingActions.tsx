import { CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canCompleteOrder, type ProcessingEntry } from "@/lib/independentOrders";

export default function OrderProcessingActions({ entry, onAction }: { entry: ProcessingEntry; onAction: (action: "start" | "buyer_complete" | "complete") => void }) {
  if (entry.status === "success") return <p className="flex items-center gap-2 text-xs text-success"><CheckCircle2 className="h-4 w-4" /> Order completed</p>;
  if (entry.status === "order_cancelled") return null;
  return <div className="space-y-2 border-t pt-2">
    <p className={`text-xs ${entry.buyerComplete ? "text-success" : "text-muted-foreground"}`}>
      {entry.status === "in_trade" ? entry.buyerComplete ? "Buyer result: Completed · Ready to complete" : "Buyer result: Processing" : "Awaiting trade"}
    </p>
    {entry.status === "pending_sale" || entry.status === "pending" ?
      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => onAction("start")}><Play />{entry.status === "pending_sale" ? "Submit order" : "Start trade"}</Button> :
      <>
        {!entry.buyerComplete && <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => onAction("buyer_complete")}>Simulate buyer completion</Button>}
        {canCompleteOrder(entry) && <Button size="sm" className="w-full text-xs" onClick={() => onAction("complete")}><CheckCircle2 /> Complete Order</Button>}
      </>}
  </div>;
}