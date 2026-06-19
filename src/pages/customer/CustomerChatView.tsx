import { useState } from "react";
import { ArrowLeft, Send, CheckCircle, Clock, Loader2, Smile, Camera, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatMessages } from "@/data/mock";
import { Button } from "@/components/ui/button";
import itunesCardSample from "@/assets/itunes-card-sample.jpg";

type CustomerVisibleStatus = "order_created" | "order_processing" | "success" | "failed";

const ORDER_STATUS_CONFIG: Record<CustomerVisibleStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  order_created:    { label: "Order Created",    color: "text-primary",     bg: "bg-primary/10",     icon: Clock },
  order_processing: { label: "Order Processing", color: "text-warning",     bg: "bg-warning/10",     icon: Loader2 },
  success:          { label: "Success",           color: "text-success",     bg: "bg-success/10",     icon: CheckCircle },
  failed:           { label: "Failed",            color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const STATUS_ORDER: CustomerVisibleStatus[] = [
  "order_created",
  "order_processing",
  "success",
];

const TIMELINE_STEPS: { event: string; time: string }[] = [
  { event: "Order created",    time: "10:37 AM" },
  { event: "Order processing", time: "10:38 AM" },
  { event: "Success",          time: "10:40 AM" },
];

type PinnedOrder = {
  id: string;
  cardType: string;
  amount: string;
  rate: string;
  payout: string;
  status: CustomerVisibleStatus;
};

const PINNED_ORDERS: PinnedOrder[] = [
  { id: "ORD-20260318-001", cardType: "iTunes US",  amount: "$200", rate: "₦680", payout: "₦136,000", status: "success" },
  { id: "ORD-20260318-002", cardType: "Amazon US",  amount: "$150", rate: "₦620", payout: "₦93,000",  status: "order_processing" },
  { id: "ORD-20260318-003", cardType: "Steam US",   amount: "$100", rate: "₦600", payout: "₦60,000",  status: "order_created" },
];

export default function CustomerChatView({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(PINNED_ORDERS[0].id);
  const [expanded, setExpanded] = useState(true);

  const selectedOrder = PINNED_ORDERS.find(o => o.id === selectedOrderId) ?? PINNED_ORDERS[0];
  const orderStatus = selectedOrder.status;
  const statusConfig = ORDER_STATUS_CONFIG[orderStatus];
  const currentIdx = STATUS_ORDER.indexOf(orderStatus);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={onBack}><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
          <span className="text-accent font-bold text-sm">L</span>
        </div>
        <div>
          <p className="text-sm font-semibold">CardChat Support</p>
          <p className="text-[10px] text-accent">Online</p>
        </div>
      </header>

      {/* Pinned Orders (sticky, multi) */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b px-3 pt-2 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <p className="text-[11px] font-semibold text-muted-foreground">
            📌 Active Orders <span className="text-accent">({PINNED_ORDERS.length})</span>
          </p>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {/* Horizontal scroll list of order chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
          {PINNED_ORDERS.map(o => {
            const cfg = ORDER_STATUS_CONFIG[o.status];
            const Icon = cfg.icon;
            const active = o.id === selectedOrderId;
            return (
              <button
                key={o.id}
                onClick={() => { setSelectedOrderId(o.id); setExpanded(true); }}
                className={`snap-start shrink-0 min-w-[200px] text-left rounded-lg border p-2 transition-colors ${active ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/40"}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[11px] font-semibold truncate">#{o.id.slice(-6)}</p>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} text-[9px]`}>
                    <Icon className={`w-2.5 h-2.5 ${o.status === "order_processing" ? "animate-spin" : ""}`} />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{o.cardType} · {o.amount} · {o.rate}</p>
                <p className="text-[10px] font-medium text-accent mt-0.5">Payout {o.payout}</p>
              </button>
            );
          })}
        </div>

        {/* Expanded detail for selected order */}
        {expanded && (
          <div className="mt-2 rounded-lg border border-accent/30 bg-accent/5 p-2.5 animate-slide-up">
            <div className="flex items-center gap-1 mb-2">
              {STATUS_ORDER.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${i <= currentIdx ? "bg-accent" : "bg-muted-foreground/30"}`} />
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded ${i < currentIdx ? "bg-accent" : "bg-muted-foreground/20"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                #{selectedOrder.id} · {statusConfig.label}
              </p>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowOrder(true)}>
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map(msg => {
          if (msg.isOrder) {
            return (
              <div key={msg.id} className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-center">
                <p className="text-xs text-accent font-medium">{msg.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
              </div>
            );
          }
          return (
            <div key={msg.id} className={msg.sender === "customer" ? "flex justify-end" : "flex justify-start"}>
              <div className={msg.sender === "customer" ? "chat-bubble-self" : "chat-bubble-other"}>
                {msg.image ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(itunesCardSample)}
                    className="block rounded-lg overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <img
                      src={itunesCardSample}
                      alt="Customer-sent gift card"
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-56 h-40 object-cover"
                    />
                  </button>
                ) : (
                  <p>{msg.text}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{msg.time}</p>
              </div>
            </div>
          );
        })}

        {(currentIdx >= 2) && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
            <p className="text-xs text-success font-semibold">✅ ₦136,000 has been added to your wallet</p>
            <p className="text-[10px] text-muted-foreground mt-1">10:40 AM</p>
          </div>
        )}


        {orderStatus === "failed" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center animate-slide-up">
            <p className="text-xs text-destructive font-semibold">❌ Order Failed — Please contact support</p>
            <p className="text-[10px] text-muted-foreground mt-1">10:40 AM</p>
          </div>
        )}
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="absolute inset-0 bg-foreground/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/20 text-background flex items-center justify-center"
          >
            ✕
          </button>
          <img src={previewImage} alt="Card preview" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}

      {/* Order Details Modal */}
      {showOrder && (
        <div className="absolute inset-0 bg-foreground/40 flex items-end z-50">
          <div className="w-full max-w-md mx-auto bg-card rounded-t-2xl p-5 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold">Order Details</h3>
              <button onClick={() => setShowOrder(false)} className="text-muted-foreground">✕</button>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-1 text-center">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-sm font-heading font-bold">#ORD-20260318-001</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color} text-xs font-medium`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                {[
                  { label: "Card Type", value: "iTunes US" },
                  { label: "Amount", value: "$200" },
                  { label: "Card Rate", value: "₦680" },
                  { label: "Payout", value: "₦136,000" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>


            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
              <div className="space-y-3 pl-3 border-l-2 border-accent/20">
                {TIMELINE_STEPS.map((step, i) => (
                  <div key={i} className="relative pl-4">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${i <= currentIdx ? "bg-accent border-accent" : "bg-card border-muted-foreground"}`}>
                      {i <= currentIdx && <CheckCircle className="w-2.5 h-2.5 text-accent-foreground" />}
                    </div>
                    <p className="text-xs font-medium">{step.event}</p>
                    <p className="text-[10px] text-muted-foreground">{step.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t bg-card shrink-0">
        <div className="flex items-center gap-2 px-3 py-3">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="flex-1 border-0 bg-muted"
          />
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors shrink-0">
            <Camera className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors shrink-0">
            <Smile className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-accent-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
