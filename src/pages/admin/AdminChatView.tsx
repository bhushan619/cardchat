import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { chatMessages, orders, bankAccounts, adminUsers } from "@/data/mock";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Image, MoreVertical, Users, CheckCircle2, Clock, XCircle, Crown, Shield, X, Banknote, Eye, EyeOff, AlertTriangle, UserCheck, Type, Camera, Smile, FileText as FileTextIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import OrderWizardModal, { type CompletedOrder, cardlightResultMeta, type CardlightResult } from "@/components/admin/OrderWizardModal";
import { useAdminRole } from "@/contexts/AdminRoleContext";

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
  const { role } = useAdminRole();
  const [message, setMessage] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<typeof adminUsers>([]);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<(typeof adminUsers)[0] | null>(null);

  // Payment flow state
  const [paymentMode, setPaymentMode] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const [transferComplete, setTransferComplete] = useState(false);

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(
    chatMessages.map(m => ({
      ...m,
      senderName: m.sender === "customer" ? "A7X3KP" : m.sender === "agent" ? "You" : "System",
    }))
  );

  const isGroupChat = groupMembers.length > 0;
  const canReassign = role === "super_admin" || role === "team_lead";

  const handleOrderComplete = (order: CompletedOrder) => {
    setCompletedOrders(prev => [order, ...prev]);

    // Simulate CardLight webhook result after 3-6 seconds
    const webhookDelay = 3000 + Math.random() * 3000;
    setTimeout(() => {
      const results: CardlightResult[] = ["successful", "negotiate"];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setCompletedOrders(prev =>
        prev.map(o => o.orderId === order.orderId ? { ...o, cardlightResult: randomResult } : o)
      );
    }, webhookDelay);
  };

  const addToGroup = (user: (typeof adminUsers)[0]) => {
    if (groupMembers.find(m => m.id === user.id)) return;
    setGroupMembers(prev => [...prev, user]);
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

  const handleReassign = () => {
    if (!reassignTarget) return;
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text: `Customer reassigned from You to ${reassignTarget.name}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setReassignTarget(null);
    setReassignOpen(false);
  };

  // Combine mock orders with completed ones for display
  const allOrders = [
    ...completedOrders.map(o => ({
      id: o.orderId,
      cardType: o.cards.map(c => c.cardType).join(", "),
      amount: o.totalFaceValue,
      nairaRate: 289,
      unitPrice: 0,
      status: o.status as string,
      payout: o.totalPayout,
      bank: o.bank,
      bankAccount: o.bankAccount,
      timestamp: o.timestamp,
      isNew: true,
      cardlightResult: o.cardlightResult,
      cr2: o.cr2 || 0,
      cr3: o.cr3 || 0,
      cardNumbers: o.cardNumbers || [],
    })),
    ...orders.map((o, idx) => ({
      ...o,
      payout: o.amount * o.unitPrice,
      bank: "",
      bankAccount: "",
      timestamp: o.created,
      isNew: false,
      cardlightResult: (["successful", "negotiate"] as CardlightResult[])[idx % 2],
      cr2: o.unitPrice,
      cr3: o.unitPrice / o.nairaRate,
      cardNumbers: [] as string[],
    })),
  ];

  const selectedOrder = selectedOrderId
    ? allOrders.find(o => o.id === selectedOrderId)
    : null;

  // Payment calculation
  const totalPaymentEntered = Object.values(paymentAmounts).reduce(
    (sum, v) => sum + (Number(v.replace(/,/g, "")) || 0), 0
  );
  const billingTotal = selectedOrder ? selectedOrder.payout : 0;
  const remainingBalance = billingTotal - totalPaymentEntered;

  const [transferDetails, setTransferDetails] = useState<{ bankName: string; accountNumber: string; holderName: string; amount: number }[]>([]);

  const handleExecuteTransfer = () => {
    // Capture transfer details before clearing payment state
    const details = bankAccounts
      .filter(a => Number((paymentAmounts[a.id] || "0").replace(/,/g, "")) > 0)
      .map(a => ({
        bankName: a.bankName,
        accountNumber: a.accountNumber,
        holderName: a.holderName,
        amount: Number((paymentAmounts[a.id] || "0").replace(/,/g, "")),
      }));
    setTransferDetails(details);
    setTransferComplete(true);
    setPaymentMode(false);
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text: `💸 Transfer executed — ₦${billingTotal.toLocaleString()} sent to customer's verified accounts`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
  };

  const getSenderColor = (sender: string, senderName: string) => {
    if (sender === "customer") return "text-primary";
    if (senderName === "You") return "text-accent";
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
                  <p className="text-sm font-semibold">A7X3KP</p>
                  {isGroupChat && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> Group · {groupMembers.length + 2}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {isGroupChat
                    ? `You, ${groupMembers.map(m => m.name).join(", ")}, A7X3KP`
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

          {/* Group members bar with Reassign */}
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
              {canReassign && (
                <Popover open={reassignOpen} onOpenChange={setReassignOpen}>
                  <PopoverTrigger asChild>
                    <button className="text-[10px] font-medium text-warning hover:text-warning/80 ml-auto shrink-0 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Reassign
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" align="end">
                    <div className="p-3 border-b">
                      <p className="text-xs font-semibold">Reassign Customer</p>
                      <p className="text-[10px] text-muted-foreground">Select an agent</p>
                    </div>
                    {reassignTarget ? (
                      <div className="p-3 space-y-3">
                        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                          <p className="text-xs text-warning-foreground">
                            Reassign <strong>A7X3KP</strong> to <strong>{reassignTarget.name}</strong>?
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">Full chat history and order context will be transferred.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setReassignTarget(null)}>Cancel</Button>
                          <Button size="sm" className="flex-1 h-7 text-xs bg-warning text-warning-foreground hover:bg-warning/90" onClick={handleReassign}>Confirm</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-1.5 space-y-0.5">
                        {adminUsers.filter(u => u.role === "agent").map(agent => (
                          <button
                            key={agent.id}
                            onClick={() => setReassignTarget(agent)}
                            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted text-left"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {agent.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-medium">{agent.name}</p>
                              <p className="text-[10px] text-muted-foreground">{agent.status}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
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

          <div className="border-t bg-card shrink-0">
            <div className="flex items-center gap-1 px-4 pt-2 pb-1">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors">
                <Type className="w-3.5 h-3.5" /> Text
              </button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors">
                <Camera className="w-3.5 h-3.5" /> Image
              </button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors">
                <Smile className="w-3.5 h-3.5" /> Emoji
              </button>
              <button
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md text-accent-foreground bg-accent hover:bg-accent/80 transition-colors ml-auto"
                onClick={() => setShowWizard(true)}
              >
                <FileTextIcon className="w-3.5 h-3.5" /> Create Order
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 pb-3">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-0 bg-muted"
              />
              <button className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-accent-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
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
          {selectedOrder && (() => {
            const resultMeta = selectedOrder.cardlightResult ? cardlightResultMeta[selectedOrder.cardlightResult] : null;
            return (
            <div className={`p-4 border-b transition-colors ${resultMeta ? resultMeta.rowBg : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-sm">Order Details</h3>
                {resultMeta && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${resultMeta.bg} ${resultMeta.color}`}>
                    ● {resultMeta.label}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {[
                  ["Order ID", selectedOrder.id],
                  ["Card", `${selectedOrder.cardType}`],
                  ["Amount", `$${selectedOrder.amount}`],
                  ["Naira Rate", `₦${selectedOrder.nairaRate.toLocaleString()}`],
                  ["Payout", `₦${selectedOrder.payout.toLocaleString()}`],
                  ...(selectedOrder.cardNumbers && selectedOrder.cardNumbers.length > 0 ? [["Card No.", selectedOrder.cardNumbers.join(", ")]] : []),
                  ["Time", selectedOrder.timestamp],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              {/* Process Payment button for settled orders */}
              {selectedOrder.status === "settled" && !paymentMode && !transferComplete && (
                <Button
                  size="sm"
                  className="w-full mt-3 h-8 text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setPaymentMode(true)}
                >
                  <Banknote className="w-3.5 h-3.5" /> Process Payment
                </Button>
              )}
              {transferComplete && (
                <div className="mt-3 bg-success/10 border border-success/30 rounded-lg p-3 space-y-2.5">
                  <div className="text-center">
                    <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
                    <p className="text-xs font-medium text-success">Transfer Complete</p>
                  </div>
                  <div className="space-y-1.5">
                    {transferDetails.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] bg-background/60 rounded-md px-2.5 py-1.5">
                        <div>
                          <p className="font-medium">{d.bankName} · {d.accountNumber}</p>
                          <p className="text-[10px] text-muted-foreground">{d.holderName}</p>
                        </div>
                        <span className="font-semibold text-success">₦{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs border-t border-success/20 pt-2">
                    <span className="text-muted-foreground">Total Sent</span>
                    <span className="font-bold text-success">₦{billingTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Payment flow */}
          {paymentMode && selectedOrder && (
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-sm">Execute Transfer</h3>
                <button onClick={() => setPaymentMode(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">Customer: A7X3KP · Select bank accounts and enter amounts</p>

              {/* Running balance */}
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Billing</span>
                  <span className="font-semibold">₦{billingTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entered</span>
                  <span className="font-medium">₦{totalPaymentEntered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs border-t pt-1">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={`font-semibold ${remainingBalance === 0 ? "text-success" : remainingBalance < 0 ? "text-destructive" : "text-warning"}`}>
                    ₦{remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bank accounts with amount inputs */}
              {bankAccounts.map(a => (
                <div key={a.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{a.bankName} · {a.accountNumber}</p>
                      <p className="text-[10px] text-muted-foreground">{a.holderName} · Verified</p>
                    </div>
                  </div>
                  <Input
                    placeholder="₦ Amount"
                    className="h-8 text-xs"
                    value={paymentAmounts[a.id] || ""}
                    onChange={e => setPaymentAmounts(prev => ({ ...prev, [a.id]: e.target.value }))}
                  />
                </div>
              ))}

              <Button
                className="w-full h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
                disabled={remainingBalance !== 0 || totalPaymentEntered === 0}
                onClick={handleExecuteTransfer}
              >
                <Banknote className="w-3.5 h-3.5" /> Execute Transfer
              </Button>
              {remainingBalance !== 0 && totalPaymentEntered > 0 && (
                <p className="text-[10px] text-destructive text-center">Amounts must equal billing total</p>
              )}
            </div>
          )}


          {/* Customer info with identity toggle */}
          <div className="p-4">
            <h3 className="font-heading font-semibold text-sm mb-3">Customer Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alias</span>
                <span className="font-medium">A7X3KP</span>
              </div>

              {/* Super Admin identity toggle */}
              {role === "super_admin" && (
                <div className="border rounded-lg p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {showIdentity ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Show Real Identity
                    </span>
                    <Switch checked={showIdentity} onCheckedChange={setShowIdentity} className="scale-75" />
                  </div>
                  {showIdentity && (
                    <div className="space-y-1.5 animate-slide-up">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">John Adebayo Doe</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">+234 812 345 6789</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">john.doe@email.com</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-warning mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>This access is logged</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
          customerAlias="A7X3KP"
        />
      </div>
    </AdminLayout>
  );
}
