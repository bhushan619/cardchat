import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { chatMessages, orders, bankAccounts } from "@/data/mock";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Image, MoreVertical, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderWizardModal from "@/components/admin/OrderWizardModal";

export default function AdminChatView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  const order = orders[0];

  return (
    <AdminLayout>
      <div className="flex h-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <header className="flex items-center justify-between px-5 py-3 border-b bg-card shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/admin")}><ArrowLeft className="w-4 h-4" /></button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">X3</div>
              <div>
                <p className="text-sm font-semibold">User-A7X3</p>
                <p className="text-[10px] text-muted-foreground">85% rate · ₦450,000 total · VIP, Repeat</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="text-xs h-7 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowWizard(true)}>
                Process Order
              </Button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Users className="w-3.5 h-3.5" /> Escalate
              </button>
              <button><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {chatMessages.map(msg => {
              if (msg.isOrder) {
                return (
                  <div key={msg.id} className="pinned-order animate-slide-up">
                    <p className="text-xs font-medium">📌 {msg.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={msg.sender === "customer" ? "flex justify-start" : "flex justify-end"}>
                  <div className={msg.sender === "customer" ? "chat-bubble-other" : "chat-bubble-self"}>
                    {msg.image ? (
                      <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground ml-1">Card Image</span>
                      </div>
                    ) : <p>{msg.text}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-4 border-t bg-card shrink-0">
            <button><Paperclip className="w-5 h-5 text-muted-foreground" /></button>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border-0 bg-muted"
            />
            <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
              <Send className="w-4 h-4 text-accent-foreground" />
            </button>
          </div>
        </div>

        {/* Order sidebar */}
        <div className="w-80 border-l bg-card overflow-y-auto shrink-0">
          <div className="p-4 border-b">
            <h3 className="font-heading font-semibold text-sm mb-3">Active Order</h3>
            <div className="space-y-2">
              {[
                ["Order ID", order.id],
                ["Card", `${order.cardType} ${order.denomination}`],
                ["Amount", `$${order.amount}`],
                ["Naira Rate", `₦${order.nairaRate} (locked)`],
                ["Unit Price", `₦${order.unitPrice}`],
                ["Status", order.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-b">
            <h3 className="font-heading font-semibold text-sm mb-3">Verified Bank Accounts</h3>
            <p className="text-[10px] text-muted-foreground mb-2">Customer: User-A7X3</p>
            {bankAccounts.map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <div>
                  <p className="text-xs font-medium">{a.bankName} · {a.accountNumber}</p>
                  <p className="text-[10px] text-muted-foreground">{a.holderName}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <h3 className="font-heading font-semibold text-sm mb-3">Customer Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Alias</span><span className="font-medium">User-A7X3</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Good Rate</span><span className="font-medium">85%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly Value</span><span className="font-medium">₦450,000</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tags</span><span className="font-medium">VIP, Repeat</span></div>
            </div>
          </div>
        </div>

        <OrderWizardModal open={showWizard} onClose={() => setShowWizard(false)} />
      </div>
    </AdminLayout>
  );
}
