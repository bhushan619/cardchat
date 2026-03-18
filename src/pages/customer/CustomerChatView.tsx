import { useState } from "react";
import { ArrowLeft, Paperclip, Send, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatMessages } from "@/data/mock";
import { Button } from "@/components/ui/button";

export default function CustomerChatView({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [showOrder, setShowOrder] = useState(false);

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold">📌 Order #ORD-20260318-001</p>
            <p className="text-[10px] text-muted-foreground">iTunes US · $100 x2 · Rate: ₦1,580</p>
          </div>
          <span className="status-badge bg-accent/10 text-accent text-[10px]">Settled</span>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowOrder(true)}>
            View Order
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
      </div>

      {/* Order Details Modal */}
      {showOrder && (
        <div className="absolute inset-0 bg-foreground/40 flex items-end z-50">
          <div className="w-full max-w-md mx-auto bg-card rounded-t-2xl p-5 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold">Order Details</h3>
              <button onClick={() => setShowOrder(false)} className="text-muted-foreground">✕</button>
            </div>

            {/* Order ID & Status */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-1 text-center">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-sm font-heading font-bold">#ORD-20260318-001</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">Settled</span>
            </div>

            {/* Card Details */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                {[
                  { label: "Card Type", value: "iTunes US" },
                  { label: "Denomination", value: "$100 x 2" },
                  { label: "Total Face Value", value: "$200" },
                  { label: "Rate (per $)", value: "₦680" },
                  { label: "Naira Rate", value: "₦1,580/$" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Summary */}
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

            {/* Bank Transfer Status */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Transfer</p>
              <div className="bg-muted/50 rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Transfer Completed</p>
                    <p className="text-[10px] text-muted-foreground">Mar 18, 2026 · 10:42 AM</p>
                  </div>
                </div>
                {[
                  { label: "Bank", value: "First Bank · ****1234" },
                  { label: "Account Name", value: "JOHN A. DOE" },
                  { label: "Amount Sent", value: "₦215,200" },
                  { label: "Reference", value: "TXN-001" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-medium">{    item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
              <div className="space-y-3 pl-3 border-l-2 border-accent/20">
                {[
                  { time: "10:37 AM", event: "Order created", done: true },
                  { time: "10:38 AM", event: "Cards verified", done: true },
                  { time: "10:40 AM", event: "Billing processed", done: true },
                  { time: "10:42 AM", event: "Payment sent", done: true },
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

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t bg-card shrink-0">
        <button><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="flex-1 border-0 bg-muted"
        />
        <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
          <Send className="w-4 h-4 text-accent-foreground" />
        </button>
      </div>
    </div>
  );
}
