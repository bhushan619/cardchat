import { useState, useMemo, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  conversations as rawConversations,
  chatMessages,
  orders,
  adminUsers,
  customerWallets,
  walletTransactions,
  type FundAdjustment,
} from "@/data/mock";
import {
  MessageCircle,
  Star,
  Send,
  Image,
  MoreVertical,
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  Shield,
  X,
  Banknote,
  Eye,
  EyeOff,
  AlertTriangle,
  UserCheck,
  Smile,
  FileText as FileTextIcon,
  Info,
  CreditCard,
  Copy,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  Wallet,
  Lock,
  Paperclip,
  ZoomIn,
  ZoomOut,
  ScanText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import CardlightPanel, {
  type CompletedOrder,
  cardlightResultMeta,
  type CardlightResult,
} from "@/components/admin/OrderWizardModal";
import ChannelBadge from "@/components/admin/ChannelBadge";
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
import { verifyPin } from "@/lib/securePin";

const columns = [
  {
    id: "consulting",
    label: "Consulting",
    color: "text-white",
    bg: "bg-gradient-to-r from-amber-500 to-orange-400",
    activeBg: "bg-gradient-to-r from-amber-600 to-orange-500",
  },
  {
    id: "trading",
    label: "Trading",
    color: "text-white",
    bg: "bg-gradient-to-r from-emerald-500 to-teal-400",
    activeBg: "bg-gradient-to-r from-emerald-600 to-teal-500",
  },
];

const escalatableUsers = adminUsers.filter((u) => u.role === "super_admin" || u.role === "team_lead");

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
  imageUrl?: string;
  isOrder?: boolean;
};

const MOCK_OCR_CODES = ["XJVK-2P9M-4QHR-7TLB", "X7N3-9LMK-2WQV-8CHP", "AAPL-4827-9QXR-1NMV"];

export default function AdminMessages() {
  const { role } = useAdminRole();
  const orderStatus = useOrderStatus();
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Chat state
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<string>("orders");
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>(() => {
    try {
      const saved = sessionStorage.getItem("cardchat_completed_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<typeof adminUsers>([]);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<(typeof adminUsers)[0] | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [transferCompletedOrders, setTransferCompletedOrders] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem("cardchat_transfer_completed");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [cardlightResults, setCardlightResults] = useState<Record<string, CardlightResult>>(() => {
    try {
      const saved = sessionStorage.getItem("cardchat_cardlight_results");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist completedOrders, transferCompletedOrders and CardLight results
  useEffect(() => {
    sessionStorage.setItem("cardchat_completed_orders", JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    sessionStorage.setItem("cardchat_transfer_completed", JSON.stringify([...transferCompletedOrders]));
  }, [transferCompletedOrders]);

  useEffect(() => {
    sessionStorage.setItem("cardchat_cardlight_results", JSON.stringify(cardlightResults));
  }, [cardlightResults]);

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(
    chatMessages.map((m) => ({
      ...m,
      senderName: m.sender === "customer" ? "A7X3KP" : m.sender === "agent" ? "You" : "System",
    })),
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newMsg: ChatMessage = {
        id: Date.now(),
        sender: "agent",
        senderName: "You",
        text: "",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        image: true,
        imageUrl: reader.result as string,
      };
      setLocalMessages((prev) => [...prev, newMsg]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openViewer = (url: string) => {
    setViewerImage(url);
    setViewerZoom(1);
    setOcrText(null);
  };
  const handleExtractText = () => {
    setOcrLoading(true);
    setTimeout(() => {
      const code = MOCK_OCR_CODES[Math.floor(Math.random() * MOCK_OCR_CODES.length)];
      setOcrText(code);
      setOcrLoading(false);
      navigator.clipboard.writeText(code).catch(() => {});
      toast.success("Card code extracted & copied");
    }, 1200);
  };

  const selectedConvo = rawConversations.find((c) => c.id === selectedId);
  const isGroupChat = groupMembers.length > 0;
  const canReassign = role === "super_admin" || role === "team_lead";

  // Dynamic tab assignment based on order status
  const conversationsWithTabs = useMemo(() => {
    return rawConversations.map((c) => ({
      ...c,
      dynamicTab: orderStatus.getConversationTab(c.id),
    }));
  }, [orderStatus]);

  const [activeTab, setActiveTab] = useState("consulting");
  const [customerSearch, setCustomerSearch] = useState("");

  const filteredConversations = useMemo(() => {
    return conversationsWithTabs.filter((c) => {
      const matchesTab = c.dynamicTab === activeTab;
      const matchesSearch =
        !customerSearch ||
        c.alias.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(customerSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversationsWithTabs, activeTab, customerSearch]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { consulting: 0, trading: 0 };
    conversationsWithTabs.forEach((c) => {
      counts[c.dynamicTab] = (counts[c.dynamicTab] || 0) + 1;
    });
    return counts;
  }, [conversationsWithTabs]);

  const tabUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = { consulting: 0, trading: 0 };
    conversationsWithTabs.forEach((c) => {
      if (c.unread > 0) counts[c.dynamicTab] += c.unread;
    });
    return counts;
  }, [conversationsWithTabs]);

  // Helper: add system message
  const addSystemMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
    };
    setLocalMessages((prev) => [...prev, newMsg]);
  };

  // Order status actions — only send chat message when customer-visible status changes
  const handleStatusTransition = (conversationId: string, newStatus: AgentOrderStatus, payoutAmount?: number) => {
    const currentStatus = orderStatus.getStatus(conversationId);
    const prevCustomerStatus = currentStatus ? toCustomerStatus(currentStatus) : null;
    const msg = orderStatus.transitionStatus(conversationId, newStatus);
    if (msg) {
      const newCustomerStatus = toCustomerStatus(newStatus);
      // Only notify in chat if the customer-facing status actually changed
      if (newCustomerStatus !== prevCustomerStatus) {
        addSystemMessage(`📌 Order status: ${customerStatusLabels[newCustomerStatus]}`);
      }
      // When success: auto-credit wallet with specific amount
      if (newStatus === "success" && payoutAmount) {
        // Agent sees detailed credit message
        addSystemMessage(`📌 💰 Funds credited to customer's wallet — ₦${payoutAmount.toLocaleString()}`);
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
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleOrderComplete = (order: CompletedOrder) => {
    setCompletedOrders((prev) => [order, ...prev]);
    if (selectedId) {
      orderStatus.createOrder(selectedId, order.orderId);
      addSystemMessage(`📌 Order status: ${customerStatusLabels["order_created"]}`);
    }
  };

  const addToGroup = (user: (typeof adminUsers)[0]) => {
    if (groupMembers.find((m) => m.id === user.id)) return;
    setGroupMembers((prev) => [...prev, user]);
    addSystemMessage(`${user.name} (${ROLE_META[user.role]?.label || user.role}) has joined the chat`);
    setEscalateOpen(false);
  };

  const removeFromGroup = (userId: number) => {
    const user = groupMembers.find((m) => m.id === userId);
    if (!user) return;
    setGroupMembers((prev) => prev.filter((m) => m.id !== userId));
    addSystemMessage(`${user.name} has left the chat`);
  };

  const handleReassign = () => {
    if (!reassignTarget) return;
    addSystemMessage(`Customer reassigned from You to ${reassignTarget.name}`);
    setReassignTarget(null);
    setReassignOpen(false);
  };

  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    desc: string;
    onConfirm: () => void;
  } | null>(null);

  // Negotiate modal state
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negotiateDenom, setNegotiateDenom] = useState("");
  const [negotiateRate, setNegotiateRate] = useState("");

  // Track negotiation data per order: orderId -> { oldAmount, oldDenom, oldRate, newDenom, newRate, newAmount }
  const [negotiationData, setNegotiationData] = useState<
    Record<
      string,
      {
        oldDenom: number;
        oldRate: number;
        oldAmount: number;
        newDenom: number;
        newRate: number;
        newAmount: number;
      }
    >
  >({});

  // Fund adjustment state
  const [fundAdjustOpen, setFundAdjustOpen] = useState(false);
  const [fundAdjustType, setFundAdjustType] = useState<"addition" | "deduction">("addition");
  const [fundAdjustAmount, setFundAdjustAmount] = useState("");
  const [fundAdjustReason, setFundAdjustReason] = useState("");
  const [fundPinStep, setFundPinStep] = useState(false);
  const [fundPin, setFundPin] = useState("");
  const [fundAdjustOrderId, setFundAdjustOrderId] = useState("none");
  const [fundAdjustments, setFundAdjustments] = useState<FundAdjustment[]>(() => {
    try {
      const saved = sessionStorage.getItem("cardchat_fund_adjustments");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    sessionStorage.setItem("cardchat_fund_adjustments", JSON.stringify(fundAdjustments));
  }, [fundAdjustments]);

  const canAdjustFunds = role === "super_admin" || role === "team_lead";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const allOrders = [
    ...completedOrders.map((o) => ({
      id: o.orderId,
      cardType: o.cards.map((c) => c.cardType).join(", "),
      amount: o.totalFaceValue,
      nairaRate: 289,
      unitPrice: o.cr2 || 0,
      status: o.status as string,
      payout: o.totalPayout,
      bank: o.bank,
      bankAccount: o.bankAccount,
      timestamp: o.timestamp,
      isNew: true,
      cardCurrency: o.cardCurrency || "",
      cardNumbers: o.cardNumbers || [],
      createdAt: o.timestamp,
    })),
    ...orders.map((o) => ({
      ...o,
      payout: o.amount * o.unitPrice,
      bank: "",
      bankAccount: "",
      timestamp: o.created,
      isNew: false,
      cardCurrency: o.cardType?.includes("UK") ? "GBP" : "USD",
      cardNumbers: [`${Math.floor(Math.random() * 9000000000 + 1000000000)}`],
      createdAt: o.created,
    })),
  ];

  const selectedOrder = selectedOrderId ? allOrders.find((o) => o.id === selectedOrderId) : null;

  const handleExecuteTransfer = (orderId: string, payout: number) => {
    setTransferCompletedOrders((prev) => new Set(prev).add(orderId));
    setPaymentOrderId(null);
    setSelectedBankId(null);
    addSystemMessage(`💰 ₦${payout.toLocaleString()} credited to customer's wallet`);
  };

  const getSenderColor = (sender: string, senderName: string) => {
    if (sender === "customer") return "text-primary";
    if (senderName === "You") return "text-accent";
    const colors = ["text-orange-500", "text-emerald-500", "text-violet-500", "text-rose-500"];
    const idx = groupMembers.findIndex((m) => m.name === senderName);
    return colors[idx % colors.length] || "text-accent";
  };

  // Auto-seed order status from mock orders when selecting a conversation
  useEffect(() => {
    if (!selectedId) return;
    const existing = orderStatus.getStatus(selectedId);
    if (existing) return; // already has a status, don't override

    // Find the first mock order matching this conversation's customer alias
    const convo = rawConversations.find((c) => c.id === selectedId);
    if (!convo) return;
    const mockOrder = orders.find((o) => o.customer === convo.alias);
    if (!mockOrder) return;

    // Map mock status to AgentOrderStatus
    const statusMap: Record<string, AgentOrderStatus> = {
      success: "success",
      in_trade: "in_trade",
      order_cancelled: "order_cancelled",
    };
    const mappedStatus = statusMap[mockOrder.status];
    if (!mappedStatus) return;

    // Seed the order through the required transitions
    orderStatus.createOrder(selectedId, mockOrder.id);
    if (mappedStatus === "in_trade" || mappedStatus === "success" || mappedStatus === "order_cancelled") {
      setTimeout(() => {
        orderStatus.transitionStatus(selectedId, "pending");
        setTimeout(() => {
          orderStatus.transitionStatus(selectedId, "in_trade");
          if (mappedStatus === "success") {
            setTimeout(() => orderStatus.transitionStatus(selectedId, "success"), 50);
          } else if (mappedStatus === "order_cancelled") {
            setTimeout(() => orderStatus.transitionStatus(selectedId, "order_cancelled"), 50);
          }
        }, 50);
      }, 50);
    }
  }, [selectedId]);

  // Current order status for selected conversation
  const currentOrderStatus = selectedId ? orderStatus.getStatus(selectedId) : null;
  const currentOrderId = selectedId ? orderStatus.getOrderId(selectedId) : null;

  const simulateCardlightWebhook = (orderId: string, simulatedResult?: CardlightResult) => {
    setCardlightResults((prev) => ({ ...prev, [orderId]: "pending" }));
    const webhookDelay = 3000 + Math.random() * 3000;
    setTimeout(() => {
      const results: CardlightResult[] = ["successful", "negotiate"];
      const resolvedResult: CardlightResult =
        simulatedResult && simulatedResult !== "pending"
          ? simulatedResult
          : results[Math.floor(Math.random() * results.length)];
      setCardlightResults((prev) => ({ ...prev, [orderId]: resolvedResult }));
    }, webhookDelay);
  };

  // Handle buyer selection callback from OrderWizardModal
  const handleBuyerSelected = (conversationId: string, simulatedResult?: CardlightResult) => {
    // Skip pending and go directly to in_trade so the agent can act immediately
    orderStatus.transitionStatus(conversationId, "pending");
    const linkedOrderId = orderStatus.getOrderId(conversationId);
    if (linkedOrderId) {
      simulateCardlightWebhook(linkedOrderId, simulatedResult);
    }
    // Use a microtask to ensure state updates, then advance
    setTimeout(() => {
      orderStatus.transitionStatus(conversationId, "in_trade");
    }, 500);
  };

  // Unified status + card info renderer
  const renderStatusActions = () => {
    if (!selectedId || !currentOrderStatus) return null;
    const statusOrder = currentOrderId ? allOrders.find((o) => o.id === currentOrderId) : null;
    const fallbackCardlightResult: CardlightResult | undefined =
      currentOrderStatus === "success" ? "successful" : currentOrderStatus === "in_trade" ? "pending" : undefined;
    const cardlightResult = currentOrderId
      ? (cardlightResults[currentOrderId] ?? fallbackCardlightResult)
      : fallbackCardlightResult;
    const cardlightMeta = cardlightResult ? cardlightResultMeta[cardlightResult] : null;

    // Status header info
    const statusHeader = () => {
      switch (currentOrderStatus) {
        case "pending_sale":
          return {
            icon: "⏳",
            title: "Pending Sale",
            desc: "Select a buyer from the Sales Order panel to proceed.",
            colorClass: "text-warning",
          };
        case "pending":
          return {
            icon: "⏳",
            title: "Waiting for buyer...",
            desc: "The buyer is reviewing the order.",
            colorClass: "text-primary",
          };
        case "in_trade":
          return {
            icon: "🔄",
            title: "In Trade — Card Decision",
            desc: "The buyer has received the order. What's the result?",
            colorClass: "text-foreground",
          };
        case "order_cancelled":
          return {
            icon: "❌",
            title: "Order Cancelled",
            desc: "This order has been cancelled.",
            colorClass: "text-destructive",
          };
        case "success":
          return {
            icon: "✅",
            title: "Trade Successful — Wallet Credited",
            desc: "Funds have been credited to the customer's wallet.",
            colorClass: "text-success",
          };
      }
    };

    const header = statusHeader();
    if (!header) return null;

    // Action buttons per status
    const renderActionButtons = () => {
      switch (currentOrderStatus) {
        case "pending_sale":
          return (
            <Button size="sm" className="w-full h-7 text-xs" onClick={() => setRightTab("sales")}>
              Open Sales Order Panel
            </Button>
          );
        case "in_trade":
          if (!cardlightResult || cardlightResult === "pending") return null;
          if (cardlightResult === "successful") {
            // Successful → show Details and Confirm
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => statusOrder && setDetailOrderId(statusOrder.id)}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-success text-success-foreground hover:bg-success/90"
                  onClick={() =>
                    setConfirmAction({
                      type: "good_card",
                      title: "Confirm Successful Trade",
                      desc: `This will mark the order as successful and credit ₦${statusOrder?.payout.toLocaleString() || "0"} to the customer's wallet.`,
                      onConfirm: () => {
                        handleStatusTransition(selectedId, "success", statusOrder?.payout);
                        setConfirmAction(null);
                      },
                    })
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                </Button>
              </div>
            );
          }
          // negotiate → show Details and Agree
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => statusOrder && setDetailOrderId(statusOrder.id)}
              >
                Details
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setNegotiateDenom("");
                  setNegotiateRate("");
                  setNegotiateOpen(true);
                }}
              >
                Agree
              </Button>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        className={`border border-border rounded-lg overflow-hidden transition-colors ${cardlightMeta ? cardlightMeta.rowBg : ""}`}
      >
        {/* Status header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-xs font-medium ${header.colorClass}`}>
              {header.icon} {header.title}
            </p>
            {cardlightMeta && (
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${cardlightMeta.bg} ${cardlightMeta.color}`}
              >
                {cardlightMeta.label}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{header.desc}</p>
        </div>

        {/* Card info */}
        {statusOrder && (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">
                  {statusOrder.cardType}{" "}
                  {statusOrder.cardCurrency && (
                    <span className="text-muted-foreground font-normal">/ {statusOrder.cardCurrency}</span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                {statusOrder.cardNumbers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs justify-end">
                    <span className="font-mono text-foreground font-medium">{statusOrder.cardNumbers.join(", ")}</span>
                    <button
                      onClick={() => handleCopy(statusOrder.cardNumbers.join(", "), "status-cn")}
                      className="text-muted-foreground hover:text-primary shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copyFeedback === "status-cn" && <span className="text-[9px] text-success">Copied!</span>}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs justify-end">
                  <span className="font-mono text-foreground font-medium">#{statusOrder.id}</span>
                  <button
                    onClick={() => handleCopy(statusOrder.id, "status-oid")}
                    className="text-muted-foreground hover:text-primary shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copyFeedback === "status-oid" && <span className="text-[9px] text-success">Copied!</span>}
                </div>
              </div>
            </div>

            {(() => {
              const neg = currentOrderId ? negotiationData[currentOrderId] : null;
              const currSym = statusOrder.cardCurrency === "GBP" ? "£" : "$";
              if (neg) {
                return (
                  <>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Amount</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-[10px]">
                          {currSym}
                          {neg.oldDenom.toLocaleString()}
                        </span>
                        <span className="font-medium text-warning">
                          {currSym}
                          {neg.newDenom.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Card Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-[10px]">
                          ₦{neg.oldRate.toLocaleString()}
                        </span>
                        <span className="font-medium text-warning">₦{neg.newRate.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-1">
                      <span className="text-muted-foreground font-medium">Total Payout</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-[10px]">
                          ₦{neg.oldAmount.toLocaleString()}
                        </span>
                        <span className="font-bold text-warning">₦{neg.newAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                );
              }
              return (
                <>
                  {[
                    ["Amount", `${currSym}${statusOrder.amount.toLocaleString()}`],
                    ["Card Rate", `₦${(statusOrder.unitPrice || statusOrder.nairaRate).toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-1">
                    <span className="text-muted-foreground font-medium">Total Payout</span>
                    <span className="font-bold text-primary">₦{statusOrder.payout.toLocaleString()}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Bottom row: action buttons */}
        <div className="p-3 border-t border-border">{renderActionButtons()}</div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Full-width tab headers */}
        <div className="flex shrink-0">
          {columns.map((col) => {
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
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((c) => {
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
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.alias.slice(-2)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                            c.channel === "whatsapp" ? "bg-emerald-500" : "bg-primary"
                          }`}
                          title={c.channel === "whatsapp" ? "Messaging via WhatsApp" : "Messaging via in-app chat"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold truncate">{c.alias}</span>
                            <ChannelBadge channel={c.channel} size="xs" showLabel={false} />
                          </div>
                          <div className="flex items-center gap-1">
                            {cStatus && (
                              <span
                                className={`text-[8px] font-medium px-1 py-0.5 rounded ${agentStatusStyles[cStatus].bg} ${agentStatusStyles[cStatus].color}`}
                              >
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
                        <button
                          onClick={(e) => toggleStar(e, c.id)}
                          className="text-muted-foreground hover:text-warning transition-colors"
                        >
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
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold whitespace-nowrap">{selectedConvo.alias}</p>
                        <ChannelBadge channel={selectedConvo.channel} size="xs" showLabel={false} />
                        {isGroupChat && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5 whitespace-nowrap leading-none">
                            <Users className="w-2.5 h-2.5" /> Group · {groupMembers.length + 2}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {isGroupChat
                          ? `You, ${groupMembers.map((m) => m.name).join(", ")}, ${selectedConvo.alias}`
                          : `${selectedConvo.goodRate}% rate · ${selectedConvo.totalValue} total`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <div className="flex flex-col gap-0.5 leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-9">TTV</span>
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
                          <span className="text-[10px] font-semibold text-muted-foreground w-9">TMTV</span>
                          <span className="text-[10px] font-bold text-foreground">₦1,250,000</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                              <p className="font-semibold">Total Monthly Transaction Volume</p>
                              <p className="text-muted-foreground">
                                Transaction total for this customer in the current month
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TooltipProvider>

                    {canReassign && (
                      <Popover open={reassignOpen} onOpenChange={setReassignOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 text-warning border-warning/30 hover:bg-warning/10 hover:text-warning"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Reassign
                          </Button>
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
                                  Reassign <strong>{selectedConvo.alias}</strong> to{" "}
                                  <strong>{reassignTarget.name}</strong>?
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Full chat history and order context will be transferred.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-7 text-xs"
                                  onClick={() => setReassignTarget(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 h-7 text-xs bg-warning text-warning-foreground hover:bg-warning/90"
                                  onClick={handleReassign}
                                >
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-1.5 space-y-0.5">
                              {adminUsers
                                .filter((u) => u.role === "agent")
                                .map((agent) => (
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
                          {escalatableUsers.map((user) => {
                            const alreadyAdded = groupMembers.some((m) => m.id === user.id);
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
                                  <p className="text-[10px] text-muted-foreground">
                                    {roleMeta?.label} · {user.status}
                                  </p>
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
                    <button>
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </header>

                {/* Group members bar */}
                {isGroupChat && (
                  <div className="flex items-center gap-1.5 px-5 py-2 border-b bg-muted/30 shrink-0 overflow-x-auto">
                    <span className="text-[10px] text-muted-foreground shrink-0">Members:</span>
                    {groupMembers.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0"
                      >
                        {m.name}
                        <button onClick={() => removeFromGroup(m.id)} className="hover:text-destructive">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {localMessages.map((msg) => {
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
                          <p
                            className={`text-[9px] font-semibold mb-0.5 ${getSenderColor(msg.sender, msg.senderName)}`}
                          >
                            {msg.senderName}
                          </p>
                          {msg.image ? (
                            msg.imageUrl ? (
                              <button
                                onClick={() => openViewer(msg.imageUrl!)}
                                className="group relative block rounded-lg overflow-hidden"
                              >
                                <img
                                  src={msg.imageUrl}
                                  alt="attachment"
                                  className="max-w-[12rem] max-h-40 object-cover"
                                />
                                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                                </span>
                              </button>
                            ) : (
                              <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                                <Image className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground ml-1">Card Image</span>
                              </div>
                            )
                          ) : (
                            <p>{msg.text}</p>
                          )}
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
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full rounded-md border-0 bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      style={{ height: "7rem" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                          e.preventDefault();
                          const newMsg: ChatMessage = {
                            id: Date.now(),
                            sender: "agent",
                            senderName: "You",
                            text: message.trim(),
                            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          };
                          setLocalMessages((prev) => [...prev, newMsg]);
                          setMessage("");
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title="Attach image"
                        >
                          <Paperclip className="w-4 h-4" />
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
                              {[
                                "😀",
                                "😂",
                                "😍",
                                "👍",
                                "🎉",
                                "🔥",
                                "✅",
                                "❤️",
                                "😊",
                                "🙏",
                                "💯",
                                "😎",
                                "👏",
                                "💪",
                                "⭐",
                                "😢",
                              ].map((emoji) => (
                                <button
                                  key={emoji}
                                  className="text-xl hover:bg-muted rounded p-1 transition-colors"
                                  onClick={() => setMessage((prev) => prev + emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex items-center gap-2">
                        {canAdjustFunds && selectedConvo && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFundAdjustType("addition");
                              setFundAdjustAmount("");
                              setFundAdjustReason("");
                              setFundAdjustOpen(true);
                            }}
                            className="h-8 text-xs gap-1 text-warning border-warning/30 hover:bg-warning/10"
                          >
                            <Wallet className="w-3.5 h-3.5" /> Fund +/-
                          </Button>
                        )}
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
                                id: Date.now(),
                                sender: "agent",
                                senderName: "You",
                                text: message.trim(),
                                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                              };
                              setLocalMessages((prev) => [...prev, newMsg]);
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
                <TabsTrigger
                  value="orders"
                  className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent"
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="flex-1 rounded-none h-full text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent"
                >
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
                          {currentOrderId && (
                            <span className="text-[10px] text-muted-foreground font-normal">#{currentOrderId}</span>
                          )}
                        </h3>
                        {renderStatusActions()}
                      </div>
                    )}

                    {/* Orders */}
                    <div className="p-4 border-b">
                      <h3 className="font-heading font-semibold text-sm mb-3">Orders ({allOrders.length})</h3>
                      <div className="space-y-1.5">
                        {allOrders.map((o) => {
                          const isSelected = selectedOrderId === o.id;
                          return (
                            <div key={o.id}>
                              <div
                                onClick={() => setSelectedOrderId(isSelected ? null : o.id)}
                                className={`w-full text-left rounded-lg p-2.5 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-accent/10 border border-accent/30"
                                    : "bg-muted hover:bg-muted/80 border border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-[11px] font-semibold truncate">
                                        {o.cardType}{" "}
                                        {o.cardCurrency && (
                                          <span className="text-muted-foreground font-normal">/ {o.cardCurrency}</span>
                                        )}
                                      </span>
                                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 ml-1">
                                        {o.status}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                      <div className="flex items-center gap-1 truncate">
                                        <span className="font-mono truncate">{o.id}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(o.id, o.id);
                                          }}
                                          className="text-muted-foreground hover:text-primary shrink-0"
                                          title="Copy Order ID"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                        {copyFeedback === o.id && (
                                          <span className="text-[8px] text-success">Copied!</span>
                                        )}
                                      </div>
                                      <span className="shrink-0">${o.amount}</span>
                                    </div>
                                    {o.cardNumbers.length > 0 && (
                                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                                        <span className="truncate font-mono">
                                          {o.cardNumbers[0]}
                                          {o.cardNumbers.length > 1 ? ` +${o.cardNumbers.length - 1}` : ""}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(o.cardNumbers.join(", "), `cn-${o.id}`);
                                          }}
                                          className="text-muted-foreground hover:text-primary shrink-0"
                                          title="Copy Card Number(s)"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                        {copyFeedback === `cn-${o.id}` && (
                                          <span className="text-[8px] text-success">Copied!</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="mt-1.5 rounded-lg border border-accent/20 bg-card p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                                      Order Details
                                    </h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setDetailOrderId(o.id)}
                                      className="h-6 px-2.5 text-[10px] gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Details
                                    </Button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {[
                                      ["Order ID", o.id],
                                      ["Card", `${o.cardType}${o.cardCurrency ? ` / ${o.cardCurrency}` : ""}`],
                                      ["Amount", `$${o.amount}`],
                                      ["Card Rate", `₦${(o.unitPrice || o.nairaRate).toLocaleString()}`],
                                      ["Payout", `₦${o.payout.toLocaleString()}`],
                                      ...(o.cardNumbers.length > 0 ? [["Card No.", o.cardNumbers.join(", ")]] : []),
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
                                      <p className="text-[10px] text-muted-foreground">
                                        ₦{o.payout.toLocaleString()} added to customer's wallet
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground">Name</span>
                                  <span className="font-medium">John Adebayo Doe</span>
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
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Good Rate</span>
                          <span className="font-medium">{selectedConvo.goodRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Value</span>
                          <span className="font-medium">{selectedConvo.totalValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tags</span>
                          <span className="font-medium">{selectedConvo.tags.join(", ") || "None"}</span>
                        </div>
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
                  onBuyerSelected={
                    selectedId ? (simulatedResult) => handleBuyerSelected(selectedId, simulatedResult) : undefined
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {(() => {
        const detailOrder = detailOrderId ? allOrders.find((o) => o.id === detailOrderId) : null;
        return (
          <Dialog
            open={!!detailOrderId}
            onOpenChange={(open) => {
              if (!open) {
                setDetailOrderId(null);
                setShowCardNumber(false);
              }
            }}
          >
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              {detailOrder &&
                (() => {
                  // Derive richer fields from JSON-style payload (with sensible fallbacks for mock data)
                  const cardCurrency = detailOrder.cardCurrency || "USD";
                  const cardTypeName = detailOrder.cardType || "—";
                  const shoTypeName = `${cardTypeName}${cardCurrency ? ` / ${cardCurrency}` : ""}`;
                  const cardNumber = detailOrder.cardNumbers.length > 0 ? detailOrder.cardNumbers.join(", ") : "—";
                  const cardCode = detailOrder.id;
                  const orderCode = detailOrder.id;
                  // Deterministic mock fallbacks derived from order id so each order shows realistic buyer data
                  const seed = detailOrder.id || "0";
                  const seedNum = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
                  const mockNicknames = ["肖捺", "王伟", "李娜", "Chen Yu", "Zhang Min", "Liu Yang"];
                  const mockAliases = ["M09L81", "K23P47", "T81X02", "Q44R19", "B67N38", "Z12V90"];
                  const providerName =
                    (detailOrder as any).providerName ||
                    (detailOrder as any).alias ||
                    mockAliases[seedNum % mockAliases.length];
                  const buyerNickname =
                    (detailOrder as any).buyerNickname ||
                    (detailOrder as any).buyer ||
                    mockNicknames[seedNum % mockNicknames.length];
                  const sysUserId =
                    (detailOrder as any).sysUserId ||
                    `2${String(seedNum * 7919)
                      .padStart(17, "0")
                      .slice(0, 17)}`;
                  const platSellerId =
                    (detailOrder as any).platSellerId || `${seedNum}${String(seedNum * 31).slice(0, 12)}`;
                  const origin = (detailOrder as any).origin || "Web";
                  const cardStatusMap: Record<string, string> = {
                    "0": "Pending",
                    "1": "Verified",
                    "2": "Used",
                    "3": "Invalid",
                  };
                  const cardStatusRaw = String((detailOrder as any).cardStatus ?? seedNum % 4);
                  const cardStatus = cardStatusMap[cardStatusRaw] || cardStatusRaw;
                  const checked =
                    (detailOrder as any).checked === "1" || (detailOrder as any).checked === true
                      ? "Yes"
                      : (detailOrder as any).checked === "0"
                        ? "No"
                        : seedNum % 2 === 0
                          ? "Yes"
                          : "No";
                  const transferStatusMap: Record<string, string> = {
                    "0": "Not transferred",
                    "1": "Transferred",
                    "2": "Failed",
                  };
                  const transferStatusRaw = String((detailOrder as any).transferStatus ?? "1");
                  const transferStatus = transferStatusMap[transferStatusRaw] || transferStatusRaw;
                  const viewStatusMap: Record<string, string> = { "0": "Unviewed", "1": "Viewed" };
                  const viewStatusRaw = String((detailOrder as any).viewStatus ?? "1");
                  const viewStatus = viewStatusMap[viewStatusRaw] || viewStatusRaw;
                  const rawCreateTime = (detailOrder as any).createTime;
                  const createTime = rawCreateTime
                    ? new Date(Number(rawCreateTime)).toLocaleString()
                    : detailOrder.createdAt || detailOrder.timestamp;
                  const cardFaceValue = detailOrder.amount;
                  const purchaseFaceValue = detailOrder.amount;
                  const purchaseRate = detailOrder.unitPrice || detailOrder.nairaRate || 0;
                  const sellCost = detailOrder.payout;
                  const settleCoin = (detailOrder as any).settleCoin || "USD";
                  const settleRate = (detailOrder as any).settleRate || 1;
                  const settleFaceValue = (detailOrder as any).settleFaceValue || cardFaceValue;
                  const settlePrice = (detailOrder as any).settlePrice || settleFaceValue * settleRate;
                  const nairaRate = detailOrder.nairaRate;
                  const cardImagesRaw = (detailOrder as any).cardImages || (detailOrder as any).cardImage;
                  const cardImages: string[] = Array.isArray(cardImagesRaw)
                    ? cardImagesRaw.filter(Boolean)
                    : cardImagesRaw
                      ? [cardImagesRaw]
                      : [];

                  const productRowsAll: [string, React.ReactNode, boolean?][] = [
                    ["Creation time", detailOrder.createdAt || detailOrder.timestamp],
                    ["Card type", shoTypeName],
                    ["Card face value", `${cardFaceValue}`],
                  ];
                  const productRows = productRowsAll.filter(([, v]) => v !== "—" && v !== "" && v != null);

                  const orderRowsAll: [string, React.ReactNode, boolean?, string?][] = [
                    ["Order receiving time", detailOrder.createdAt || detailOrder.timestamp],
                    ["Order id", orderCode, true],
                    ["Order face value", `${purchaseFaceValue}`],
                    ["Order unit price", `₦${Number(purchaseRate).toLocaleString()}`],
                    ["Order amount", `₦${Number(sellCost).toLocaleString()}`],
                    ["Naira rate", `₦${Number(nairaRate).toLocaleString()}`],
                    ["Settlement coin", settleCoin],
                    ["Settle face value", `${settleFaceValue}`],
                    ["Settle rate", `${settleRate}`],
                    ["Settlement amount", `${settleCoin} ${Number(settlePrice).toLocaleString()}`],
                  ];
                  const orderRows = orderRowsAll.filter(([, v]) => v !== "—" && v !== "" && v != null);

                  return (
                    <div className="space-y-5 pt-2">
                      <div className="grid grid-cols-2 gap-8">
                      {/* Product Information */}
                      <div className="space-y-4">
                        <h4 className="font-heading font-semibold text-sm text-center">Product Information</h4>
                        <div className="space-y-3">
                          {productRows.map(([label, value, copyable]) => (
                            <div key={label} className="flex gap-3 text-sm">
                              <span className="text-muted-foreground w-[130px] shrink-0 text-right">{label}</span>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-medium break-all">{value}</span>
                                {copyable && (
                                  <button
                                    onClick={() => handleCopy(String(value), `modal-${label}`)}
                                    className="text-muted-foreground hover:text-primary shrink-0"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {copyFeedback === `modal-${label}` && (
                                  <span className="text-[9px] text-success">Copied!</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {/* Card number with masking + reveal toggle */}
                          {cardNumber !== "—" && (
                            <div className="flex gap-3 text-sm">
                              <span className="text-muted-foreground w-[130px] shrink-0 text-right">Card number</span>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-medium font-mono break-all">
                                  {showCardNumber
                                    ? cardNumber
                                    : cardNumber.length <= 4
                                      ? "•".repeat(cardNumber.length)
                                      : `${"•".repeat(Math.max(0, cardNumber.length - 4))}${cardNumber.slice(-4)}`}
                                </span>
                                <button
                                  onClick={() => setShowCardNumber((v) => !v)}
                                  className="text-muted-foreground hover:text-primary shrink-0"
                                  aria-label={showCardNumber ? "Hide card number" : "Show card number"}
                                >
                                  {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleCopy(cardNumber, "modal-Card number")}
                                  className="text-muted-foreground hover:text-primary shrink-0"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {copyFeedback === "modal-Card number" && (
                                  <span className="text-[9px] text-success">Copied!</span>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Card images (may be multiple) */}
                          <div className="flex gap-3 text-sm">
                            <span className="text-muted-foreground w-[130px] shrink-0 text-right pt-1">
                              {cardImages.length > 1 ? `Card images (${cardImages.length})` : "Card image"}
                            </span>
                            <div className="flex gap-2 flex-wrap">
                              {cardImages.length > 0 ? (
                                cardImages.map((src, i) => (
                                  <a key={i} href={src} target="_blank" rel="noreferrer" className="block">
                                    <img
                                      src={src}
                                      alt={`Card ${i + 1}`}
                                      className="w-20 h-14 object-cover rounded border hover:ring-2 hover:ring-primary transition"
                                    />
                                  </a>
                                ))
                              ) : (
                                <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Information */}
                      <div className="space-y-4">
                        <h4 className="font-heading font-semibold text-sm text-center">Order Information</h4>
                        <div className="space-y-3">
                          {orderRows.map(([label, value, copyable, kind]) => (
                            <div key={label} className="flex gap-3 text-sm">
                              <span className="text-muted-foreground w-[130px] shrink-0 text-right">{label}</span>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`font-medium break-all ${
                                    kind === "status" && value === "success"
                                      ? "text-success"
                                      : kind === "status" && value === "order_cancelled"
                                        ? "text-destructive"
                                        : kind === "status" && value === "in_trade"
                                          ? "text-accent"
                                          : kind === "status"
                                            ? "text-warning"
                                            : ""
                                  }`}
                                >
                                  {value}
                                </span>
                                {copyable && (
                                  <button
                                    onClick={() => handleCopy(String(value), `modal-${label}`)}
                                    className="text-muted-foreground hover:text-primary shrink-0"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {copyFeedback === `modal-${label}` && (
                                  <span className="text-[9px] text-success">Copied!</span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Negotiation comparison */}
                          {detailOrder &&
                            negotiationData[detailOrder.id] &&
                            (() => {
                              const neg = negotiationData[detailOrder.id];
                              const currSym = detailOrder.cardCurrency === "GBP" ? "£" : "$";
                              return (
                                <div className="mt-3 pt-3 border-t border-warning/30">
                                  <h4 className="font-heading font-semibold text-xs text-warning mb-2">
                                    Negotiation Details
                                  </h4>
                                  <div className="space-y-2">
                                    {[
                                      [
                                        "Denomination",
                                        `${currSym}${neg.oldDenom.toLocaleString()}`,
                                        `${currSym}${neg.newDenom.toLocaleString()}`,
                                      ],
                                      [
                                        "Card Rate",
                                        `₦${neg.oldRate.toLocaleString()}`,
                                        `₦${neg.newRate.toLocaleString()}`,
                                      ],
                                      [
                                        "Payout",
                                        `₦${neg.oldAmount.toLocaleString()}`,
                                        `₦${neg.newAmount.toLocaleString()}`,
                                      ],
                                    ].map(([label, oldVal, newVal]) => (
                                      <div key={label} className="flex gap-3 text-sm">
                                        <span className="text-muted-foreground w-[130px] shrink-0 text-right">
                                          {label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="line-through text-muted-foreground">{oldVal}</span>
                                          <span className="text-foreground">→</span>
                                          <span className="font-semibold text-warning">{newVal}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                        </div>
                      </div>
                      </div>

                      {/* Buyer Details — full width below the grid */}
                      <div className="pt-4 border-t">
                        <h4 className="font-heading font-semibold text-sm mb-3">Buyer Details</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 max-w-2xl">
                          {[
                            ["Buyer Nickname", buyerNickname],
                            ["Card Status", cardStatus],
                            ["Checked", checked],
                            ["Create Time", createTime],
                          ]
                            .filter(([, v]) => v !== "—" && v !== "" && v != null)
                            .map(([label, value]) => (
                              <div key={label} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium break-all">{value}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setDetailOrderId(null)} className="px-6">
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Confirmation Modal for money-related actions */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmAction?.desc}</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => confirmAction?.onConfirm()}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Negotiate Modal */}
      {(() => {
        const negOrder = currentOrderId ? allOrders.find((o) => o.id === currentOrderId) : null;
        const negCurrency = negOrder?.cardCurrency || "USD";
        const currSymbol = negCurrency === "GBP" ? "£" : "$";
        const oldDenom = negOrder?.amount || 0;
        const oldRate = negOrder?.unitPrice || negOrder?.nairaRate || 0;
        const oldPayout = negOrder?.payout || 0;
        const newPayout = negotiateDenom && negotiateRate ? parseFloat(negotiateDenom) * parseFloat(negotiateRate) : 0;
        const settleCoin = (negOrder as any)?.settleCoin || "USD";
        const settleRate = (negOrder as any)?.settleRate || 1;
        const settleFaceValue = (negOrder as any)?.settleFaceValue || oldDenom;
        const settlePrice = (negOrder as any)?.settlePrice || settleFaceValue * settleRate;

        return (
          <Dialog open={negotiateOpen} onOpenChange={setNegotiateOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Negotiate Order</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                The buyer found a discrepancy. Enter the actual denomination and rate to recalculate the payout.
              </p>

              {/* Original order summary */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Original Order
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Denomination</span>
                  <span className="font-medium">
                    {currSymbol}
                    {oldDenom.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Card Rate</span>
                  <span className="font-medium">₦{oldRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Naira Rate</span>
                  <span className="font-medium">₦{(negOrder?.nairaRate || 289).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Settlement Coin</span>
                  <span className="font-medium">{settleCoin}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Settle Face Value</span>
                  <span className="font-medium">{settleFaceValue}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Settle Rate</span>
                  <span className="font-medium">{settleRate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Settlement Amount</span>
                  <span className="font-medium">
                    {settleCoin} {Number(settlePrice).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-border pt-1.5">
                  <span className="text-muted-foreground font-medium">Original Payout</span>
                  <span className="font-bold">₦{oldPayout.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Actual Denomination ({currSymbol})</label>
                  <Input
                    type="number"
                    placeholder={`e.g. 50`}
                    value={negotiateDenom}
                    onChange={(e) => setNegotiateDenom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Actual Card Rate (₦)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1400"
                    value={negotiateRate}
                    onChange={(e) => setNegotiateRate(e.target.value)}
                  />
                </div>
                {negotiateDenom && negotiateRate && (
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Original Payout</span>
                      <span className="font-medium line-through text-muted-foreground">
                        ₦{oldPayout.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Naira Rate</span>
                      <span className="font-medium">₦{(negOrder?.nairaRate || 289).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">New Payout</span>
                      <span className="font-bold text-primary">₦{newPayout.toLocaleString()}</span>
                    </div>
                    {newPayout < oldPayout && (
                      <p className="text-[10px] text-warning text-center">
                        Difference: -₦{(oldPayout - newPayout).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setNegotiateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={!negotiateDenom || !negotiateRate}
                  onClick={() => {
                    if (selectedId && currentOrderId) {
                      const payout = parseFloat(negotiateDenom) * parseFloat(negotiateRate);
                      setNegotiationData((prev) => ({
                        ...prev,
                        [currentOrderId]: {
                          oldDenom,
                          oldRate,
                          oldAmount: oldPayout,
                          newDenom: parseFloat(negotiateDenom),
                          newRate: parseFloat(negotiateRate),
                          newAmount: payout,
                        },
                      }));
                      // Transition directly to success
                      handleStatusTransition(selectedId, "success", payout);
                      addSystemMessage(`✅ Negotiation confirmed. Payout ₦${payout.toLocaleString()}.`);
                    }
                    setNegotiateOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Fund Adjustment Modal */}
      <Dialog
        open={fundAdjustOpen}
        onOpenChange={(open) => {
          setFundAdjustOpen(open);
          if (!open) {
            setFundPinStep(false);
            setFundPin("");
            setFundAdjustOrderId("none");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Fund Adjustment
            </DialogTitle>
          </DialogHeader>
          {(() => {
            const cw = selectedConvo ? customerWallets.find((w) => w.alias === selectedConvo.alias) : null;
            const custTxns = selectedConvo ? walletTransactions.slice(0, 5) : [];
            const custAdjustments = selectedConvo
              ? fundAdjustments.filter((a) => a.customerAlias === selectedConvo.alias)
              : [];
            return (
              <>
                <p className="text-sm text-muted-foreground">
                  {fundAdjustType === "addition" ? "Add" : "Deduct"} funds{" "}
                  {fundAdjustType === "addition" ? "to" : "from"} <strong>{selectedConvo?.alias}</strong>'s wallet.
                </p>

                {/* Wallet Balance Card */}
                {cw && (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Current Wallet Balance
                    </p>
                    <p className="font-heading text-xl font-bold text-accent">₦{cw.balance.toLocaleString()}</p>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>
                        Total Credits:{" "}
                        <span className="text-success font-medium">₦{cw.totalCredits.toLocaleString()}</span>
                      </span>
                      <span>
                        Withdrawals:{" "}
                        <span className="text-destructive font-medium">₦{cw.totalWithdrawals.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={fundAdjustType === "addition" ? "default" : "outline"}
                      className={`flex-1 h-8 text-xs gap-1 ${fundAdjustType === "addition" ? "bg-success text-success-foreground hover:bg-success/90" : ""}`}
                      onClick={() => setFundAdjustType("addition")}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Addition
                    </Button>
                    <Button
                      size="sm"
                      variant={fundAdjustType === "deduction" ? "default" : "outline"}
                      className={`flex-1 h-8 text-xs gap-1 ${fundAdjustType === "deduction" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
                      onClick={() => setFundAdjustType("deduction")}
                    >
                      <MinusCircle className="w-3.5 h-3.5" /> Deduction
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Amount (₦)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={fundAdjustAmount}
                      onChange={(e) => setFundAdjustAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Reason</label>
                    <Input
                      placeholder="e.g. Refund for bad card, Bonus credit..."
                      value={fundAdjustReason}
                      onChange={(e) => setFundAdjustReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Related Order (optional)</label>
                    <Select value={fundAdjustOrderId} onValueChange={setFundAdjustOrderId}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select an order..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No related order</SelectItem>
                        {orders
                          .filter((o) => (selectedConvo ? o.customer === selectedConvo.alias : true))
                          .map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              <span className="font-medium">{o.id}</span>
                              <span className="text-muted-foreground ml-1">
                                — {o.cardType} · ${o.amount}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fundAdjustOrderId &&
                      fundAdjustOrderId !== "none" &&
                      (() => {
                        const relOrder = orders.find((o) => o.id === fundAdjustOrderId);
                        if (!relOrder) return null;
                        return (
                          <div className="bg-muted/50 border rounded-lg p-2.5 space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Card Type</span>
                              <span className="font-medium">{relOrder.cardType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-medium">${relOrder.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rate</span>
                              <span className="font-medium">₦{relOrder.nairaRate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span
                                className={`font-medium capitalize ${relOrder.status === "success" ? "text-success" : relOrder.status === "order_cancelled" ? "text-destructive" : "text-warning"}`}
                              >
                                {relOrder.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                  </div>

                  {custTxns.length > 0 && (
                    <div className="border rounded-lg p-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Recent Transactions
                      </p>
                      {custTxns.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            {tx.type === "credit" ? (
                              <PlusCircle className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <MinusCircle className="w-3 h-3 text-destructive shrink-0" />
                            )}
                            <span className="text-muted-foreground truncate">{tx.description}</span>
                          </div>
                          <span
                            className={`font-medium shrink-0 ml-2 ${tx.type === "credit" ? "text-success" : "text-destructive"}`}
                          >
                            {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent adjustments for this customer */}
                  {custAdjustments.length > 0 && (
                    <div className="border rounded-lg p-2.5 space-y-1.5 max-h-32 overflow-y-auto">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Recent Adjustments
                      </p>
                      {custAdjustments.slice(0, 5).map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            {a.type === "addition" ? (
                              <PlusCircle className="w-3 h-3 text-success" />
                            ) : (
                              <MinusCircle className="w-3 h-3 text-destructive" />
                            )}
                            <span className="text-muted-foreground truncate max-w-[120px]">{a.reason}</span>
                          </div>
                          <span
                            className={`font-medium ${a.type === "addition" ? "text-success" : "text-destructive"}`}
                          >
                            {a.type === "addition" ? "+" : "-"}₦{a.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
          {!fundPinStep ? (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setFundAdjustOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!fundAdjustAmount || Number(fundAdjustAmount) <= 0 || !fundAdjustReason}
                onClick={() => {
                  const storedPin = localStorage.getItem(`adminPin_${role}`);
                  if (!storedPin) {
                    toast.error("Please create a transaction PIN in your Profile first");
                    return;
                  }
                  setFundPinStep(true);
                  setFundPin("");
                }}
              >
                Confirm {fundAdjustType === "addition" ? "Addition" : "Deduction"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="bg-muted/50 rounded-lg p-4 text-center space-y-3">
                <Lock className="w-8 h-8 text-accent mx-auto" />
                <p className="text-sm font-medium">Enter Transaction PIN</p>
                <p className="text-xs text-muted-foreground">
                  Enter your 6-digit PIN to authorize this {fundAdjustType}
                </p>
                <div
                  className="flex justify-center gap-2 cursor-text"
                  onClick={() => document.getElementById("fund-pin-input")?.focus()}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-colors ${
                        fundPin.length > i ? "border-accent bg-accent/10 text-accent" : "border-border bg-background"
                      }`}
                    >
                      {fundPin.length > i ? "•" : ""}
                    </div>
                  ))}
                </div>
                <input
                  id="fund-pin-input"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={fundPin}
                  onChange={(e) => setFundPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="opacity-0 absolute w-0 h-0"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFundPinStep(false);
                    setFundPin("");
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={fundPin.length !== 6}
                  onClick={async () => {
                    const storedHash = localStorage.getItem(`adminPin_${role}`);
                    const ok = await verifyPin(fundPin, storedHash);
                    if (!ok) {
                      toast.error("Incorrect PIN");
                      setFundPin("");
                      return;
                    }
                    const amount = Number(fundAdjustAmount);
                    if (!selectedConvo || !amount || amount <= 0 || !fundAdjustReason) return;
                    const roleNames: Record<string, string> = { super_admin: "Admin One", team_lead: "Sarah Lead" };
                    const adjustment: FundAdjustment = {
                      id: `FA-${Date.now().toString(36).toUpperCase()}`,
                      customerAlias: selectedConvo.alias,
                      type: fundAdjustType,
                      amount,
                      reason: fundAdjustReason,
                      performedBy: roleNames[role] || role,
                      timestamp: new Date().toLocaleString(),
                    };
                    setFundAdjustments((prev) => [adjustment, ...prev]);
                    addSystemMessage(
                      `💰 Fund ${fundAdjustType}: ${fundAdjustType === "addition" ? "+" : "-"}₦${amount.toLocaleString()} — ${fundAdjustReason} (by ${adjustment.performedBy})`,
                    );
                    setFundAdjustOpen(false);
                    setFundAdjustAmount("");
                    setFundAdjustReason("");
                    setFundPinStep(false);
                    setFundPin("");
                  }}
                >
                  Authorize
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {viewerImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col" onClick={() => setViewerImage(null)}>
          <div
            className="flex items-center justify-between p-3 bg-black/60 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewerZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 hover:bg-white/10 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs w-12 text-center">{Math.round(viewerZoom * 100)}%</span>
              <button
                onClick={() => setViewerZoom((z) => Math.min(4, z + 0.25))}
                className="p-2 hover:bg-white/10 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleExtractText}
                disabled={ocrLoading}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded text-xs font-medium disabled:opacity-60"
              >
                {ocrLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanText className="w-3.5 h-3.5" />}
                Extract Text
              </button>
              {ocrText && (
                <div className="ml-2 flex items-center gap-2 px-2 py-1 bg-white/10 rounded text-xs font-mono">
                  {ocrText}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ocrText);
                      toast.success("Copied");
                    }}
                    className="hover:bg-white/10 p-1 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setViewerImage(null)} className="p-2 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewerImage}
              alt="viewer"
              style={{ transform: `scale(${viewerZoom})`, transition: "transform 0.15s" }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
