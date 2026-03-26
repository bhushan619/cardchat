import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations as rawConversations, chatMessages, orders, bankAccounts, adminUsers } from "@/data/mock";
import {
  MessageCircle, Star, Send, Image, MoreVertical, Users, Search,
  CheckCircle2, Clock, XCircle, Crown, Shield, X, Banknote, Eye, EyeOff,
  AlertTriangle, UserCheck, Camera, Smile, FileText as FileTextIcon, Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import CardlightPanel, { type CompletedOrder } from "@/components/admin/OrderWizardModal";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import {
  AgentOrderStatus,
  agentStatusLabels,
  agentStatusStyles,
  getTabForStatus,
  toCustomerStatus,
  customerStatusLabels,
} from "@/lib/orderStateMachine";

const columns = [
  { id: "consulting", label: "Consulting", color: "text-white", bg: "bg-gradient-to-r from-amber-500 to-orange-400", activeBg: "bg-gradient-to-r from-amber-600 to-orange-500" },
  { id: "trading", label: "Trading", color: "text-white", bg: "bg-gradient-to-r from-emerald-500 to-teal-400", activeBg: "bg-gradient-to-r from-emerald-600 to-teal-500" },
];

const escalatableUsers = adminUsers.filter(u => u.role === "super_admin" || u.role === "team_lead");

const ROLE_META: Record<string, { label: string; icon: typeof Crown }> = {
  super_admin: { label: "Super Admin", icon: Crown },
  team_lead: { label: "Team Lead", icon: Shield },
};

type ChatMessage = {
  id: number;
  sender: string;
  senderName: string;
  text: string;
  time: string;
  image?: boolean;
  isOrder?: boolean;
};

export default function AdminMessages() {
  const { role } = useAdminRole();
  const orderStatus = useOrderStatus();
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Chat state
  const [message, setMessage] = useState("");
  const [rightTab, setRightTab] = useState<string>("orders");
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<typeof adminUsers>([]);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<(typeof adminUsers)[0] | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [transferCompletedOrders, setTransferCompletedOrders] = useState<Set<string>>(new Set());

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(
    chatMessages.map(m => ({
      ...m,
      senderName: m.sender === "customer" ? "A7X3KP" : m.sender === "agent" ? "You" : "System",
    }))
  );

  const selectedConvo = rawConversations.find(c => c.id === selectedId);
  const isGroupChat = groupMembers.length > 0;
  const canReassign = role === "super_admin" || role === "team_lead";

  // Dynamic tab assignment based on order status
  const conversationsWithTabs = useMemo(() => {
    return rawConversations.map(c => ({
      ...c,
      dynamicTab: orderStatus.getConversationTab(c.id),
    }));
  }, [orderStatus]);

  const [activeTab, setActiveTab] = useState("consulting");
  const [customerSearch, setCustomerSearch] = useState("");

  const filteredConversations = useMemo(() => {
    return conversationsWithTabs.filter(c => {
      const matchesTab = c.dynamicTab === activeTab;
      const matchesSearch = !customerSearch || c.alias.toLowerCase().includes(customerSearch.toLowerCase()) || c.lastMessage.toLowerCase().includes(customerSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversationsWithTabs, activeTab, customerSearch]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { consulting: 0, trading: 0 };
    conversationsWithTabs.forEach(c => { counts[c.dynamicTab] = (counts[c.dynamicTab] || 0) + 1; });
    return counts;
  }, [conversationsWithTabs]);

  const tabUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = { consulting: 0, trading: 0 };
    conversationsWithTabs.forEach(c => { if (c.unread > 0) counts[c.dynamicTab] += c.unread; });
    return counts;
  }, [conversationsWithTabs]);

  // Helper: add system message
  const addSystemMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now(), sender: "system", senderName: "System",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages(prev => [...prev, newMsg]);
  };

  // Order status actions — only send chat message when customer-visible status changes
  const handleStatusTransition = (conversationId: string, newStatus: AgentOrderStatus) => {
    const currentStatus = orderStatus.getStatus(conversationId);
    const prevCustomerStatus = currentStatus ? toCustomerStatus(currentStatus) : null;
    const msg = orderStatus.transitionStatus(conversationId, newStatus);
    if (msg) {
      const newCustomerStatus = toCustomerStatus(newStatus);
      // Only notify in chat if the customer-facing status actually changed
      if (newCustomerStatus !== prevCustomerStatus) {
        addSystemMessage(`📌 Order status: ${customerStatusLabels[newCustomerStatus]}`);
      }
      // When success: auto-credit wallet
      if (newStatus === "success") {
        addSystemMessage(`💰 Funds credited to customer's wallet`);
      }
    }
  };

  const handleCreateOrderFromChat = () => {
    if (!selectedId) return;
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    orderStatus.createOrder(selectedId, orderId);
    addSystemMessage(`📌 Order status: ${customerStatusLabels["order_created"]}`);
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarred(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleOrderComplete = (order: CompletedOrder) => {
    setCompletedOrders(prev => [order, ...prev]);
    if (selectedId) {
      orderStatus.createOrder(selectedId, order.orderId);
      addSystemMessage(`📌 Order status: ${customerStatusLabels["order_created"]}`);
      setActiveTab("trading");
    }
  };

  const addToGroup = (user: (typeof adminUsers)[0]) => {
    if (groupMembers.find(m => m.id === user.id)) return;
    setGroupMembers(prev => [...prev, user]);
    addSystemMessage(`${user.name} (${ROLE_META[user.role]?.label || user.role}) has joined the chat`);
    setEscalateOpen(false);
  };

  const removeFromGroup = (userId: number) => {
    const user = groupMembers.find(m => m.id === userId);
    if (!user) return;
    setGroupMembers(prev => prev.filter(m => m.id !== userId));
    addSystemMessage(`${user.name} has left the chat`);
  };

  const handleReassign = () => {
    if (!reassignTarget) return;
    addSystemMessage(`Customer reassigned from You to ${reassignTarget.name}`);
    setReassignTarget(null);
    setReassignOpen(false);
  };

  const allOrders = [
    ...completedOrders.map(o => ({
      id: o.orderId, cardType: o.cards.map(c => c.cardType).join(", "),
      denomination: `${o.cards.length} cards`, amount: o.totalFaceValue,
      nairaRate: 1580, unitPrice: 0, status: o.status as string,
      payout: o.totalPayout, bank: o.bank, bankAccount: o.bankAccount,
      timestamp: o.timestamp, isNew: true,
    })),
    ...orders.map(o => ({
      ...o, payout: o.amount * o.unitPrice, bank: "", bankAccount: "",
      timestamp: o.created, isNew: false,
    })),
  ];

  const selectedOrder = selectedOrderId ? allOrders.find(o => o.id === selectedOrderId) : null;

  const handleExecuteTransfer = (orderId: string, payout: number) => {
    setTransferCompletedOrders(prev => new Set(prev).add(orderId));
    setPaymentOrderId(null);
    setSelectedBankId(null);
    addSystemMessage(`💰 ₦${payout.toLocaleString()} credited to customer's wallet`);
  };

  const getSenderColor = (sender: string, senderName: string) => {
    if (sender === "customer") return "text-primary";
    if (senderName === "You") return "text-accent";
    const colors = ["text-orange-500", "text-emerald-500", "text-violet-500", "text-rose-500"];
    const idx = groupMembers.findIndex(m => m.name === senderName);
    return colors[idx % colors.length] || "text-accent";
  };

  // Current order status for selected conversation
  const currentOrderStatus = selectedId ? orderStatus.getStatus(selectedId) : null;
  const currentOrderId = selectedId ? orderStatus.getOrderId(selectedId) : null;

  // Handle buyer selection callback from OrderWizardModal
  const handleBuyerSelected = (conversationId: string) => {
    // Skip pending and go directly to in_trade so the agent can act immediately
    orderStatus.transitionStatus(conversationId, "pending");
    // Use a microtask to ensure state updates, then advance
    setTimeout(() => {
      orderStatus.transitionStatus(conversationId, "in_trade");
    }, 500);
  };

  // Status action buttons renderer
  const renderStatusActions = () => {
    if (!selectedId || !currentOrderStatus) return null;

    switch (currentOrderStatus) {
      case "pending_sale":
        return (
          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-xs font-medium text-warning mb-2">⏳ Pending Sale</p>
            <p className="text-[10px] text-muted-foreground mb-2">Select a buyer from the Sales Order panel to proceed.</p>
            <Button size="sm" className="w-full h-7 text-xs" onClick={() => setRightTab("sales")}>
              Open Sales Order Panel
            </Button>
          </div>
        );
      case "pending":
        return (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs font-medium text-primary">⏳ Waiting for buyer...</p>
            <p className="text-[10px] text-muted-foreground mt-1">The buyer is reviewing the order.</p>
          </div>
        );
      case "in_trade":
        return (
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
            <p className="text-xs font-medium">🔄 In Trade — Card Decision</p>
            <p className="text-[10px] text-muted-foreground">The buyer has received the order. What's the result?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-success text-success-foreground hover:bg-success/90"
                onClick={() => handleStatusTransition(selectedId, "success")}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Good Card ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-warning text-warning hover:bg-warning/10"
                onClick={() => handleStatusTransition(selectedId, "negotiation")}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Bad Card — Negotiate
              </Button>
            </div>
          </div>
        );
      case "negotiation":
        return (
          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg space-y-2">
            <p className="text-xs font-medium text-warning">⚠️ Negotiation in Progress</p>
            <p className="text-[10px] text-muted-foreground">The card was flagged. What's the negotiation result?</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-success text-success-foreground hover:bg-success/90"
                onClick={() => handleStatusTransition(selectedId, "success")}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Successful ✓
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 h-8 text-xs"
                onClick={() => handleStatusTransition(selectedId, "order_cancelled")}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Failed ✗
              </Button>
            </div>
          </div>
        );
      case "order_cancelled":
        return (
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-xs font-medium text-destructive">❌ Order Cancelled</p>
            <p className="text-[10px] text-muted-foreground mt-1">Negotiation failed. This order has been cancelled.</p>
          </div>
        );
      case "success":
        return (
          <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-xs font-medium text-success">✅ Trade Successful — Wallet Credited</p>
            <p className="text-[10px] text-muted-foreground mt-1">Funds have been credited to the customer's wallet.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Full-width tab headers */}
        <div className="flex shrink-0">
          {columns.map(col => {
            const isActive = activeTab === col.id;
            const count = tabCounts[col.id] || 0;
            const unreadCount = tabUnreadCounts[col.id] || 0;
            return (
              <button
                key={col.id}
                onClick={() => setActiveTab(col.id)}
                className={`relative flex-1 py-3 text-sm font-bold text-center transition-colors ${
                  isActive ? `${col.activeBg} ${col.color}` : `${col.bg} ${col.color} opacity-80 hover:opacity-100`
                }`}
              >
                {col.label} ({count})
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Below: customer list | chat | orders */}
        <div className="flex flex-1 min-h-0">
          {/* Left panel: customer list */}
          <div className="w-[25%] min-w-[240px] max-w-[336px] shrink-0 border-r flex flex-col">
            {/* Search bar */}
            <div className="px-2 border-b shrink-0 h-12 flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8 h-8 text-xs"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map(c => {
                const isActive = selectedId === c.id;
                const isStarred = starred.has(c.id);
                const cStatus = orderStatus.getStatus(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full text-left p-3 border-b hover:bg-muted/50 transition-colors ${
                      isActive ? "bg-accent/5 border-l-2 border-l-accent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {c.alias.slice(-2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{c.alias}</span>
                          <div className="flex items-center gap-1">
                            {cStatus && (
                              <span className={`text-[8px] font-medium px-1 py-0.5 rounded ${agentStatusStyles[cStatus].bg} ${agentStatusStyles[cStatus].color}`}>
                                {agentStatusLabels[cStatus]}
                              </span>
                            )}
                            {isStarred && <Star className="w-3 h-3 text-warning fill-warning" />}
                            <span className="text-[10px] text-muted-foreground">{c.time}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-semibold shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    {(hoveredId === c.id || isStarred) && (
                      <div className="flex justify-end mt-1">
                        <button onClick={(e) => toggleStar(e, c.id)} className="text-muted-foreground hover:text-warning transition-colors">
                          <Star className={`w-3 h-3 ${isStarred ? "text-warning fill-warning" : ""}`} />
                        </button>
                      </div>
                    )}
                  </button>
                );
              })}
              {filteredConversations.length === 0 && (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                  No conversations
                </div>
              )}
            </div>
          </div>

        {/* Middle: Chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedId && selectedConvo ? (
            <>
              <header className="flex items-center justify-between px-5 border-b bg-card shrink-0 h-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {selectedConvo.alias.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{selectedConvo.alias}</p>
                      {currentOrderStatus && (
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${agentStatusStyles[currentOrderStatus].bg} ${agentStatusStyles[currentOrderStatus].color}`}>
                          {agentStatusLabels[currentOrderStatus]}
                        </span>
                      )}
                      {isGroupChat && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" /> Group · {groupMembers.length + 2}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {isGroupChat
                        ? `You, ${groupMembers.map(m => m.name).join(", ")}, ${selectedConvo.alias}`
                        : `${selectedConvo.goodRate}% rate · ${selectedConvo.totalValue} total`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">TTV</span>
                      <span className="text-[10px] font-bold text-foreground">₦4,850,000</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                          <p className="font-semibold">Total Transaction Volume</p>
                          <p className="text-muted-foreground">Lifetime transaction total for this customer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">TMTV</span>
                      <span className="text-[10px] font-bold text-foreground">₦1,250,000</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                          <p className="font-semibold">Total Monthly Transaction Volume</p>
                          <p className="text-muted-foreground">Transaction total for this customer in the current month</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

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
                                Reassign <strong>{selectedConvo.alias}</strong> to <strong>{reassignTarget.name}</strong>?
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

              {/* Messages */}
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
                        <p className={`text-[9px] font-semibold mb-0.5 ${getSenderColor(msg.sender, msg.senderName)}`}>
                          {msg.senderName}
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

              {/* Chat input */}
              <div className="border-t bg-card shrink-0">
                <div className="flex flex-col gap-2 px-4 py-3">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full rounded-md border-0 bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    style={{ height: "7rem" }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                        e.preventDefault();
                        const newMsg: ChatMessage = {
                          id: Date.now(), sender: "agent", senderName: "You",
                          text: message.trim(),
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        };
                        setLocalMessages(prev => [...prev, newMsg]);
                        setMessage("");
                      }
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-chat-image"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const newMsg: ChatMessage = {
                          id: Date.now(), sender: "agent", senderName: "You",
                          text: file.name, image: true,
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        };
                        setLocalMessages(prev => [...prev, newMsg]);
                      }
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => document.getElementById("admin-chat-image")?.click()}
                        className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title="Send image"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            title="Emoji"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start" side="top">
                          <div className="grid grid-cols-8 gap-1">
                            {["😀","😂","😍","👍","🎉","🔥","✅","❤️","😊","🙏","💯","😎","👏","💪","⭐","😢"].map(emoji => (
                              <button
                                key={emoji}
                                className="text-xl hover:bg-muted rounded p-1 transition-colors"
                                onClick={() => setMessage(prev => prev + emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      {!currentOrderStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCreateOrderFromChat}
                          className="h-8 text-xs gap-1 text-accent border-accent/30 hover:bg-accent/10"
                        >
                          <FileTextIcon className="w-3.5 h-3.5" /> Create Order
                        </Button>
                      )}
                      <button
                        className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0"
                        onClick={() => {
                          if (message.trim()) {
                            const newMsg: ChatMessage = {
                              id: Date.now(), sender: "agent", senderName: "You",
                              text: message.trim(),
                              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            };
                            setLocalMessages(prev => [...prev, newMsg]);
                            setMessage("");
                          }
                        }}
                      >
                        <Send className="w-4 h-4 text-accent-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Choose a customer from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Tabbed Orders & Sales Order */}
        <div className="w-[35%] min-w-[320px] max-w-[504px] border-l bg-card flex flex-col h-full shrink-0 overflow-hidden hidden xl:flex">
          <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b bg-muted/30 h-12 p-0">
              <TabsTrigger value="orders" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
                Orders
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
                Sales Order
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="flex-1 overflow-y-auto mt-0">
              {selectedId && selectedConvo ? (
                <>
                  {/* Status action buttons */}
                  {currentOrderStatus && (
                    <div className="p-4 border-b">
                      <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                        Order Status
                        {currentOrderId && <span className="text-[10px] text-muted-foreground font-normal">#{currentOrderId}</span>}
                      </h3>
                      {renderStatusActions()}
                    </div>
                  )}

                  {/* Orders */}
                  <div className="p-4 border-b">
                    <h3 className="font-heading font-semibold text-sm mb-3">Orders ({allOrders.length})</h3>
                    <div className="space-y-1.5">
                      {allOrders.map(o => {
                        const isSelected = selectedOrderId === o.id;
                        return (
                          <div key={o.id}>
                            <button
                              onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                              className={`w-full text-left rounded-lg p-2.5 transition-colors ${
                                isSelected ? "bg-accent/10 border border-accent/30" : "bg-muted hover:bg-muted/80 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-semibold">{o.id}</span>
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {o.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{o.cardType}</span>
                                <span>${o.amount}</span>
                              </div>
                            </button>
                            {isSelected && (
                              <div className="mt-1.5 rounded-lg border border-accent/20 bg-card p-3 space-y-2">
                                <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">Order Details</h4>
                                <div className="space-y-1.5">
                                  {[
                                    ["Order ID", o.id],
                                    ["Card", o.cardType],
                                    ["Denomination", o.denomination],
                                    ["Amount", `$${o.amount}`],
                                    ["Naira Rate", `₦${o.nairaRate.toLocaleString()}`],
                                    ["Payout", `₦${o.payout.toLocaleString()}`],
                                    ...(o.bank ? [["Bank", `${o.bank} ${o.bankAccount}`]] : []),
                                    ["Time", o.timestamp],
                                  ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{k}</span>
                                      <span className="font-medium">{v}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Wallet credit indicator */}
                                {currentOrderStatus === "success" && (
                                  <div className="mt-2 bg-success/10 border border-success/30 rounded-lg p-2.5 text-center">
                                    <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
                                    <p className="text-xs font-medium text-success">Wallet Credited</p>
                                    <p className="text-[10px] text-muted-foreground">₦{o.payout.toLocaleString()} added to customer's wallet</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bank accounts */}
                  <div className="p-4 border-b">
                    <h3 className="font-heading font-semibold text-sm mb-3">Verified Bank Accounts</h3>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alias</span>
                        <span className="font-medium">{selectedConvo.alias}</span>
                      </div>
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
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Name</span><span className="font-medium">John Adebayo Doe</span></div>
                              <div className="flex justify-between text-[11px]"><span className="text-muted-foreground">Email</span><span className="font-medium">john.doe@email.com</span></div>
                              <div className="flex items-center gap-1 text-[10px] text-warning mt-1">
                                <AlertTriangle className="w-3 h-3" /><span>This access is logged</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between"><span className="text-muted-foreground">Good Rate</span><span className="font-medium">{selectedConvo.goodRate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Monthly Value</span><span className="font-medium">{selectedConvo.totalValue}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tags</span><span className="font-medium">{selectedConvo.tags.join(", ") || "None"}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                  <p className="text-xs text-center">Select a conversation to view orders</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales" className="flex-1 overflow-hidden mt-0">
              <CardlightPanel
                open={rightTab === "sales"}
                onClose={() => setRightTab("orders")}
                onComplete={handleOrderComplete}
                customerAlias={selectedConvo?.alias}
                embedded
                onBuyerSelected={selectedId ? () => handleBuyerSelected(selectedId) : undefined}
              />
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
