import { useState } from "react";
import { ArrowLeft, Send, Image as ImageIcon, CheckCircle, Clock, Loader2, Smile, Type, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatMessages } from "@/data/mock";
import { Button } from "@/components/ui/button";

type OrderStatus = "order_created" | "settled" | "billing_sent" | "transfer_processing" | "transfer_complete";

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  order_created:       { label: "Order Created",       color: "text-primary",     bg: "bg-primary/10",     icon: Clock },
  settled:             { label: "Settled",              color: "text-accent",      bg: "bg-accent/10",      icon: CheckCircle },
  billing_sent:        { label: "Billing Sent",         color: "text-warning",     bg: "bg-warning/10",     icon: CheckCircle },
  transfer_processing: { label: "Transfer Processing",  color: "text-warning",     bg: "bg-warning/10",     icon: Loader2 },
  transfer_complete:   { label: "Transfer Complete",     color: "text-success",     bg: "bg-success/10",     icon: CheckCircle },
};

const STATUS_ORDER: OrderStatus[] = ["order_created", "settled", "billing_sent", "transfer_processing", "transfer_complete"];

export default function CustomerChatView({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("transfer_complete");

  const statusConfig = ORDER_STATUS_CONFIG[orderStatus];
  const StatusIcon = statusConfig.icon;
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
          <p className="text-sm font-semibold">LightChat Support</p>
          <p className="text-[10px] text-accent">Online</p>
        </div>
      </header>

      {/* Pinned Order */}
      <div className="pinned-order mx-4 mt-3 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-semibold">📌 Order #ORD-20260318-001</p>
            <p className="text-[10px] text-muted-foreground">iTunes US · $100 x2 · Rate: ₦1,580/CNY</p>
          </div>
          <span className={`status-badge ${statusConfig.bg} ${statusConfig.color} text-[10px] gap-1`}>
            <StatusIcon className={`w-3 h-3 ${orderStatus === "transfer_processing" ? "animate-spin" : ""}`} />
            {statusConfig.label}
          </span>
        </div>
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowOrder(true)}>
            View Details
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => {
            const next = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
            setOrderStatus(next);
          }}>
            Demo: Next Status →
          </Button>
        </div>
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
                  <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">Card Image</span>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{msg.time}</p>
              </div>
            </div>
          );
        })}

        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-center">
          <p className="text-xs text-accent font-medium">💰 Billing processed — ₦215,200 total payout</p>
          <p className="text-[10px] text-muted-foreground mt-1">10:40 AM</p>
        </div>

        {orderStatus === "transfer_complete" && (
          <>
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center animate-slide-up">
              <p className="text-xs text-success font-semibold">✅ Transfer Complete — ₦215,200 sent to First Bank ****1234</p>
              <p className="text-[10px] text-muted-foreground mt-1">10:42 AM</p>
            </div>
            <div className="flex justify-start">
              <div className="chat-bubble-other">
                <p className="text-[9px] font-semibold mb-1 text-accent">System</p>
                <div className="w-56 h-36 bg-muted rounded-lg flex flex-col items-center justify-center border border-dashed border-muted-foreground/30">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-1" />
                  <span className="text-[10px] text-muted-foreground">Transfer Proof Screenshot</span>
                  <span className="text-[9px] text-muted-foreground/60">First Bank · ₦215,200</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">10:42 AM</p>
              </div>
            </div>
          </>
        )}
      </div>

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
                  { label: "Denomination", value: "$100 x 2" },
                  { label: "Total Face Value", value: "$200" },
                  { label: "Rate (per $)", value: "₦680" },
                  { label: "Naira Rate", value: "₦1,580/CNY" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payout Summary</p>
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Card Value (NGN)</p>
                  <p className="text-xs font-medium">₦215,200</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="text-xs font-medium">₦0</p>
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Total Payout</p>
                  <p className="text-sm font-heading font-bold text-accent">₦215,200</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Transfer</p>
              <div className="bg-muted/50 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    orderStatus === "transfer_complete" ? "bg-success/10" : "bg-muted"
                  }`}>
                    {orderStatus === "transfer_complete" ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {orderStatus === "transfer_complete" ? "Transfer Completed" : "Transfer Pending"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Mar 18, 2026 · 10:42 AM</p>
                  </div>
                </div>
                {[
                  { label: "Bank", value: "First Bank · ****1234" },
                  { label: "Amount Sent", value: "₦215,200" },
                  { label: "Reference", value: "TXN-001" },
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
                {[
                  { time: "10:37 AM", event: "Order created", done: currentIdx >= 0 },
                  { time: "10:38 AM", event: "Cards verified & settled", done: currentIdx >= 1 },
                  { time: "10:40 AM", event: "Billing sent", done: currentIdx >= 2 },
                  { time: "10:41 AM", event: "Transfer processing", done: currentIdx >= 3 },
                  { time: "10:42 AM", event: "Transfer complete", done: currentIdx >= 4 },
                ].map((step, i) => (
                  <div key={i} className="relative pl-4">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${step.done ? "bg-accent border-accent" : "bg-card border-muted-foreground"}`}>
                      {step.done && <CheckCircle className="w-2.5 h-2.5 text-accent-foreground" />}
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
