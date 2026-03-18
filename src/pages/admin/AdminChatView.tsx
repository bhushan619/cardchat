import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { chatMessages, orders, bankAccounts } from "@/data/mock";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Image, MoreVertical, AlertTriangle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminChatView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showBilling, setShowBilling] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

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
              <Button size="sm" variant="outline" className="text-xs h-7">Create Order</Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowBilling(true)}>Auto-Bill</Button>
              <Button size="sm" className="text-xs h-7 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowTransfer(true)}>Execute Transfer</Button>
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

        {/* Auto-Billing Modal */}
        {showBilling && (
          <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 w-[420px] space-y-4 animate-slide-up shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold">Auto-Billing</h3>
                <button onClick={() => setShowBilling(false)} className="text-muted-foreground">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Denomination</label>
                  <Input value="$200" readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-1">= Settlement amount</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Naira Rate</label>
                  <Input value="₦1,580" readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-accent mt-1">🔒 From system config</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Unit Price</label>
                  <Input defaultValue="680" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Cost Unit Price</label>
                  <Input value="0.43038" readOnly className="mt-1 bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-1">= Unit Price ÷ Naira Rate</p>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-warning-foreground">This order will lose ₦2,400. Continue?</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowBilling(false)}>Cancel</Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Send Billing</Button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Execution Modal */}
        {showTransfer && (
          <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 w-[420px] space-y-4 animate-slide-up shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold">Execute Transfer</h3>
                <button onClick={() => setShowTransfer(false)} className="text-muted-foreground">✕</button>
              </div>
              <p className="text-sm text-muted-foreground">Review verified bank details before executing transfer via merchant API.</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Customer</span><span className="font-medium">User-A7X3</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Amount</span><span className="font-medium text-accent">₦215,200</span></div>
              </div>
              {bankAccounts.slice(0, 2).map((a, i) => (
                <div key={a.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{a.bankName} · {a.accountNumber}</p>
                    <span className="status-badge bg-success/10 text-success text-[10px]">Verified</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Holder: {a.holderName}</p>
                  <Input defaultValue={i === 0 ? "150,000" : "65,200"} className="mt-1" />
                </div>
              ))}
              <p className="text-[10px] text-destructive">⚠ Transfer will be executed immediately via 3rd-party merchant API. This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancel</Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Execute Transfer</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
