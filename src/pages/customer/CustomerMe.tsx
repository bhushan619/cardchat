import { useState, useEffect } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { bankAccounts, walletBalance, tradingBalance, rewardsBalance, walletTransactions } from "@/data/mock";
import { User, CreditCard, FileText, BarChart3, ChevronRight, Plus, Shield, Settings, LogOut, Trash2, CheckCircle, ArrowLeft, Copy, BookOpen, Sun, Moon, Clock, XCircle, Loader2, Image as ImageIcon, Mail, Pencil, ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, Send, Eye, EyeOff, Lock, Smartphone, Bell, Globe, Palette, KeyRound } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const PIN_STORAGE_KEY = "cc_customer_txn_pin";

type CustomerVisibleStatus = "order_created" | "order_processing" | "success" | "failed";

interface CustomerOrder {
  id: string;
  cardType: string;
  totalFaceValue: string;
  rate: string;
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
  { id: "ORD-20260318-001", cardType: "iTunes US", totalFaceValue: "$200", rate: "₦680", totalPayout: "₦215,200", status: "success", date: "Mar 18, 2026", bank: "First Bank ****1234" },
  { id: "ORD-20260317-005", cardType: "Amazon US", totalFaceValue: "$150", rate: "₦620", totalPayout: "₦93,000", status: "success", date: "Mar 17, 2026", bank: "GTBank ****5678" },
  { id: "ORD-20260316-003", cardType: "Steam US", totalFaceValue: "$200", rate: "₦600", totalPayout: "₦120,000", status: "failed", date: "Mar 16, 2026", bank: "Access Bank ****9012" },
  { id: "ORD-20260315-008", cardType: "iTunes UK", totalFaceValue: "$100", rate: "₦850", totalPayout: "₦85,000", status: "order_processing", date: "Mar 15, 2026", bank: "First Bank ****1234" },
];

function NotificationToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2 border-t">
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-accent" : "bg-muted-foreground/30"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${on ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function CustomerMe() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerVisibleStatus>("all");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editStep, setEditStep] = useState<"info" | "otp">("info");
  const [editName, setEditName] = useState("John Doe");
  const [editEmail, setEditEmail] = useState("johndoe@gmail.com");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [otp, setOtp] = useState("");
  const [savedName, setSavedName] = useState("John Doe");
  const [savedEmail, setSavedEmail] = useState("johndoe@gmail.com");
  const [savedWhatsapp, setSavedWhatsapp] = useState("");
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
  const [pendingWithdrawals, setPendingWithdrawals] = useState<{ id: string; amount: number; bank: string; date: string; time: string }[]>([]);

  // Transaction PIN state
  const [txnPin, setTxnPin] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(PIN_STORAGE_KEY) : null
  );
  const [pinCurrent, setPinCurrent] = useState("");
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinShow, setPinShow] = useState(false);

  // Withdraw PIN dialog
  const [withdrawPinOpen, setWithdrawPinOpen] = useState(false);
  const [withdrawPinInput, setWithdrawPinInput] = useState("");
  const [withdrawPinError, setWithdrawPinError] = useState("");

  const resetPinForm = () => { setPinCurrent(""); setPinNew(""); setPinConfirm(""); };

  const handleSavePin = () => {
    if (txnPin && pinCurrent !== txnPin) { toast.error("Current PIN is incorrect"); return; }
    if (!/^\d{6}$/.test(pinNew)) { toast.error("PIN must be exactly 6 digits"); return; }
    if (pinNew !== pinConfirm) { toast.error("PINs do not match"); return; }
    sessionStorage.setItem(PIN_STORAGE_KEY, pinNew);
    setTxnPin(pinNew);
    resetPinForm();
    toast.success(txnPin ? "Transaction PIN updated" : "Transaction PIN created");
  };

  const handleConfirmWithdrawClick = () => {
    if (!txnPin) {
      toast.error("Please set your Transaction PIN in Security Settings first");
      return;
    }
    setWithdrawPinInput("");
    setWithdrawPinError("");
    setWithdrawPinOpen(true);
  };

  const handleVerifyWithdrawPin = () => {
    if (withdrawPinInput !== txnPin) { setWithdrawPinError("Incorrect PIN"); return; }
    setWithdrawPinOpen(false);
    handleWithdraw();
  };

  const handleEditSave = () => {
    if (editEmail !== savedEmail) {
      setEditStep("otp");
    } else {
      setSavedName(editName);
      setSavedWhatsapp(editWhatsapp);
      setShowEditProfile(false);
    }
  };

  const handleOtpVerify = () => {
    if (otp.length === 4) {
      setSavedName(editName);
      setSavedEmail(editEmail);
      setSavedWhatsapp(editWhatsapp);
      setShowEditProfile(false);
      setEditStep("info");
      setOtp("");
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && withdrawBank) {
      const bank = bankAccounts.find(a => String(a.id) === withdrawBank);
      const now = new Date();
      setPendingWithdrawals(prev => [
        ...prev,
        {
          id: `PW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          amount: Number(withdrawAmount),
          bank: bank ? `${bank.bankName} ${bank.accountNumber}` : withdrawBank,
          date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);
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
    const availableBalance = walletBalance - pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

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
              <p className="text-3xl font-heading font-bold mt-1">{balanceVisible ? `₦${availableBalance.toLocaleString()}` : "₦ ••••••"}</p>
              {balanceVisible && (
                <p className="text-xs opacity-80 mt-1">
                  ({tradingBalance.toLocaleString()} Trading + {rewardsBalance.toLocaleString()} Rewards)
                </p>
              )}
            </div>

            {/* Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pending Withdrawals</p>
                {pendingWithdrawals.map(pw => (
                  <div key={pw.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-warning/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">₦{pw.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{pw.bank}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{pw.date} · {pw.time}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-5 text-accent-foreground">
              <div className="flex items-center justify-between">
                <p className="text-xs opacity-80">Available Balance</p>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="opacity-70 hover:opacity-100 transition-opacity">
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-3xl font-heading font-bold mt-1">{balanceVisible ? `₦${availableBalance.toLocaleString()}` : "₦ ••••••"}</p>
              {balanceVisible && (
                <p className="text-xs opacity-80 mt-1">
                  ({tradingBalance.toLocaleString()} Trading + {rewardsBalance.toLocaleString()} Rewards)
                </p>
              )}
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
                        placeholder="Min ₦2,000 — Max ₦790,000"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="mt-1"
                      />
                      {withdrawAmount && (Number(withdrawAmount) < 2000 || Number(withdrawAmount) > 790000) && (
                        <p className="text-[10px] text-destructive mt-1">
                          Amount must be between ₦2,000 and ₦790,000
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">Available: ₦{availableBalance.toLocaleString()}</p>
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
                        disabled={!withdrawAmount || !withdrawBank || Number(withdrawAmount) > availableBalance || Number(withdrawAmount) < 2000 || Number(withdrawAmount) > 790000}
                        onClick={handleConfirmWithdrawClick}
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

        <Dialog open={withdrawPinOpen} onOpenChange={setWithdrawPinOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-accent" />
                Enter Transaction PIN
              </DialogTitle>
              <DialogDescription>
                Confirm your 6-digit Transaction PIN to authorize this withdrawal of ₦{withdrawAmount ? Number(withdrawAmount).toLocaleString() : "0"}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-2">
              <InputOTP
                maxLength={6}
                value={withdrawPinInput}
                onChange={(v) => { setWithdrawPinInput(v.replace(/\D/g, "")); setWithdrawPinError(""); }}
              >
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
              {withdrawPinError && (
                <p className="text-xs text-destructive">{withdrawPinError}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setWithdrawPinOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={withdrawPinInput.length !== 6}
                onClick={handleVerifyWithdrawPin}
              >
                Verify & Withdraw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                { label: "Amount", value: selectedOrder.totalFaceValue },
                { label: "Card Rate", value: selectedOrder.rate },
                { label: "Payout", value: selectedOrder.totalPayout },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Credit Status */}
          {selectedOrder.status === "success" && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-success" />
              <p className="text-xs text-success font-medium">Credited to wallet</p>
            </div>
          )}

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
                  <p className="text-xs text-muted-foreground">{order.totalFaceValue} · {order.totalPayout}</p>
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

  // ── Security Settings ──
  if (activeSection === "security") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">Security Settings</h2>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Transaction PIN */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {txnPin ? "Change Transaction PIN" : "Create Transaction PIN"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {txnPin
                    ? "Update your 6-digit PIN used to confirm withdrawals"
                    : "Set a 6-digit PIN to confirm withdrawals and sensitive actions"}
                </p>
              </div>
              {txnPin && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">Set</span>
              )}
            </div>
            <div className="space-y-2">
              {txnPin && (
                <div>
                  <label className="text-xs text-muted-foreground">Current PIN</label>
                  <Input
                    type={pinShow ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter current 6-digit PIN"
                    value={pinCurrent}
                    onChange={e => setPinCurrent(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1 tracking-widest"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">New PIN</label>
                <Input
                  type={pinShow ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter new 6-digit PIN"
                  value={pinNew}
                  onChange={e => setPinNew(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 tracking-widest"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Confirm New PIN</label>
                <Input
                  type={pinShow ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Re-enter new 6-digit PIN"
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1 tracking-widest"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPinShow(!pinShow)}
                  className="text-[11px] text-muted-foreground flex items-center gap-1 hover:text-foreground"
                >
                  {pinShow ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {pinShow ? "Hide" : "Show"} PIN
                </button>
              </div>
              <Button
                size="sm"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSavePin}
              >
                {txnPin ? "Update Transaction PIN" : "Create Transaction PIN"}
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">Off</span>
            </div>
            <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
              Enable 2FA
            </Button>
          </div>

          {/* Login Activity */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">Login Activity</p>
                <p className="text-xs text-muted-foreground">Recent sessions</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { device: "Chrome · Windows", location: "Lagos, NG", time: "Active now", active: true },
                { device: "Safari · iPhone", location: "Lagos, NG", time: "2 hours ago", active: false },
                { device: "Chrome · MacOS", location: "Abuja, NG", time: "3 days ago", active: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-t first:border-0">
                  <div>
                    <p className="text-xs font-medium">{session.device}</p>
                    <p className="text-[10px] text-muted-foreground">{session.location} · {session.time}</p>
                  </div>
                  {session.active ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">Active</span>
                  ) : (
                    <button className="text-[10px] text-destructive font-medium">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── App Settings ──
  if (activeSection === "settings") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">App Settings</h2>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Notifications */}
          <div className="bg-card border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">Manage your alerts</p>
              </div>
            </div>
            {[
              { label: "Order Updates", desc: "Get notified on order status changes", defaultOn: true },
              { label: "Promotions", desc: "Receive promotional offers and deals", defaultOn: false },
              { label: "Security Alerts", desc: "Login attempts and password changes", defaultOn: true },
            ].map((item, i) => (
              <NotificationToggle key={i} label={item.label} desc={item.desc} defaultOn={item.defaultOn} />
            ))}
          </div>

          {/* Language */}
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Language</p>
                <p className="text-xs text-muted-foreground">Choose your preferred language</p>
              </div>
            </div>
            <Select defaultValue="en">
              <SelectTrigger className="mt-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="yo">Yorùbá</SelectItem>
                <SelectItem value="ha">Hausa</SelectItem>
                <SelectItem value="ig">Igbo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appearance */}
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Appearance</p>
                <p className="text-xs text-muted-foreground">Current: {theme === "dark" ? "Dark" : "Light"} mode</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 mr-1.5" /> : <Moon className="w-3.5 h-3.5 mr-1.5" />}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About</p>
            {[
              ["App Version", "v1.0.0"],
              ["Build", "2026.03.30"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{k}</p>
                <p className="text-xs font-medium">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              {savedWhatsapp && (
                <div className="flex items-center gap-1 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-emerald-500" aria-hidden="true">
                    <path d="M20.52 3.48A11.78 11.78 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.65 1.44h.01c6.55 0 11.84-5.3 11.84-11.84a11.77 11.77 0 0 0-3.38-8.44Z" />
                  </svg>
                  <p className="text-xs text-muted-foreground">{savedWhatsapp}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => { setShowEditProfile(true); setEditName(savedName); setEditEmail(savedEmail); setEditWhatsapp(savedWhatsapp); setEditStep("info"); setOtp(""); }}
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
              {balanceVisible && (
                <p className="text-[11px] opacity-80 mt-0.5">
                  ({tradingBalance.toLocaleString()} Trading + {rewardsBalance.toLocaleString()} Rewards)
                </p>
              )}
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
              onClick={() => setActiveSection("wallet")}
            >
              My Wallet
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
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">WhatsApp number</label>
                    <Input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={editWhatsapp}
                      onChange={e => setEditWhatsapp(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Optional — lets agents reach you on WhatsApp in addition to in-app chat.
                    </p>
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
            { icon: CreditCard, label: "Bank Accounts", desc: "Manage your banks", key: "bank" },
            { icon: BarChart3, label: "Data Dashboard", desc: "View your stats", key: "dashboard" },
            { icon: Shield, label: "Security Settings", desc: "2FA, transaction PIN", key: "security" },
            { icon: Settings, label: "App Settings", desc: "Notifications, language", key: "settings" },
            { icon: BookOpen, label: "User Guide", desc: "How to use CardChat", key: "guide" },
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
