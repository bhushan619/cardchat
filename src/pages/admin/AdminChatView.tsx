import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { chatMessages, orders, bankAccounts, adminUsers } from "@/data/mock";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Image, MoreVertical, Users, CheckCircle2, Clock, XCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderWizardModal, { type CompletedOrder } from "@/components/admin/OrderWizardModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  processing: { label: "Processing", color: "text-warning", bg: "bg-warning/10", icon: Clock },
  completed:  { label: "Completed",  color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  failed:     { label: "Failed",     color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
  settled:    { label: "Settled",    color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  trading:    { label: "Trading",    color: "text-primary", bg: "bg-primary/10", icon: Clock },
  pending_payment: { label: "Pending", color: "text-warning", bg: "bg-warning/10", icon: Clock },
};

export default function AdminChatView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [escalatedTo, setEscalatedTo] = useState<number | null>(null);

  const escalationTargets = adminUsers.filter(u => u.role === "super_admin" || u.role === "team_lead");

  const senderName = (sender: string) => {
    if (sender === "customer") return "User-A7X3";
    if (sender === "agent") return "You";
    return "System";
  };

  const handleOrderComplete = (order: CompletedOrder) => {
    setCompletedOrders(prev => [order, ...prev]);
  };

  // Combine mock orders with completed ones for display
  const allOrders = [
    ...completedOrders.map(o => ({
      id: o.orderId,
      cardType: o.cards.map(c => c.cardType).join(", "),
      denomination: `${o.cards.length} cards`,
      amount: o.totalFaceValue,
      nairaRate: 1580,
      unitPrice: 0,
      status: o.status as string,
      payout: o.totalPayout,
      bank: o.bank,
      bankAccount: o.bankAccount,
      timestamp: o.timestamp,
      isNew: true,
    })),
    ...orders.map(o => ({
      ...o,
      payout: o.amount * o.unitPrice,
      bank: "",
      bankAccount: "",
      timestamp: o.created,
      isNew: false,
    })),
  ];

  const selectedOrder = selectedOrderId
    ? allOrders.find(o => o.id === selectedOrderId)
    : null;

  return (
    <AdminLayout>
      <div className="flex h-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
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
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Users className="w-3.5 h-3.5" /> {escalatedTo ? "Escalated" : "Escalate"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Escalate to</p>
                  {escalationTargets.map(user => {
                    const isSelected = escalatedTo === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setEscalatedTo(isSelected ? null : user.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors ${
                          isSelected ? "bg-accent/10 text-accent-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {user.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
              <button><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </header>

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
                    <p className={`text-[9px] font-semibold mb-0.5 ${msg.sender === "customer" ? "text-primary" : "text-accent-foreground/70"}`}>
                      {senderName(msg.sender)}
                    </p>
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

        {/* Right panel - Orders & Info */}
        <div className="w-80 border-l bg-card overflow-y-auto shrink-0">
          {/* Orders list */}
          <div className="p-4 border-b">
            <h3 className="font-heading font-semibold text-sm mb-3">Orders ({allOrders.length})</h3>
            <div className="space-y-1.5">
              {allOrders.map(o => {
                const st = STATUS_STYLES[o.status] || STATUS_STYLES.trading;
                const Icon = st.icon;
                const isSelected = selectedOrderId === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                    className={`w-full text-left rounded-lg p-2.5 transition-colors ${
                      isSelected ? "bg-accent/10 border border-accent/30" : "bg-muted hover:bg-muted/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold">{o.id}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${st.bg} ${st.color} flex items-center gap-0.5`}>
                        <Icon className="w-2.5 h-2.5" /> {st.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{o.cardType}</span>
                      <span>${o.amount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected order details */}
          {selectedOrder && (
            <div className="p-4 border-b">
              <h3 className="font-heading font-semibold text-sm mb-3">Order Details</h3>
              <div className="space-y-2">
                {[
                  ["Order ID", selectedOrder.id],
                  ["Card", `${selectedOrder.cardType}`],
                  ["Denomination", selectedOrder.denomination],
                  ["Amount", `$${selectedOrder.amount}`],
                  ["Naira Rate", `₦${selectedOrder.nairaRate.toLocaleString()}`],
                  ["Payout", `₦${selectedOrder.payout.toLocaleString()}`],
                  ...(selectedOrder.bank ? [["Bank", `${selectedOrder.bank} ${selectedOrder.bankAccount}`]] : []),
                  ["Time", selectedOrder.timestamp],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank accounts */}
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

          {/* Customer info */}
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

        <OrderWizardModal
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleOrderComplete}
        />
      </div>
    </AdminLayout>
  );
}
