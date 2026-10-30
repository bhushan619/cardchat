import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AttentionOrder } from "@/lib/orderAttention";

export type ReadyPopupOrder = AttentionOrder & { cardType?: string; amount?: number };

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function OrderReadyModal({ order, onConfirm }: { order: ReadyPopupOrder | null; onConfirm: (order: ReadyPopupOrder) => void }) {
  return (
    <Dialog open={!!order}>
      <DialogContent
        hideClose
        className="max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <DialogTitle>Order ready to complete</DialogTitle>
          </div>
          <DialogDescription>
            The buyer confirmed this card. Confirm to complete the order — this pop-up stays open until you confirm.
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <DetailRow label="Order ID" value={`#${order.id}`} mono />
            <DetailRow label="Customer" value={order.customer} mono />
            <DetailRow label="Card" value={`${order.cardType ?? "Gift card"}${order.amount != null ? ` · $${order.amount}` : ""}`} />
            <DetailRow label="Buyer result" value="Completed · Ready to complete" />
          </div>
        )}
        <DialogFooter>
          <Button className="w-full" onClick={() => order && onConfirm(order)}>
            <CheckCircle2 className="h-4 w-4" /> Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
