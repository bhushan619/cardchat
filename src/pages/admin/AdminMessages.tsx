import { isVip } from "@/lib/vipCustomers";
import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePaymentChannel } from "@/lib/paymentChannel";
import { maskName, formatDate } from "@/lib/utils";
import { useAdminT } from "@/contexts/AdminLangContext";
import {
  conversations as rawConversations,
  chatMessages,
  orders,
  adminUsers,
  customerWallets,
  walletTransactions,
  whatsappGroups,
  groupMessages,
  type FundAdjustment,
} from "@/data/mock";
import { GroupThread, GroupAvatar } from "@/components/admin/WhatsAppGroupView";
import {
  MessageCircle,
  Star,
  Send,
  Image,
  Users,
  Search,
  CheckCircle2,
  Crown,
  Shield,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  UserCheck,
  Smile,
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
  Coins,
  ArrowRightLeft,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import CardlightPanel, {
  type CompletedOrder,
  cardlightResultMeta,
  type CardlightResult,
} from "@/components/admin/OrderWizardModal";
import ChannelBadge from "@/components/admin/ChannelBadge";
import TransferReceiptCard, { type TransferReceipt } from "@/components/admin/TransferReceiptCard";
import CustomerAliasSelector from "@/components/admin/CustomerAliasSelector";
import { pickBusinessNumberFor } from "@/lib/waBusinessNumbers";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import {
  AgentOrderStatus,
  agentStatusLabels,
  agentStatusStyles,
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
    label: "Processing",
    color: "text-white",
    bg: "bg-gradient-to-r from-emerald-500 to-teal-400",
    activeBg: "bg-gradient-to-r from-emerald-600 to-teal-500",
  },
];

type EscalationUser = {
  id: number;
  name: string;
  role: "super_admin" | "team_lead";
  status: "online" | "offline";
};

// Mock escalation candidates (upward only — Team Leads & Super Admins)
const escalatableUsers: EscalationUser[] = [
  { id: 9001, name: "Sarah Lead", role: "team_lead", status: "online" },
  { id: 9002, name: "Admin One", role: "super_admin", status: "online" },
  { id: 9003, name: "Boss Admin", role: "super_admin", status: "offline" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Bubble/name color palette per added participant (in join order)
const MEMBER_STYLES = [
  { name: "text-orange-500", bubble: "bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500", avatar: "bg-orange-500" },
  { name: "text-emerald-500", bubble: "bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500", avatar: "bg-emerald-500" },
  { name: "text-violet-500", bubble: "bg-violet-50 dark:bg-violet-500/10 border-l-4 border-violet-500", avatar: "bg-violet-500" },
];

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
  isSystemNote?: boolean;
  receipt?: TransferReceipt;

};

const MOCK_OCR_CODES = ["XJVK-2P9M-4QHR-7TLB", "X7N3-9LMK-2WQV-8CHP", "AAPL-4827-9QXR-1NMV"];

export default function AdminMessages({ channelFilter = "trtc" }: { channelFilter?: "trtc" | "whatsapp" } = {}) {
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
  const [groupMembers, setGroupMembers] = useState<EscalationUser[]>([]);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateSelected, setEscalateSelected] = useState<number[]>([]);
  const t = useAdminT();

  const [showIdentity, setShowIdentity] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<(typeof adminUsers)[0] | null>(null);
  const [transferCompletedOrders] = useState<Set<string>>(() => {
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
      toast.success("Card number extracted & copied");
    }, 1200);
  };

  const selectedConvo = rawConversations.find((c) => c.id === selectedId);
  // WhatsApp GROUP conversations (multi-participant, read-only right panel)
  const selectedGroup =
    channelFilter === "whatsapp" ? whatsappGroups.find((g) => g.id === selectedId) ?? null : null;
  const selectedGroupMessages = selectedGroup ? groupMessages[selectedGroup.id] ?? [] : [];
  const [highlightMsgId, setHighlightMsgId] = useState<number | null>(null);
  // Group chats: the customer behind an order/transfer must be selected manually.
  const [groupCustomerAlias, setGroupCustomerAlias] = useState<string | null>(null);
  // System notices shown inside group threads (order created, transfer executed, ...)
  const [groupSystemMsgs, setGroupSystemMsgs] = useState<Record<string, { id: number; text: string; time: string; receipt?: TransferReceipt }[]>>(
    () => {
      try {
        return JSON.parse(sessionStorage.getItem("cc.groupSystemMsgs") || "{}");
      } catch {
        return {};
      }
    },
  );
  useEffect(() => {
    setGroupCustomerAlias(null);
  }, [selectedId]);

  const groupCustomerConvo = groupCustomerAlias
    ? rawConversations.find((c) => c.alias === groupCustomerAlias) ?? null
    : null;
  // Conversation the right panel acts on: auto-resolved in 1:1, manually picked in groups.
  const panelConvo = selectedConvo ?? groupCustomerConvo;
  // Conversation the transfer modal acts on: auto-resolved in 1:1, manually picked in groups.
  const txConvo = selectedGroup ? groupCustomerConvo : selectedConvo;
  const isGroupChat = groupMembers.length > 0;
  const canReassign = role === "super_admin" || role === "team_lead";

  // Dynamic tab assignment based on order status
  const conversationsWithTabs = useMemo(() => {
    return rawConversations
      .filter((c) => c.channel === channelFilter)
      .map((c) => ({
        ...c,
        dynamicTab: orderStatus.getConversationTab(c.id),
      }));
  }, [orderStatus, channelFilter]);

  const [activeTab, setActiveTab] = useState("consulting");
  const [customerSearch, setCustomerSearch] = useState("");

  // Reset selection when channel changes
  useEffect(() => {
    setSelectedId(null);
  }, [channelFilter]);

  // Mock: current agent identity for prototype filtering. In production this comes from auth.
  const currentAgentName = "Mike Agent";

  const filteredConversations = useMemo(() => {
    return conversationsWithTabs.filter((c) => {
      const matchesTab = c.dynamicTab === activeTab;
      const matchesSearch =
        !customerSearch ||
        c.alias.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(customerSearch.toLowerCase());
      // Agent-scoped visibility: for regular agents, WhatsApp conversations are only
      // visible when the routed number is assigned to that agent. SA/TL see all.
      let matchesAgentScope = true;
      if (channelFilter === "whatsapp" && role === "agent") {
        const line = pickBusinessNumberFor(c.id);
        matchesAgentScope = line.assignedAgent === currentAgentName;
      }
      return matchesTab && matchesSearch && matchesAgentScope;
    });
  }, [conversationsWithTabs, activeTab, customerSearch, channelFilter, role]);

  const filteredGroups = useMemo(() => {
    if (channelFilter !== "whatsapp") return [];
    return whatsappGroups.filter((g) => {
      // Once an order is raised for a group it follows the order state machine tab
      const hasOrder = !!orderStatus.getStatus(g.id);
      const dynamicTab = hasOrder ? orderStatus.getConversationTab(g.id) : g.tab;
      const matchesTab = dynamicTab === activeTab;
      const matchesSearch =
        !customerSearch ||
        g.groupName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        g.lastMessage.toLowerCase().includes(customerSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [channelFilter, activeTab, customerSearch, orderStatus]);

  // Interleave group rows with the 1:1 conversation rows
  const listItems = useMemo(() => {
    const out: Array<
      | { kind: "dm"; data: (typeof filteredConversations)[number] }
      | { kind: "group"; data: (typeof filteredGroups)[number] }
    > = [];
    const queue = [...filteredGroups];
    filteredConversations.forEach((c, i) => {
      out.push({ kind: "dm", data: c });
      if (i % 2 === 1 && queue.length) out.push({ kind: "group", data: queue.shift()! });
    });
    queue.forEach((g) => out.push({ kind: "group", data: g }));
    return out;
  }, [filteredConversations, filteredGroups]);

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

  // Points +/- and Transfer buttons — shared by 1:1 and group composers
  const renderComposerActions = () => (
    <>
                    {canAdjustFunds && (selectedConvo || selectedGroup) && (
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
                        <Wallet className="w-3.5 h-3.5" /> Points +/-
                      </Button>
                    )}
                    {(selectedConvo?.channel === "whatsapp" || !!selectedGroup) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          !(
                            currentOrderStatus === "success" ||
                            (currentOrderId && !!negotiationData[currentOrderId])
                          )
                        }
                        onClick={() => {
                          resetTransferForm();
                          setTransferOpen(true);
                        }}
                        title="Transfer is only available once the order is successful or a negotiation is confirmed"
                        className="h-8 text-xs gap-1 text-accent border-accent/30 bg-transparent hover:bg-accent/10 hover:text-accent hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
                      </Button>
                    )}
    </>
  );

  // Helper: add system message
  const addSystemMessage = (text: string, receipt?: TransferReceipt) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (selectedGroup) {
      const gid = selectedGroup.id;
      setGroupSystemMsgs((prev) => {
        const next = { ...prev, [gid]: [...(prev[gid] ?? []), { id: Date.now(), text, time, receipt }] };
        sessionStorage.setItem("cc.groupSystemMsgs", JSON.stringify(next));
        return next;
      });
      return;
    }
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "system",
      senderName: "System",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrder: true,
      receipt,
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
      // On success: always credit the customer's wallet (WhatsApp + in-app both have wallets).
      // Actual bank disbursement happens via the PalmPay Transfer flow, which debits the wallet.
      if (newStatus === "success" && payoutAmount) {
        addSystemMessage(`📌 💰 ${payoutAmount.toLocaleString()} points credited to customer's wallet`);
      }
    }
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

  const addEscalationNote = (text: string) => {
    setLocalMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        sender: "system",
        senderName: "System",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystemNote: true,
      },
    ]);
  };

  const addSelectedToGroup = () => {
    const toAdd = escalatableUsers.filter(
      (u) => escalateSelected.includes(u.id) && !groupMembers.some((m) => m.id === u.id),
    );
    if (toAdd.length === 0) return;
    setGroupMembers((prev) => [...prev, ...toAdd]);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const notes: ChatMessage[] = toAdd.map((u, i) => ({
      id: Date.now() + i,
      sender: "system",
      senderName: "System",
      text: `${u.name} (${ROLE_META[u.role]?.label || u.role}) ${t("has joined the chat")}`,
      time: now,
      isSystemNote: true,
    }));
    // Simulate a couple of messages from the newly added members
    const mock: ChatMessage[] = toAdd.flatMap((u, i) => [
      {
        id: Date.now() + 100 + i * 2,
        sender: "admin_member",
        senderName: u.name,
        text: "Thanks for the escalation — reviewing the order details now.",
        time: now,
      },
      {
        id: Date.now() + 101 + i * 2,
        sender: "admin_member",
        senderName: u.name,
        text: "Please hold the payout until I confirm the card value.",
        time: now,
      },
    ]);
    setLocalMessages((prev) => [...prev, ...notes, ...mock]);
    setEscalateSelected([]);
    setEscalateOpen(false);
  };

  const removeFromGroup = (userId: number) => {
    const user = groupMembers.find((m) => m.id === userId);
    if (!user) return;
    const remaining = groupMembers.filter((m) => m.id !== userId);
    setGroupMembers(remaining);
    addEscalationNote(`${user.name} ${t("has left the chat")}`);
    if (remaining.length === 0) setTimeout(() => addEscalationNote(t("Escalation ended")), 0);
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

  // Transfer (WhatsApp payment) state
  const [transferOpen, setTransferOpen] = useState(false);
  const { label: activePaymentChannel } = usePaymentChannel();
  const transferMethod = activePaymentChannel;
  const [transferBank, setTransferBank] = useState("");
  const [transferAccount, setTransferAccount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRate, setTransferRate] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [transferVerified, setTransferVerified] = useState(false);
  const [transferVerifying, setTransferVerifying] = useState(false);
  const [transferOrderId, setTransferOrderId] = useState<string>("");


  const nigerianBanks = [
    "Access Bank",
    "Citibank",
    "Ecobank",
    "Fidelity Bank",
    "First Bank of Nigeria",
    "First City Monument Bank (FCMB)",
    "Guaranty Trust Bank (GTBank)",
    "Heritage Bank",
    "Keystone Bank",
    "Kuda Bank",
    "OPay",
    "PalmPay",
    "Polaris Bank",
    "Providus Bank",
    "Stanbic IBTC Bank",
    "Standard Chartered",
    "Sterling Bank",
    "Union Bank",
    "United Bank for Africa (UBA)",
    "Unity Bank",
    "Wema Bank",
    "Zenith Bank",
  ];

  // Detect bank account details in a message. Returns null when nothing matches.
  const bankAliases: Record<string, string> = {
    gtb: "Guaranty Trust Bank (GTBank)",
    gtbank: "Guaranty Trust Bank (GTBank)",
    uba: "United Bank for Africa (UBA)",
    fcmb: "First City Monument Bank (FCMB)",
    firstbank: "First Bank of Nigeria",
    "first bank": "First Bank of Nigeria",
    opay: "OPay",
    palmpay: "PalmPay",
    kuda: "Kuda Bank",
    moniepoint: "OPay", // treat as generic; adjust as needed
    ecobank: "Ecobank",
    zenith: "Zenith Bank",
    access: "Access Bank",
    fidelity: "Fidelity Bank",
    sterling: "Sterling Bank",
    wema: "Wema Bank",
    union: "Union Bank",
    polaris: "Polaris Bank",
    stanbic: "Stanbic IBTC Bank",
    heritage: "Heritage Bank",
    keystone: "Keystone Bank",
    providus: "Providus Bank",
    unity: "Unity Bank",
    citibank: "Citibank",
  };
  const detectBankDetails = (text: string): { bank: string; account: string; recipient?: string } | null => {
    if (!text) return null;
    const accountMatch = text.match(/\b\d{10}\b/);
    if (!accountMatch) return null;
    const account = accountMatch[0];
    const lower = text.toLowerCase();
    // Try full bank names first, then aliases
    let bank = nigerianBanks.find((b) => lower.includes(b.toLowerCase()));
    if (!bank) {
      const aliasKey = Object.keys(bankAliases).find((k) => new RegExp(`\\b${k}\\b`, "i").test(text));
      if (aliasKey) bank = bankAliases[aliasKey];
    }
    if (!bank) return null;
    // Look for a capitalized name (2-4 words) that isn't the bank
    const nameMatch = text.match(/\b([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3})\b/);
    const recipient = nameMatch && !bank.includes(nameMatch[1]) ? nameMatch[1] : undefined;
    return { bank, account, recipient };
  };

  const resetTransferForm = () => {
    setTransferBank("");
    setTransferAccount("");
    setTransferRecipient("");
    setTransferAmount("");
    setTransferRate("");
    setTransferNote("");
    setTransferVerified(false);
    setTransferVerifying(false);
    setTransferOrderId("");
  };

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

  // Orders eligible for transfer for the currently selected customer
  const transferEligibleOrders = useMemo(() => {
    if (!selectedConvo) return [];
    const map = new Map<
      string,
      { id: string; amount: number; payout: number; cardType: string; status: string; customer: string }
    >();
    orders
      .filter((o) => o.customer === selectedConvo.alias)
      .forEach((o) => {
        map.set(o.id, {
          id: o.id,
          amount: o.amount,
          payout: o.amount * o.unitPrice,
          cardType: o.cardType,
          status: o.status,
          customer: o.customer,
        });
      });
    if (currentOrderId && !map.has(currentOrderId)) {
      const current = allOrders.find((o) => o.id === currentOrderId);
      if (current) {
        // Prefer the live status from the order state machine so that
        // wallet credits become available as soon as the order is marked
        // "success" (rather than reflecting the stale snapshot status).
        const liveStatus = selectedId ? orderStatus.getStatus(selectedId) : null;
        map.set(currentOrderId, {
          id: currentOrderId,
          amount: current.amount,
          payout: current.payout,
          cardType: current.cardType,
          status: liveStatus || current.status,
          customer: selectedConvo.alias,
        });
      }
    }
    return Array.from(map.values());
  }, [selectedConvo, selectedId, currentOrderId, currentOrderStatus, allOrders]);

  // Pre-select the current linked order when the transfer modal opens
  useEffect(() => {
    if (transferOpen && !transferOrderId) {
      if (currentOrderId && transferEligibleOrders.some((o) => o.id === currentOrderId)) {
        setTransferOrderId(currentOrderId);
        const order = transferEligibleOrders.find((o) => o.id === currentOrderId);
        if (order) setTransferAmount(String(Math.round(order.payout)));
      }
    }
  }, [transferOpen, currentOrderId, transferEligibleOrders, transferOrderId]);

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
        case "success": {
          const transferred = currentOrderId ? transferCompletedOrders.has(currentOrderId) : false;
          return {
            icon: "✅",
            title: transferred
              ? "Trade Successful — Wallet Credited & Transferred"
              : "Trade Successful — Wallet Credited",
            desc: transferred
              ? "Funds credited and a PalmPay transfer was recorded against this order."
              : "Funds credited to the customer's wallet. Process a PalmPay transfer when they request payout.",
            colorClass: "text-success",
          };
        }
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
                      desc: `This will mark the order as successful and credit Pts ${statusOrder?.payout.toLocaleString() || "0"} to the customer's wallet.`,
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
                      <span className="text-muted-foreground">Points price</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-[10px]">
                          Pts {neg.oldRate.toLocaleString()}
                        </span>
                        <span className="font-medium text-warning">Pts {neg.newRate.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-1">
                      <span className="text-muted-foreground font-medium">Total Release</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through text-[10px]">
                          Pts {neg.oldAmount.toLocaleString()}
                        </span>
                        <span className="font-bold text-warning">
                          Pts {Math.round(neg.newAmount).toLocaleString()}
                          <span className="text-[10px] text-muted-foreground font-normal ml-1">
                            ({neg.newAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })})
                          </span>
                        </span>
                      </div>
                    </div>
                  </>
                );
              }
              return (
                <>
                  {[
                    ["Amount", `${currSym}${statusOrder.amount.toLocaleString()}`],
                    ["Card Rate (CNY)", "4.2345"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs border-t border-border pt-1.5 mt-1">
                    <span className="text-muted-foreground font-medium">Total Release</span>
                    <span className="font-bold text-primary">
                      Pts {Math.round(statusOrder.payout).toLocaleString()}
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        ({statusOrder.payout.toLocaleString(undefined, { maximumFractionDigits: 2 })})
                      </span>
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right">
                    Points Rate × Card Rate (CNY) × Card Amount
                  </p>
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
              {listItems.map((item) => {
                if (item.kind === "group") {
                  const g = item.data;
                  const gActive = selectedId === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedId(g.id);
                        setHighlightMsgId(null);
                      }}
                      className={`w-full text-left p-3 border-b hover:bg-muted/50 transition-colors ${
                        gActive
                          ? "bg-violet-500/10 border-l-2 border-l-violet-500"
                          : "bg-violet-500/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GroupAvatar className="w-8 h-8 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-semibold truncate">{g.groupName}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 font-medium leading-none whitespace-nowrap">
                                Group
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{g.time}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{g.lastMessage}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {g.participants.length} members
                          </p>
                        </div>
                        {g.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-semibold shrink-0">
                            {g.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                }
                const c = item.data;
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
                            {c.channel === "whatsapp" && c.waNickname && (
                              <span
                                className="text-[10px] text-muted-foreground truncate max-w-[90px]"
                                title={`WhatsApp nickname: ${c.waNickname}`}
                              >
                                ~{c.waNickname}
                              </span>
                            )}
                            {c.channel === "whatsapp" && c.whatsappNumber && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono leading-none whitespace-nowrap shrink-0"
                                title={`WhatsApp number: ${c.whatsappNumber}`}
                              >
                                {c.whatsappNumber.slice(-4)}
                              </span>
                            )}
                            {channelFilter !== "whatsapp" && isVip(c.alias) && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-amber-950 leading-none shrink-0 border border-amber-600/20">
                                <Crown className="w-3 h-3" /> VIP
                              </span>
                            )}
                            <ChannelBadge channel={c.channel} size="xs" showLabel={false} />
                            {c.channel === "whatsapp" &&
                              (() => {
                                const line = pickBusinessNumberFor(c.id);
                                return (
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium truncate leading-none"
                                    title={`Received on ${line.label} · ${line.phone}`}
                                  >
                                    {line.label}
                                  </span>
                                );
                              })()}
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
                        {c.channel === "whatsapp" &&
                          (role === "super_admin" || role === "team_lead") &&
                          (() => {
                            const line = pickBusinessNumberFor(c.id);
                            return (
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                Agent: <span className="font-medium">{line.assignedAgent || "Unassigned"}</span>
                              </p>
                            );
                          })()}
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
              {listItems.length === 0 && (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                  No conversations
                </div>
              )}
            </div>
          </div>

          {/* Middle: Chat window */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedGroup ? (
              <GroupThread
                group={selectedGroup}
                messages={selectedGroupMessages}
                highlightId={highlightMsgId}
                systemMessages={groupSystemMsgs[selectedGroup.id] ?? []}
                actions={renderComposerActions()}
              />
            ) : selectedId && selectedConvo ? (
              <>
                <header className="flex items-center justify-between px-5 border-b bg-card shrink-0 h-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {selectedConvo.alias.slice(-2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold whitespace-nowrap">{panelConvo.alias}</p>
                        {selectedConvo.channel === "whatsapp" && selectedConvo.waNickname && (
                          <span
                            className="text-[11px] text-muted-foreground whitespace-nowrap"
                            title="WhatsApp nickname"
                          >
                            ~{selectedConvo.waNickname}
                          </span>
                        )}
                        {channelFilter !== "whatsapp" && isVip(selectedConvo.alias) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-amber-950 leading-none border border-amber-600/20">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        )}
                        <ChannelBadge channel={selectedConvo.channel} size="xs" showLabel={false} />
                        {selectedConvo.channel === "whatsapp" &&
                          !isGroupChat &&
                          (() => {
                            const line = pickBusinessNumberFor(selectedConvo.id);
                            return (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap leading-none">
                                {line.label}
                              </span>
                            );
                          })()}
                        {isGroupChat && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5 whitespace-nowrap leading-none">
                            <Users className="w-2.5 h-2.5" /> Group · {groupMembers.length + 2}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {isGroupChat
                          ? `You, ${groupMembers.map((m) => m.name).join(", ")}, ${selectedConvo.alias}`
                          : `${panelConvo.goodRate}% rate · ${panelConvo.totalValue} total`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <div className="flex flex-col gap-0.5 leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-9">TP</span>
                          <span className="text-[10px] font-bold text-foreground inline-flex items-center gap-0.5">
                            <Coins className="w-3 h-3" />
                            4,850,000
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                              <p className="font-semibold">Total Points</p>
                              <p className="text-muted-foreground">Lifetime points total for this customer</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-9">MTP</span>
                          <span className="text-[10px] font-bold text-foreground inline-flex items-center gap-0.5">
                            <Coins className="w-3 h-3" />
                            1,250,000
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs max-w-[180px]">
                              <p className="font-semibold">Monthly Total Points</p>
                              <p className="text-muted-foreground">
                                Points total for this customer in the current month
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TooltipProvider>

                    {canReassign && channelFilter !== "whatsapp" && (
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

                    {channelFilter !== "whatsapp" && (
                      <Popover open={escalateOpen} onOpenChange={setEscalateOpen}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PopoverTrigger asChild>
                                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                  <Users className="w-3.5 h-3.5" /> {t("Escalate")}
                                </button>
                              </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Escalate — add Team Lead or Super Admin to this chat
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <PopoverContent className="w-72 p-0" align="end">
                          <div className="p-3 border-b">
                            <p className="text-xs font-semibold">Escalate this chat</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Add a Team Lead or Super Admin
                            </p>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {escalatableUsers
                              .filter((u) => !groupMembers.some((m) => m.id === u.id))
                              .map((user) => {
                                const roleMeta = ROLE_META[user.role];
                                const checked = escalateSelected.includes(user.id);
                                return (
                                  <button
                                    key={user.id}
                                    onClick={() =>
                                      setEscalateSelected((prev) =>
                                        checked ? prev.filter((id) => id !== user.id) : [...prev, user.id],
                                      )
                                    }
                                    className="w-full flex items-center gap-2.5 p-2 rounded-md text-left hover:bg-muted transition-colors"
                                  >
                                    <span
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        checked ? "bg-primary border-primary" : "border-muted-foreground/40"
                                      }`}
                                    >
                                      {checked && <CheckCheck className="w-3 h-3 text-primary-foreground" />}
                                    </span>
                                    <div className="relative shrink-0">
                                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {initials(user.name)}
                                      </div>
                                      <span
                                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
                                          user.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{user.name}</p>
                                      <span
                                        className={`inline-block mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                                          user.role === "team_lead"
                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                        }`}
                                      >
                                        {roleMeta?.label}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            {escalatableUsers.every((u) => groupMembers.some((m) => m.id === u.id)) && (
                              <p className="text-[10px] text-muted-foreground text-center py-3">
                                Everyone is already in this chat
                              </p>
                            )}
                          </div>
                          <div className="p-2 border-t">
                            <Button
                              size="sm"
                              className="w-full h-8 text-xs"
                              disabled={escalateSelected.length === 0}
                              onClick={addSelectedToGroup}
                            >
                              {t("Add to Chat")}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </header>

                {/* Group members bar */}
                {isGroupChat && (
                  <div className="flex items-center gap-2 px-5 py-2 border-b bg-muted/40 shrink-0 overflow-x-auto">
                    <span className="text-[10px] text-muted-foreground shrink-0">In chat:</span>
                    <span className="inline-flex items-center gap-1.5 shrink-0">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        ME
                      </span>
                      <span className="text-[10px] font-medium">You (Agent)</span>
                    </span>
                    {groupMembers.map((m, i) => {
                      const style = MEMBER_STYLES[i % MEMBER_STYLES.length];
                      return (
                        <span key={m.id} className="inline-flex items-center gap-1.5 shrink-0">
                          <span className="relative">
                            <span
                              className={`w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${style.avatar}`}
                            >
                              {initials(m.name)}
                            </span>
                            <button
                              onClick={() => removeFromGroup(m.id)}
                              title={`Remove ${m.name}`}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </span>
                          <span className={`text-[10px] font-medium ${style.name}`}>{m.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {localMessages.map((msg, msgIdx) => {
                    if (msg.isSystemNote) {
                      return (
                        <div key={msg.id} className="flex items-center gap-2 my-2">
                          <span className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                            {msg.text}
                          </span>
                          <span className="flex-1 h-px bg-border" />
                        </div>
                      );
                    }
                    if (msg.receipt) {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="space-y-1">
                            <TransferReceiptCard receipt={msg.receipt} />
                            <p className="text-[10px] text-muted-foreground text-right">Receipt sent · {msg.time}</p>
                          </div>
                        </div>
                      );
                    }
                    if (msg.isOrder) {
                      return (
                        <div key={msg.id} className="pinned-order animate-slide-up">
                          <p className="text-xs font-medium">📌 {msg.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
                        </div>
                      );
                    }
                    const isCustomer = msg.sender === "customer";
                    const memberIdx = groupMembers.findIndex((m) => m.name === msg.senderName);
                    const memberStyle = memberIdx >= 0 ? MEMBER_STYLES[memberIdx % MEMBER_STYLES.length] : null;
                    const prev = localMessages[msgIdx - 1];
                    const showName =
                      isCustomer || !prev || prev.senderName !== msg.senderName || prev.isSystemNote || prev.isOrder;
                    return (
                      <Fragment key={msg.id}>
                        <div className={isCustomer ? "flex justify-start" : "flex justify-end"}>
                          <div
                            className={
                              isCustomer
                                ? "chat-bubble-other"
                                : memberStyle
                                  ? `chat-bubble-self ${memberStyle.bubble} text-foreground`
                                  : "chat-bubble-self"
                            }
                          >
                            {showName && (
                              <p
                                className={`text-[9px] font-semibold mb-0.5 ${getSenderColor(msg.sender, msg.senderName)}`}
                              >
                                {msg.senderName}
                              </p>
                            )}

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
                        {/* Detected bank details chip */}
                        {(() => {
                          if (msg.image || msg.sender !== "customer") return null;
                          if (selectedConvo?.channel !== "whatsapp") return null;
                          const det = detectBankDetails(msg.text);
                          if (!det) return null;
                          return (
                            <div className={isCustomer ? "flex justify-start" : "flex justify-end"}>
                              <button
                                type="button"
                                onClick={() => {
                                  resetTransferForm();
                                  setTransferBank(det.bank);
                                  setTransferAccount(det.account);
                                  if (det.recipient) {
                                    setTransferRecipient(det.recipient);
                                    setTransferVerified(true);
                                  }
                                  setTransferOpen(true);
                                  toast.success("Bank details prefilled");
                                }}
                                className="mt-1 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 hover:bg-accent/10 text-accent px-3 py-1 text-[11px] font-medium transition-colors"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span className="font-semibold">{det.bank}</span>
                                <span className="font-mono opacity-80">· {det.account}</span>
                                <span className="opacity-70">→ Use in Transfer</span>
                              </button>
                            </div>
                          );
                        })()}
                      </Fragment>
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
                        {renderComposerActions()}
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
                {selectedGroup && (
                  <div className="p-3 border-b">
                    <CustomerAliasSelector value={groupCustomerAlias} onChange={setGroupCustomerAlias} />
                  </div>
                )}
                {selectedId && panelConvo ? (
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
                                    {(
                                      [
                                        ["Order ID", o.id],
                                        ["Card", `${o.cardType}${o.cardCurrency ? ` / ${o.cardCurrency}` : ""}`],
                                        ["Amount", `$${o.amount}`],
                                        [
                                          "Points price",
                                          <span key="pp" className="inline-flex items-center gap-0.5">
                                            <Coins className="w-3 h-3" />
                                            {(o.unitPrice || o.nairaRate).toLocaleString()}
                                          </span>,
                                        ],
                                        [
                                          "Release",
                                          <span key="rel" className="inline-flex items-center gap-0.5">
                                            <Coins className="w-3 h-3" />
                                            {o.payout.toLocaleString()}
                                          </span>,
                                        ],
                                        ...(o.cardNumbers.length > 0 ? [["Card No.", o.cardNumbers.join(", ")]] : []),
                                        ["Time", o.timestamp],
                                      ] as Array<[string, React.ReactNode]>
                                    ).map(([k, v]) => (
                                      <div key={k} className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">{k}</span>
                                        <span className="font-medium">{v}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Payout indicator — wallet is credited for all customers */}
                                  {currentOrderStatus === "success" && (
                                    <div className="mt-2 bg-success/10 border border-success/30 rounded-lg p-2.5 text-center">
                                      <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
                                      <p className="text-xs font-medium text-success">
                                        {transferCompletedOrders.has(o.id)
                                          ? "Wallet Credited · Transferred"
                                          : "Wallet Credited"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Pts {o.payout.toLocaleString()} added to customer's wallet
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
                          <span className="font-medium">{panelConvo.alias}</span>
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
                          <span className="font-medium">{panelConvo.goodRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Value</span>
                          <span className="font-medium">{panelConvo.totalValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tags</span>
                          <span className="font-medium">{panelConvo.tags.join(", ") || "None"}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : selectedGroup ? (
                  <p className="p-3 text-[11px] text-muted-foreground">
                    Select a customer to view their orders in this group chat.
                  </p>

                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                    <p className="text-xs text-center">Select a conversation to view orders</p>
                  </div>
                )}


              </TabsContent>

              <TabsContent
                value="sales"
                className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col data-[state=inactive]:hidden"
              >
                <div
                  className="flex-1 overflow-hidden"
                  onDragOver={(e) => {
                    if (selectedGroup) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (!selectedGroup) return;
                    e.preventDefault();
                    const alias = e.dataTransfer.getData("text/cardchat-alias") || e.dataTransfer.getData("text/plain");
                    if (alias) {
                      setGroupCustomerAlias(alias);
                      toast.success(`Customer ${alias} selected from dropped image`);
                    } else {
                      toast.error("Sender is not a registered customer");
                    }
                  }}
                >

                  <CardlightPanel
                    key={selectedGroup ? groupCustomerAlias ?? "none" : selectedConvo?.alias ?? "none"}
                    open={rightTab === "sales"}
                    onClose={() => setRightTab("orders")}
                    onComplete={handleOrderComplete}
                    customerAlias={selectedGroup ? groupCustomerAlias ?? undefined : selectedConvo?.alias}
                    embedded
                    groupSelector={
                      selectedGroup ? (
                        <div className="p-3 border-b shrink-0 space-y-1.5">
                          <CustomerAliasSelector value={groupCustomerAlias} onChange={setGroupCustomerAlias} />
                          <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            Group chats have multiple customers — select who this order belongs to, or drag a card
                            image from the chat onto this panel to auto-fill the sender's alias.
                          </p>
                        </div>
                      ) : undefined
                    }
                    onBuyerSelected={
                      selectedId ? (simulatedResult) => handleBuyerSelected(selectedId, simulatedResult) : undefined
                    }
                  />
                </div>
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
                  // Deterministic mock fallbacks derived from order id so each order shows realistic data
                  const seed = detailOrder.id || "0";
                  const seedNum = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
                  const fallbackCardNumber = String(4000000000000000 + ((seedNum * 7919) % 999999999999)).slice(0, 16);
                  const cardNumber =
                    detailOrder.cardNumbers.length > 0 ? detailOrder.cardNumbers.join(", ") : fallbackCardNumber;
                  const orderCode = detailOrder.id;
                  const mockNicknames = ["肖捺", "王伟", "李娜", "Chen Yu", "Zhang Min", "Liu Yang"];
                  const buyerNickname =
                    (detailOrder as any).buyerNickname ||
                    (detailOrder as any).buyer ||
                    mockNicknames[seedNum % mockNicknames.length];
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
                  const rawCreateTime = (detailOrder as any).createTime;
                  const createTime = rawCreateTime
                    ? formatDate(new Date(Number(rawCreateTime)))
                    : detailOrder.createdAt || detailOrder.timestamp;
                  const cardFaceValue = detailOrder.amount;
                  const purchaseFaceValue = detailOrder.amount;
                  const purchaseRate = detailOrder.unitPrice || detailOrder.nairaRate || 0;
                  const settleCoin = (detailOrder as any).settleCoin || "USD";
                  const settleRate = (detailOrder as any).settleRate || 1;
                  const settleFaceValue = (detailOrder as any).settleFaceValue || cardFaceValue;
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

                  const unitPriceCalc = nairaRate ? Number(purchaseRate) / Number(nairaRate) : Number(purchaseRate);
                  const orderAmountCalc = Number(purchaseFaceValue) * unitPriceCalc;
                  const settlementAmountCalc = Number(settleRate) * Number(settleFaceValue);
                  const orderRowsAll: [string, React.ReactNode, boolean?, string?][] = [
                    ["Order receiving time", detailOrder.createdAt || detailOrder.timestamp],
                    ["Order id", orderCode, true],
                    ["Order face value", `${purchaseFaceValue}`],
                    ["Order unit price", unitPriceCalc.toLocaleString(undefined, { maximumFractionDigits: 4 })],
                    ["Order amount", orderAmountCalc.toLocaleString(undefined, { maximumFractionDigits: 2 })],
                    ["Card Rate (CNY)", unitPriceCalc.toLocaleString(undefined, { maximumFractionDigits: 4 })],
                    ["Settlement coin", settleCoin],
                    ["Settle face value", `${settleFaceValue}`],
                    ["Settle rate", `${settleRate}`],
                    [
                      "Settlement amount",
                      `₦${settlementAmountCalc.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                    ],
                    [
                      "Total Release",
                      <span className="inline-flex items-center gap-0.5 font-semibold">
                        <Coins className="w-3 h-3" />
                        {(Number(nairaRate || 0) * unitPriceCalc * Number(purchaseFaceValue || 0)).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}
                      </span>,
                    ],
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
                            {/* Card number with masking + reveal toggle (unified with card number) */}
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
                                    aria-label={showCardNumber ? "Hide card code" : "Show card code"}
                                  >
                                    {showCardNumber ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
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
                                          "Points price",
                                          `${neg.oldRate.toLocaleString()}`,
                                          `${neg.newRate.toLocaleString()}`,
                                        ],
                                        [
                                          "Release",
                                          `${neg.oldAmount.toLocaleString()}`,
                                          `${neg.newAmount.toLocaleString()}`,
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
                  <span className="text-muted-foreground">Points price</span>
                  <span className="font-medium">Pts {oldRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Points rate</span>
                  <span className="font-medium">Pts {(negOrder?.nairaRate || 289).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Card Rate (CNY)</span>
                  <span className="font-medium">
                    {(negOrder?.nairaRate ? oldRate / negOrder.nairaRate : oldRate).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </span>
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
                  <span className="font-bold">Pts {oldPayout.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Actual Denomination</label>
                  <Input
                    type="number"
                    placeholder={`e.g. 50`}
                    value={negotiateDenom}
                    onChange={(e) => setNegotiateDenom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Actual Points price</label>
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
                        Pts {oldPayout.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Points rate</span>
                      <span className="font-medium">Pts {(negOrder?.nairaRate || 289).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">New Payout</span>
                      <span className="font-bold text-primary">Pts {newPayout.toLocaleString()}</span>
                    </div>
                    {newPayout < oldPayout && (
                      <p className="text-[10px] text-warning text-center">
                        Difference: -Pts {(oldPayout - newPayout).toLocaleString()}
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
                      addSystemMessage(`✅ Negotiation confirmed. Payout Pts ${payout.toLocaleString()}.`);
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
              <Wallet className="w-5 h-5 text-accent" /> Points Adjustment
            </DialogTitle>
          </DialogHeader>
          {(() => {
            const cw = txConvo ? customerWallets.find((w) => w.alias === txConvo.alias) : null;
            const custTxns = txConvo ? walletTransactions.slice(0, 5) : [];
            const custAdjustments = txConvo
              ? fundAdjustments.filter((a) => a.customerAlias === txConvo.alias)
              : [];
            return (
              <>
                {selectedGroup && (
                  <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{selectedGroup.groupName}</span>
                    </div>
                    <CustomerAliasSelector value={groupCustomerAlias} onChange={setGroupCustomerAlias} label="Customer" />
                    <p className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      Group chats have multiple customers — select whose wallet to adjust.
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {fundAdjustType === "addition" ? "Add" : "Deduct"} points{" "}
                  {fundAdjustType === "addition" ? "to" : "from"} <strong>{txConvo?.alias ?? "—"}</strong>'s wallet.
                </p>


                {/* Wallet Balance Card */}
                {cw && (
                  <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Current Wallet Balance
                    </p>
                    <p className="font-heading text-xl font-bold text-accent">Pts {cw.balance.toLocaleString()}</p>
                    <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span>
                        Total Credits:{" "}
                        <span className="text-success font-medium">Pts {cw.totalCredits.toLocaleString()}</span>
                      </span>
                      <span>
                        Withdrawals:{" "}
                        <span className="text-destructive font-medium">Pts {cw.totalWithdrawals.toLocaleString()}</span>
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
                    <label className="text-xs font-medium">Amount (Pts )</label>
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
                          .filter((o) => (txConvo ? o.customer === txConvo.alias : true))
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
                              <span className="font-medium">Pts {relOrder.nairaRate}</span>
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
                            {tx.type === "credit" ? "+" : "-"}Pts {tx.amount.toLocaleString()}
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
                            {a.type === "addition" ? "+" : "-"}Pts {a.amount.toLocaleString()}
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
                disabled={!txConvo || !fundAdjustAmount || Number(fundAdjustAmount) <= 0 || !fundAdjustReason}
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
                    if (!txConvo || !amount || amount <= 0 || !fundAdjustReason) return;
                    const roleNames: Record<string, string> = { super_admin: "Admin One", team_lead: "Sarah Lead" };
                    const adjustment: FundAdjustment = {
                      id: `FA-${Date.now().toString(36).toUpperCase()}`,
                      customerAlias: txConvo.alias,
                      type: fundAdjustType,
                      amount,
                      reason: fundAdjustReason,
                      performedBy: roleNames[role] || role,
                      timestamp: formatDate(new Date()),
                    };
                    setFundAdjustments((prev) => [adjustment, ...prev]);
                    addSystemMessage(
                      `💰 Fund ${fundAdjustType}: ${fundAdjustType === "addition" ? "+" : "-"}Pts ${amount.toLocaleString()} — ${fundAdjustReason} (by ${adjustment.performedBy})`,
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

      {/* Transfer Modal (WhatsApp payment) */}
      <Dialog
        open={transferOpen}
        onOpenChange={(open) => {
          setTransferOpen(open);
          if (!open) resetTransferForm();
        }}
      >
        <DialogContent
          className="max-w-none w-[72vw] h-[92vh] p-0 gap-0 overflow-hidden flex flex-col"
          style={{ resize: "both" as const, minWidth: 720, minHeight: 640 }}
        >
          <DialogHeader className="px-5 py-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 font-heading">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
              </div>
              <span>Process Transfer</span>
              {txConvo && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  · Sending to <span className="font-semibold text-foreground">{txConvo.alias}</span> via WhatsApp
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-[minmax(0,0.88fr)_504px] flex-1 min-h-0">
            {/* ============== FORM ============== */}
            <div className="overflow-y-auto px-5 py-4 space-y-3 border-r flex flex-col justify-between">
              {/* Group chats: pick the customer this transfer belongs to */}
              {selectedGroup && (
                <section className="rounded-lg border bg-card">
                  <header className="px-3 py-2 border-b flex items-center justify-between">
                    <h3 className="text-xs font-semibold">Customer</h3>
                    <span className="text-[10px] text-muted-foreground">{selectedGroup.groupName}</span>
                  </header>
                  <div className="p-3">
                    <CustomerAliasSelector value={groupCustomerAlias} onChange={setGroupCustomerAlias} label="Customer" />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Required for group conversations — beneficiaries and records update to this customer.
                    </p>
                  </div>
                </section>
              )}

              {/* Wallet balance card */}
              {(() => {
                const credits = transferEligibleOrders
                  .filter((o) => o.status === "success")
                  .reduce((s, o) => s + (o.payout || 0), 0);
                const priorTransfers = txConvo
                  ? (
                      JSON.parse(sessionStorage.getItem(`cc.transfers.${txConvo.id}`) || "[]") as Array<{
                        amount: number;
                      }>
                    ).reduce((s, t) => s + (t.amount || 0), 0)
                  : 0;
                const balance = Math.max(0, credits - priorTransfers);
                const amt = Number(transferAmount || 0);
                const insufficient = amt > 0 && amt > balance;
                return (
                  <section className="rounded-lg border bg-card">
                    <header className="px-3 py-2 border-b">
                      <h3 className="text-xs font-semibold">Wallet Balance</h3>
                    </header>
                    <div className="p-3">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Available for transfer</p>
                          <p className="font-heading text-xl font-bold mt-0.5">Pts {balance.toLocaleString()}</p>
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground space-y-0.5">
                          <p>
                            Credited:{" "}
                            <span className="text-emerald-600 font-medium">Pts {credits.toLocaleString()}</span>
                          </p>
                          <p>
                            Transferred:{" "}
                            <span className="text-foreground font-medium">Pts {priorTransfers.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      {insufficient && (
                        <p className="mt-1.5 text-[11px] text-destructive">
                          Transfer amount exceeds available wallet balance.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })()}

              {/* Recipient card */}
              <section className="rounded-lg border bg-card">
                <header className="px-3 py-2 border-b flex items-center justify-between">
                  <h3 className="text-xs font-semibold">Recipient</h3>
                  {transferVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <CheckCheck className="w-3 h-3" /> Account verified
                    </span>
                  )}
                </header>
                <div className="p-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Transfer Method</Label>
                    <div className="h-9 flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3">
                      <span className="text-sm font-medium">{transferMethod}</span>
                      <span className="text-[10px] text-muted-foreground">Active channel</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Set in Wallets &rsaquo; Payment Channel</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">
                      <span className="text-destructive">*</span> Bank Name
                    </Label>
                    <Select
                      value={transferBank}
                      onValueChange={(v) => {
                        setTransferBank(v);
                        setTransferVerified(false);
                        setTransferRecipient("");
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Please select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianBanks.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-[11px]">
                      <span className="text-destructive">*</span> Bank Account Number
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        className="h-9 font-mono"
                        placeholder="Enter 10-digit account number"
                        value={transferAccount}
                        onChange={(e) => {
                          setTransferAccount(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setTransferVerified(false);
                          setTransferRecipient("");
                        }}
                        inputMode="numeric"
                      />
                      <Button
                        variant="outline"
                        className="h-9 shrink-0 min-w-[80px]"
                        disabled={!transferBank || transferAccount.length < 10 || transferVerifying}
                        onClick={() => {
                          setTransferVerifying(true);
                          setTimeout(() => {
                            const mockName = (txConvo?.alias || "CUSTOMER").toUpperCase() + " ADEBAYO";
                            setTransferRecipient(mockName);
                            setTransferVerified(true);
                            setTransferVerifying(false);
                            toast.success("Account verified");
                          }, 900);
                        }}
                      >
                        {transferVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-[11px]">
                      <span className="text-destructive">*</span> Recipient Name
                    </Label>
                    <div className="relative">
                      <Input
                        className="h-9 pr-9 font-medium bg-muted/40"
                        placeholder="Verify bank account to fetch recipient name"
                        value={maskName(transferRecipient)}
                        disabled
                      />
                      {transferVerified && (
                        <CheckCheck className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Name is masked for privacy; populated only after verification.
                    </p>
                  </div>
                </div>
              </section>

              {/* Amount card */}
              <section className="rounded-lg border bg-card">
                <header className="px-3 py-2 border-b">
                  <h3 className="text-xs font-semibold">Amount</h3>
                </header>
                <div className="p-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">
                      <span className="text-destructive">*</span> Transfer Amount
                    </Label>
                    <div className="relative">
                      <Input
                        className="h-9 pr-14 text-sm font-semibold"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value.replace(/[^\d.]/g, ""))}
                        inputMode="decimal"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground border rounded px-1.5 py-0.5 bg-muted">
                        PTS
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Max Pts 2,000,000 per transaction</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">
                      <span className="text-destructive">*</span> Points Rate
                    </Label>
                    <Input
                      className="h-9 text-sm font-semibold"
                      placeholder="Enter rate"
                      value={transferRate}
                      onChange={(e) => setTransferRate(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                    />
                    {transferAmount && transferRate && Number(transferRate) > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        ≈ ${(Number(transferAmount) / Number(transferRate)).toFixed(2)} USD equivalent
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="rounded-lg border bg-card">
                <header className="px-3 py-2 border-b">
                  <h3 className="text-xs font-semibold">
                    Notes <span className="font-normal text-muted-foreground">(optional)</span>
                  </h3>
                </header>
                <div className="p-3">
                  <Textarea
                    placeholder="Add a note for internal reference…"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    rows={2}
                    className="resize-none min-h-[54px]"
                  />
                </div>
              </section>
            </div>

            {/* ============== RIGHT PANEL: Beneficiaries + Records ============== */}
            <div className="overflow-y-auto bg-muted/10">
              {(() => {
                const key = `cc.transfers.${txConvo?.id || ""}`;
                const saved: Array<{
                  bank: string;
                  account: string;
                  recipient: string;
                  method: string;
                  amount: number;
                  at: number;
                }> = txConvo ? JSON.parse(sessionStorage.getItem(key) || "[]") : [];

                // Saved beneficiaries — dedupe by bank+account
                const seen = new Set<string>();
                const beneficiaries = saved.filter((h) => {
                  const k = `${h.bank}|${h.account}`;
                  if (seen.has(k)) return false;
                  seen.add(k);
                  return true;
                });

                const mock = txConvo
                  ? [
                      {
                        method: "PalmPay3",
                        at: new Date("2026-06-30T03:08:00").getTime(),
                        orderNo: "X1782763735728586",
                        refNo: "41260629200855993684",
                        bank: "Opay",
                        account: "9044585925",
                        recipient: "TSEYI OLOLO",
                        amount: 1641500,
                        nickname: "/",
                        status: "Success" as const,
                      },
                      {
                        method: "PalmPay2",
                        at: new Date("2026-06-16T04:27:00").getTime(),
                        orderNo: "X1781558859434543",
                        refNo: "41260615212739917821",
                        bank: "MONIEPOINT MICROFINANCE BANK",
                        account: "7025207542",
                        recipient: "OBORO SAMUEL ANOINTED",
                        amount: 330900,
                        nickname: "Sammy",
                        status: "Success" as const,
                      },
                      {
                        method: "PalmPay3",
                        at: new Date("2026-06-03T23:21:00").getTime(),
                        orderNo: "X1782050366673779",
                        refNo: "41260603162107663455",
                        bank: "Opay",
                        account: "8168956827",
                        recipient: "OGAGA PERKINS ESIENNA",
                        amount: 5000,
                        nickname: "Buying All countries Gift cards & Mailing items to all countries",
                        status: "Success" as const,
                      },
                    ]
                  : [];
                const rows = [
                  ...saved.map((s) => ({
                    method: s.method,
                    at: s.at,
                    orderNo: `X${String(s.at).slice(-16)}`,
                    refNo: `41${String(s.at).slice(-18)}`,
                    bank: s.bank,
                    account: s.account,
                    recipient: s.recipient,
                    amount: s.amount,
                    nickname: txConvo?.alias || "/",
                    status: "Success" as const,
                  })),
                  ...mock,
                ];
                const fmtDate = (t: number) => {
                  const d = new Date(t);
                  const p = (n: number) => String(n).padStart(2, "0");
                  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
                };

                return (
                  <>
                    {/* Saved beneficiaries */}
                    {beneficiaries.length > 0 && (
                      <div className="px-4 py-3 border-b bg-background">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Saved Beneficiaries
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {beneficiaries.map((h, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setTransferBank(h.bank);
                                setTransferAccount(h.account);
                                setTransferRecipient(h.recipient);
                                setTransferVerified(true);
                                
                                toast.success("Beneficiary loaded");
                              }}
                              className="group text-left rounded-md border bg-background hover:border-accent hover:bg-accent/5 transition-colors px-2.5 py-1.5 max-w-[220px]"
                              title={`${maskName(h.recipient)} · ${h.bank} · ${h.account}`}
                            >
                              <div className="text-[11px] font-semibold truncate">{maskName(h.recipient)}</div>
                              <div className="text-[10px] font-mono text-muted-foreground truncate">
                                {h.bank} · {h.account}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transfer records */}
                    <div className="px-4 py-2.5 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
                      <div className="text-sm font-semibold">Transfer Records</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Recent transactions {txConvo && `· ${txConvo.alias}`}
                      </div>
                    </div>
                    {rows.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-10">No transfer records</div>
                    ) : (
                      <div className="bg-background">
                        {/* column headers */}
                        <div className="grid grid-cols-[140px_1fr_120px_90px] gap-4 px-4 py-2 bg-muted/40 border-b text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <div>Time / Order No.</div>
                          <div>Info</div>
                          <div className="text-right">Amount</div>
                          <div className="text-right">Status</div>
                        </div>
                        {rows.map((r, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-[140px_1fr_120px_90px] gap-4 px-4 py-3 hover:bg-muted/30 transition-colors items-start border-b last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold">{r.method}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(r.at)}</div>
                              <div className="text-[10px] font-mono text-muted-foreground truncate">{r.orderNo}</div>
                              <div className="text-[10px] font-mono text-muted-foreground truncate">{r.refNo}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] uppercase text-muted-foreground truncate">{r.bank}</div>
                              <div className="text-xs font-mono font-semibold truncate">{r.account}</div>
                              <div className="text-[11px] text-muted-foreground truncate" title={maskName(r.recipient)}>
                                {maskName(r.recipient)}
                              </div>
                            </div>
                            <div className="text-right text-xs font-semibold whitespace-nowrap">
                              Pts {r.amount.toLocaleString()}
                            </div>
                            <div className="text-right text-[10px] font-semibold text-emerald-600 uppercase">
                              Success
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Sticky footer */}
          <div className="px-5 py-2.5 border-t bg-background flex items-center justify-between shrink-0">
            <div className="text-[11px] text-muted-foreground">
              {transferAmount && transferRate && Number(transferRate) > 0 ? (
                <>
                  Sending{" "}
                  <span className="font-semibold text-foreground">Pts {Number(transferAmount).toLocaleString()}</span>{" "}
                  via {transferMethod}
                </>
              ) : (
                <>Fill in required fields to enable transfer</>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setTransferOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={(() => {
                  if (!transferBank || !transferVerified || !transferAmount || !transferRate) return true;
                  const amt = Number(transferAmount || 0);
                  if (!txConvo) return true;
                  const credits = transferEligibleOrders
                    .filter((o) => o.status === "success")
                    .reduce((s, o) => s + (o.payout || 0), 0);
                  const priorTransfers = (
                    JSON.parse(sessionStorage.getItem(`cc.transfers.${txConvo.id}`) || "[]") as Array<{
                      amount: number;
                    }>
                  ).reduce((s, t) => s + (t.amount || 0), 0);
                  return amt > Math.max(0, credits - priorTransfers);
                })()}
                onClick={() => {
                  const amt = Number(transferAmount || 0);
                  if (txConvo) {
                    const key = `cc.transfers.${txConvo.id}`;
                    const prev = JSON.parse(sessionStorage.getItem(key) || "[]");
                    prev.unshift({
                      bank: transferBank,
                      account: transferAccount,
                      recipient: transferRecipient,
                      method: transferMethod,
                      amount: amt,
                      at: Date.now(),
                    });
                    sessionStorage.setItem(key, JSON.stringify(prev.slice(0, 20)));
                  }
                  const wallet = txConvo ? customerWallets.find((w) => w.alias === txConvo.alias) : null;
                  const receipt: TransferReceipt = {
                    amount: amt,
                    fee: 0,
                    status: "Success",
                    bankName: transferBank,
                    accountNumber: transferAccount,
                    accountName: transferRecipient,
                    balance: Math.max(0, (wallet?.balance ?? 0) - amt),
                    transactionNumber: `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`,
                  };
                  addSystemMessage(
                    `💸 Transfer sent via ${transferMethod}: Pts ${amt.toLocaleString()} to ${transferRecipient} (${transferBank} · ${transferAccount})${transferNote ? ` — ${transferNote}` : ""}`,
                  );
                  addSystemMessage("", receipt);
                  toast.success("Transfer successful — receipt sent to customer");
                  setTransferOpen(false);
                  resetTransferForm();
                }}
              >
                Transfer Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
