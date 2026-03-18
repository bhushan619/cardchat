import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { chatMessages, orders, bankAccounts, adminUsers } from "@/data/mock";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Image, MoreVertical, Users, CheckCircle2, Clock, XCircle, Crown, Shield, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import OrderWizardModal, { type CompletedOrder } from "@/components/admin/OrderWizardModal";

type ChatMessage = {
  id: number;
  sender: string;
  senderName: string;
  text: string;
  time: string;
  image?: boolean;
  isOrder?: boolean;
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  processing: { label: "Processing", color: "text-warning", bg: "bg-warning/10", icon: Clock },
  completed:  { label: "Completed",  color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  failed:     { label: "Failed",     color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
  settled:    { label: "Settled",    color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  trading:    { label: "Trading",    color: "text-primary", bg: "bg-primary/10", icon: Clock },
  pending_payment: { label: "Pending", color: "text-warning", bg: "bg-warning/10", icon: Clock },
};

const escalatableUsers = adminUsers.filter(u => u.role === "super_admin" || u.role === "team_lead");

const ROLE_META: Record<string, { label: string; icon: typeof Crown }> = {
  super_admin: { label: "Super Admin", icon: Crown },
  team_lead: { label: "Team Lead", icon: Shield },
};

export default function AdminChatView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<typeof adminUsers>([]);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(
    chatMessages.map(m => ({
      ...m,
      senderName: m.sender === "customer" ? "User-A7X3" : m.sender === "agent" ? "You" : "System",
    }))
  );

  const isGroupChat = groupMembers.length > 0;

  const handleOrderComplete = (order: CompletedOrder) => {
    setCompletedOrders(prev => [order, ...prev]);
  };

  const addToGroup = (user: (typeof adminUsers)[0]) => {
    if (groupMembers.find(m => m.id === user.id)) return;
    setGroupMembers(prev => [...prev, user]);
    // Add system message about joining
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text: `${user.name} (${ROLE_META[user.role]?.label || user.role}) has joined the chat`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setEscalateOpen(false);
  };

  const removeFromGroup = (userId: number) => {
    const user = groupMembers.find(m => m.id === userId);
    if (!user) return;
    setGroupMembers(prev => prev.filter(m => m.id !== userId));
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text: `${user.name} has left the chat`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
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

  const getSenderColor = (sender: string, senderName: string) => {
    if (sender === "customer") return "text-primary";
    if (senderName === "You") return "text-accent";
    // Group members get unique colors
    const colors = ["text-orange-500", "text-emerald-500", "text-violet-500", "text-rose-500"];
    const idx = groupMembers.findIndex(m => m.name === senderName);
    return colors[idx % colors.length] || "text-accent";
  };

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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">User-A7X3</p>
                  {isGroupChat && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> Group · {groupMembers.length + 2}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {isGroupChat
                    ? `You, ${groupMembers.map(m => m.name).join(", ")}, User-A7X3`
                    : "85% rate · ₦450,000 total · VIP, Repeat"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="text-xs h-7 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowWizard(true)}>
                Process Order
              </Button>
              <Popover open={escalateOpen} onOpenChange={setEscalateOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Users className="w-3.5 h-3.5" /> Escalate
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end">
                  <div className="p-3 border-b">
                    <p className="text-xs font-semibold">Add to Group Chat</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Select a team lead or super admin</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {escalatableUsers.map(user => {
                      const alreadyAdded = groupMembers.some(m => m.id === user.id);
                      const roleMeta = ROLE_META[user.role];
                      const RoleIcon = roleMeta?.icon || Shield;
                      return (
                        <button
                          key={user.id}
                          onClick={() => !alreadyAdded && addToGroup(user)}
                          disabled={alreadyAdded}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left transition-colors ${
                            alreadyAdded ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <RoleIcon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground">{roleMeta?.label} · {user.status}</p>
                          </div>
                          {alreadyAdded ? (
                            <span className="text-[9px] text-muted-foreground">Added</span>
                          ) : (
                            <span className="text-[9px] text-primary font-medium">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <button><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          </header>

          {/* Group members bar */}
          {isGroupChat && (
            <div className="flex items-center gap-1.5 px-5 py-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground shrink-0">Members:</span>
              {groupMembers.map(m => (
                <span key={m.id} className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                  {m.name}
                  <button onClick={() => removeFromGroup(m.id)} className="hover:text-destructive">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {localMessages.map(msg => {
              if (msg.isOrder) {
                return (
                  <div key={msg.id} className="pinned-order animate-slide-up">
                    <p className="text-xs font-medium">📌 {msg.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                );
              }
              const isCustomer = msg.sender === "customer";
              return (
                <div key={msg.id} className={isCustomer ? "flex justify-start" : "flex justify-end"}>
                  <div className={isCustomer ? "chat-bubble-other" : "chat-bubble-self"}>
                    {(isGroupChat || true) && (
                      <p className={`text-[9px] font-semibold mb-0.5 ${getSenderColor(msg.sender, msg.senderName)}`}>
                        {msg.senderName}
                      </p>
                    )}
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
