import { useState, useEffect } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { bankAccounts, walletBalance, walletTransactions } from "@/data/mock";
import { User, CreditCard, FileText, BarChart3, ChevronRight, Plus, Shield, Settings, LogOut, Trash2, CheckCircle, ArrowLeft, Copy, BookOpen, Sun, Moon, Clock, XCircle, Loader2, Image as ImageIcon, Mail, Pencil, ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, Send, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type CustomerVisibleStatus = "order_created" | "order_processing" | "success" | "failed";

interface CustomerOrder {
  id: string;
  cardType: string;
  denomination: string;
  totalFaceValue: string;
  rate: string;
  nairaRate: string;
  totalPayout: string;
  status: CustomerVisibleStatus;
  date: string;
  bank: string;
}

const STATUS_CONFIG: Record<CustomerVisibleStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  order_created:    { label: "Order Created",    color: "text-primary",     bg: "bg-primary/10",     icon: Clock },
  order_processing: { label: "Order Processing", color: "text-warning",     bg: "bg-warning/10",     icon: Loader2 },
  success:          { label: "Success",          color: "text-success",     bg: "bg-success/10",     icon: CheckCircle },
  failed:           { label: "Failed",           color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const STATUS_ORDER: CustomerVisibleStatus[] = ["order_created", "order_processing", "success"];

const TIMELINE_STEPS = [
  "Order created",
  "Order processing",
  "Success",
];

const customerOrders: CustomerOrder[] = [
  { id: "ORD-20260318-001", cardType: "iTunes US", denomination: "$100 x2", totalFaceValue: "$200", rate: "₦680", nairaRate: "₦1,580/CNY", totalPayout: "₦215,200", status: "success", date: "Mar 18, 2026", bank: "First Bank ****1234" },
  { id: "ORD-20260317-005", cardType: "Amazon US", denomination: "$50 x3", totalFaceValue: "$150", rate: "₦620", nairaRate: "₦1,580/CNY", totalPayout: "₦93,000", status: "success", date: "Mar 17, 2026", bank: "GTBank ****5678" },
  { id: "ORD-20260316-003", cardType: "Steam US", denomination: "$200 x1", totalFaceValue: "$200", rate: "₦600", nairaRate: "₦1,580/CNY", totalPayout: "₦120,000", status: "failed", date: "Mar 16, 2026", bank: "Access Bank ****9012" },
  { id: "ORD-20260315-008", cardType: "iTunes UK", denomination: "$25 x4", totalFaceValue: "$100", rate: "₦850", nairaRate: "₦1,580/CNY", totalPayout: "₦85,000", status: "order_processing", date: "Mar 15, 2026", bank: "First Bank ****1234" },
];

export default function CustomerMe() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerVisibleStatus>("all");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editStep, setEditStep] = useState<"info" | "otp">("info");
  const [editName, setEditName] = useState("John Doe");
  const [editEmail, setEditEmail] = useState("johndoe@gmail.com");
  const [otp, setOtp] = useState("");
  const [savedName, setSavedName] = useState("John Doe");
  const [savedEmail, setSavedEmail] = useState("johndoe@gmail.com");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.openWallet) {
      setActiveSection("wallet");
    }
  }, [location.state]);

  // Wallet state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawComplete, setWithdrawComplete] = useState(false);
  const [walletTxFilter, setWalletTxFilter] = useState<"all" | "credit" | "withdrawal">("all");
  const [balanceVisible, setBalanceVisible] = useState(false);

  const handleEditSave = () => {
    if (editEmail !== savedEmail) {
      setEditStep("otp");
    } else {
      setSavedName(editName);
      setShowEditProfile(false);
    }
  };

  const handleOtpVerify = () => {
    if (otp.length === 4) {
      setSavedName(editName);
      setSavedEmail(editEmail);
      setShowEditProfile(false);
      setEditStep("info");
      setOtp("");
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && withdrawBank) {
      setWithdrawComplete(true);
      setTimeout(() => {
        setShowWithdraw(false);
        setWithdrawComplete(false);
        setWithdrawAmount("");
        setWithdrawBank("");
      }, 2000);
    }
  };

  const initials = savedName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // ── Wallet ──
  if (activeSection === "wallet") {
    const filteredTx = walletTxFilter === "all" ? walletTransactions : walletTransactions.filter(t => t.type === walletTxFilter);

    return (
      <CustomerLayout>
        <div className="flex flex-col h-full">
          <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
            <button onClick={() => { setActiveSection(null); setShowWithdraw(false); }} className="text-sm text-accent">← Back</button>
            <h2 className="font-heading font-semibold">My Wallet</h2>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-5 text-accent-foreground">
              <div className="flex items-center justify-between">
                <p className="text-xs opacity-80">Available Balance</p>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="opacity-70 hover:opacity-100 transition-opacity">
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-3xl font-heading font-bold mt-1">{balanceVisible ? `₦${walletBalance.toLocaleString()}` : "₦ ••••••"}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30 border-0"
                  onClick={() => setShowWithdraw(true)}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Withdraw
                </Button>
              </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdraw && (
              <div className="bg-card border rounded-xl p-4 space-y-3 animate-slide-up">
                {withdrawComplete ? (
                  <div className="text-center py-4 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <p className="font-heading font-semibold">Withdrawal Successful</p>
                    <p className="text-xs text-muted-foreground">₦{parseInt(withdrawAmount).toLocaleString()} sent to your bank</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Withdraw to Bank</h3>
                      <button onClick={() => setShowWithdraw(false)} className="text-muted-foreground text-sm">✕</button>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Amount (₦)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Available: ₦{walletBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Select Bank Account</label>
                      <Select value={withdrawBank} onValueChange={setWithdrawBank}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map(a => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.bankName} · {a.accountNumber} — {a.holderName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        disabled={!withdrawAmount || !withdrawBank || Number(withdrawAmount) > walletBalance || Number(withdrawAmount) <= 0}
                        onClick={handleWithdraw}
                      >
                        Confirm Withdrawal
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Transaction Filters */}
            <div className="flex gap-2">
              {(["all", "credit", "withdrawal"] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={walletTxFilter === f ? "outline" : "ghost"}
                  className="text-xs h-7"
                  onClick={() => setWalletTxFilter(f)}
                >
                  {f === "all" ? "All" : f === "credit" ? "Credits" : "Withdrawals"}
                </Button>
              ))}
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
              {filteredTx.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-card border rounded-xl">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === "credit" ? "bg-success/10" : "bg-warning/10"}`}>
                    {t.type === "credit" ? <ArrowDownLeft className="w-4 h-4 text-success" /> : <ArrowUpRight className="w-4 h-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{t.date} · {t.time}</p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${t.type === "credit" ? "text-success" : "text-warning"}`}>
                    {t.type === "credit" ? "+" : "-"}₦{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
              {filteredTx.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions</p>
              )}
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // ── Bank Accounts ──
  if (activeSection === "bank") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => { setActiveSection(null); setShowAddBank(false); }} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">Add Bank Accounts</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bankAccounts.map(a => (
            <div key={a.id} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{a.bankName} · {a.accountNumber}</p>
                <p className="text-xs text-muted-foreground">{a.holderName}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <button><Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground text-center">{bankAccounts.length}/5 accounts verified</p>

          {showAddBank ? (
            <div className="bg-card border rounded-xl p-4 space-y-3 animate-slide-up">
              <h3 className="text-sm font-semibold">Add Bank Account</h3>
              <div>
                <label className="text-xs text-muted-foreground">Bank Name</label>
                <Input placeholder="Select bank" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Account Number</label>
                <Input placeholder="Enter 10-digit account number" className="mt-1" />
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                <p className="text-xs text-accent font-medium">✓ Verified: JOHN ADEBAYO</p>
                <p className="text-[10px] text-muted-foreground mt-1">Name returned by bank verification API</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAddBank(false)}>Cancel</Button>
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Confirm & Save</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowAddBank(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Bank Account
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Order Detail ──
  if (activeSection === "orders" && selectedOrder) {
    const cfg = STATUS_CONFIG[selectedOrder.status];
    const StatusIcon = cfg.icon;
    const currentIdx = selectedOrder.status === "failed" ? -1 : STATUS_ORDER.indexOf(selectedOrder.status);

    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setSelectedOrder(null)} className="text-sm text-accent flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-heading font-semibold">Order Details</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Header */}
          <div className={`rounded-xl p-4 text-center space-y-2 ${cfg.bg} border`}>
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-card`}>
              <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
            </div>
            <p className="text-lg font-heading font-bold">{selectedOrder.totalPayout}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {/* Progress Tracker */}
          {selectedOrder.status !== "failed" && (
            <div className="flex items-center gap-1 px-2">
              {STATUS_ORDER.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i <= currentIdx ? "bg-accent" : "bg-muted-foreground/30"}`} />
                  {i < STATUS_ORDER.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded ${i < currentIdx ? "bg-accent" : "bg-muted-foreground/20"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Order Info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Info</p>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              {[
                { label: "Order ID", value: selectedOrder.id, copy: true },
                { label: "Date", value: selectedOrder.date },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium">{item.value}</p>
                    {item.copy && <Copy className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              {[
                { label: "Card Type", value: selectedOrder.cardType },
                { label: "Denomination", value: selectedOrder.denomination },
                { label: "Total Face Value", value: selectedOrder.totalFaceValue },
                { label: "Rate (per $)", value: selectedOrder.rate },
                { label: "Naira Rate", value: selectedOrder.nairaRate },
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
                <p className="text-xs font-medium">{selectedOrder.totalPayout}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Fee</p>
                <p className="text-xs font-medium">₦0</p>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Total Payout</p>
                <p className="text-sm font-heading font-bold text-accent">{selectedOrder.totalPayout}</p>
              </div>
              {selectedOrder.status === "success" && (
                <div className="bg-success/10 rounded-lg p-2 flex items-center gap-2 mt-1">
                  <Wallet className="w-4 h-4 text-success" />
                  <p className="text-[10px] text-success font-medium">Credited to wallet</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
            <div className="space-y-3 pl-3 border-l-2 border-accent/20">
              {selectedOrder.status === "failed" ? (
                <>
                  {[
                    { event: "Order created", done: true, isFail: false },
                    { event: "Order processing", done: true, isFail: false },
                    { event: "Failed", done: true, isFail: true },
                  ].map((step, i) => (
                    <div key={i} className="relative pl-4">
                      <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        step.isFail ? "bg-destructive border-destructive" : "bg-accent border-accent"
                      }`}>
                        {step.isFail ? <XCircle className="w-2.5 h-2.5 text-destructive-foreground" /> : <CheckCircle className="w-2.5 h-2.5 text-accent-foreground" />}
                      </div>
                      <p className="text-xs font-medium">{step.event}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedOrder.date}</p>
                    </div>
                  ))}
                </>
              ) : (
                TIMELINE_STEPS.map((event, i) => (
                  <div key={i} className="relative pl-4">
                    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      i <= currentIdx ? "bg-accent border-accent" : "bg-card border-muted-foreground"
                    }`}>
                      {i <= currentIdx && <CheckCircle className="w-2.5 h-2.5 text-accent-foreground" />}
                    </div>
                    <p className="text-xs font-medium">{event}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedOrder.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedOrder.status === "failed" && (
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Contact Support
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Orders List ──
  if (activeSection === "orders") {
    const filtered = statusFilter === "all" ? customerOrders : customerOrders.filter(o => o.status === statusFilter);

    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">My Orders</h2>
        </header>
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-3">
            {(["all", "order_created", "order_processing", "success", "failed"] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={statusFilter === f ? "outline" : "ghost"}
                className="text-xs h-7"
                onClick={() => setStatusFilter(f)}
              >
                {f === "all" ? "All" : STATUS_CONFIG[f].label}
              </Button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No orders found</p>
          )}
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full bg-card border rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{order.cardType}</p>
                    <span className={`status-badge text-[10px] ${cfg.bg} ${cfg.color} shrink-0 ml-2`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{order.denomination} · {order.totalPayout}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{order.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  if (activeSection === "dashboard") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">Data Dashboard</h2>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7">This Week</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7">This Month</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7">All Time</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Trades", value: "24" },
              { label: "Total Value", value: "₦1.2M" },
              { label: "Success Rate", value: "96%" },
              { label: "Avg. Turnaround", value: "12 min" },
            ].map(s => (
              <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
                <p className="text-xl font-heading font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Monthly Volume</h3>
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-accent/20 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-accent rounded-t" style={{ height: `${h * 0.7}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Profile ──
  return (
    <CustomerLayout>
      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-xl">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-lg">{savedName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-md">J4D9KP</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{savedEmail}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowEditProfile(true); setEditName(savedName); setEditEmail(savedEmail); setEditStep("info"); setOtp(""); }}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-4 text-accent-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Wallet Balance</p>
              <p className="text-2xl font-heading font-bold">{balanceVisible ? `₦${walletBalance.toLocaleString()}` : "₦ ••••••"}</p>
            </div>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="opacity-70 hover:opacity-100 transition-opacity">
              {balanceVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30 border-0 text-xs"
              onClick={() => { setActiveSection("wallet"); setTimeout(() => setShowWithdraw(true), 100); }}
            >
              <Send className="w-3 h-3 mr-1" /> Withdraw
            </Button>
            <Button
              size="sm"
              className="bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30 border-0 text-xs"
              onClick={() => { setActiveSection("bank"); }}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Bank
            </Button>
            <Button
              size="sm"
              className="bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30 border-0 text-xs"
              onClick={() => setActiveSection("wallet")}
            >
              Details
            </Button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowEditProfile(false)}>
            <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
              {editStep === "info" ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg">Edit Profile</h3>
                    <button onClick={() => setShowEditProfile(false)} className="text-muted-foreground text-sm">✕</button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Name</label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Email</label>
                    <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="mt-1" />
                    {editEmail !== savedEmail && (
                      <p className="text-[10px] text-warning mt-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Email change requires OTP verification
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditProfile(false)}>Cancel</Button>
                    <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleEditSave}>Save Changes</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <button onClick={() => setEditStep("info")} className="text-sm text-accent flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setShowEditProfile(false)} className="text-muted-foreground text-sm">✕</button>
                  </div>
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-heading font-semibold">Verify Your Email</h3>
                    <p className="text-xs text-muted-foreground">Enter the 4-digit code sent to <span className="font-medium text-foreground">{editEmail}</span></p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <Input
                        key={i}
                        maxLength={1}
                        value={otp[i] || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newOtp = otp.split("");
                          newOtp[i] = val;
                          setOtp(newOtp.join(""));
                          if (val && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus?.();
                        }}
                        className="w-12 h-12 text-center text-lg font-bold"
                      />
                    ))}
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleOtpVerify} disabled={otp.length < 4}>
                    Verify & Update
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">Didn't receive a code? <button className="text-accent font-medium">Resend</button></p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-1">
          {[
            { icon: FileText, label: "My Orders", desc: `${customerOrders.length} orders`, key: "orders" },
            { icon: BarChart3, label: "Data Dashboard", desc: "View your stats", key: "dashboard" },
            { icon: BarChart3, label: "Data Dashboard", desc: "View your stats", key: "dashboard" },
            { icon: Shield, label: "Security Settings", desc: "2FA, password", key: "security" },
            { icon: Settings, label: "App Settings", desc: "Notifications, language", key: "settings" },
            { icon: BookOpen, label: "User Guide", desc: "How to use LightChat", key: "guide" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => item.key === "guide" ? navigate("/customer/guide") : setActiveSection(item.key)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
            <p className="text-xs text-muted-foreground">Switch appearance</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/5 transition-colors text-destructive">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </CustomerLayout>
  );
}
