import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { bankAccounts } from "@/data/mock";
import { User, CreditCard, FileText, BarChart3, ChevronRight, Plus, Shield, Settings, LogOut, Trash2, CheckCircle, ArrowLeft, Copy, BookOpen, Sun, Moon, Clock, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── Bank Accounts ──
  if (activeSection === "bank") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => { setActiveSection(null); setShowAddBank(false); }} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">Verified Bank Accounts</h2>
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
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Transfer</p>
            <div className="bg-muted/50 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  selectedOrder.status === "success" ? "bg-success/10" : "bg-muted"
                }`}>
                  {selectedOrder.status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : selectedOrder.status === "failed" ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">
                    {selectedOrder.status === "success" ? "Transfer Completed" : selectedOrder.status === "failed" ? "Transfer Failed" : "Transfer Pending"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{selectedOrder.date}</p>
                </div>
              </div>
              {[
                { label: "Bank", value: selectedOrder.bank },
                { label: "Amount", value: selectedOrder.totalPayout },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-medium">{item.value}</p>
                </div>
              ))}
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
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-xl">JD</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">John Doe</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-md">J4D9KP</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">+234 *** *** 4567</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {[
            { icon: CreditCard, label: "Verified Bank Accounts", desc: `${bankAccounts.length} accounts`, key: "bank" },
            { icon: FileText, label: "My Orders", desc: `${customerOrders.length} orders`, key: "orders" },
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
