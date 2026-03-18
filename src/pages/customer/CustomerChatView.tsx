import { useState } from "react";
import { ArrowLeft, Paperclip, Send, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { chatMessages } from "@/data/mock";
import { Button } from "@/components/ui/button";

export default function CustomerChatView({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [showCollect, setShowCollect] = useState(false);

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

      {/* Collect Now Modal */}
      {showCollect && (
        <div className="absolute inset-0 bg-foreground/40 flex items-end z-50">
          <div className="w-full max-w-md mx-auto bg-card rounded-t-2xl p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold">Collect Payment</h3>
              <button onClick={() => setShowCollect(false)} className="text-muted-foreground">✕</button>
            </div>
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-heading font-bold text-accent">₦215,200</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Bank Account</p>
              {[
                { bank: "First Bank", acc: "****1234", name: "JOHN A. DOE" },
                { bank: "GTBank", acc: "****5678", name: "JOHN ADEBAYO" },
              ].map((a, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted">
                  <input type="radio" name="bank" defaultChecked={i === 0} className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium">{a.bank} · {a.acc}</p>
                    <p className="text-xs text-muted-foreground">{a.name}</p>
                  </div>
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input defaultValue="215,200" className="mt-1" />
            </div>
            <p className="text-[10px] text-destructive">⚠ Transfer will be executed immediately. Verify account details.</p>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Confirm Collection</Button>
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
