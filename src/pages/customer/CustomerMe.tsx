import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { bankAccounts, transactions } from "@/data/mock";
import { User, CreditCard, FileText, BarChart3, ChevronRight, Plus, Shield, Settings, LogOut, Trash2, CheckCircle, ArrowLeft, Copy, BookOpen, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerMe() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<typeof transactions[0] | null>(null);

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

  if (activeSection === "transactions" && selectedTxn) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setSelectedTxn(null)} className="text-sm text-accent flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="font-heading font-semibold">Transaction Details</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className={`rounded-xl p-4 text-center space-y-1 ${selectedTxn.status === "success" ? "bg-accent/5 border border-accent/20" : "bg-destructive/5 border border-destructive/20"}`}>
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${selectedTxn.status === "success" ? "bg-accent/10" : "bg-destructive/10"}`}>
              <CheckCircle className={`w-6 h-6 ${selectedTxn.status === "success" ? "text-accent" : "text-destructive"}`} />
            </div>
            <p className="text-lg font-heading font-bold">{selectedTxn.amount}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedTxn.status === "success" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
              {selectedTxn.status === "success" ? "Successful" : "Failed"}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction Info</p>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              {[
                { label: "Transaction ID", value: selectedTxn.id },
                { label: "Order ID", value: selectedTxn.orderId },
                { label: "Date", value: selectedTxn.date },
                { label: "Amount", value: selectedTxn.amount },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium">{item.value}</p>
                    {(item.label === "Transaction ID" || item.label === "Order ID") && (
                      <Copy className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Details</p>
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              {[
                { label: "Bank Account", value: selectedTxn.bank },
                { label: "Transfer Type", value: "Bank Transfer" },
                { label: "Processing Time", value: selectedTxn.status === "success" ? "Instant" : "N/A" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xs font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
            <div className="space-y-3 pl-3 border-l-2 border-accent/20">
              {[
                { time: selectedTxn.date, event: "Order placed", done: true },
                { time: selectedTxn.date, event: "Payment initiated", done: true },
                { time: selectedTxn.date, event: selectedTxn.status === "success" ? "Payment completed" : "Payment failed", done: true },
              ].map((step, i) => (
                <div key={i} className="relative pl-4">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? (i === 2 && selectedTxn.status === "failed" ? "bg-destructive border-destructive" : "bg-accent border-accent")
                      : "bg-card border-muted-foreground"
                  }`}>
                    {step.done && <CheckCircle className="w-2.5 h-2.5 text-accent-foreground" />}
                  </div>
                  <p className="text-xs font-medium">{step.event}</p>
                  <p className="text-[10px] text-muted-foreground">{step.time}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedTxn.status === "failed" && (
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Retry Transaction
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "transactions") {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
          <button onClick={() => setActiveSection(null)} className="text-sm text-accent">← Back</button>
          <h2 className="font-heading font-semibold">Transaction Records</h2>
        </header>
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-3">
            <Button size="sm" variant="outline" className="text-xs h-7">All</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7">Success</Button>
            <Button size="sm" variant="ghost" className="text-xs h-7">Failed</Button>
          </div>
          {transactions.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTxn(t)}
              className="w-full bg-card border rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className={`w-2 h-2 rounded-full ${t.status === "success" ? "bg-success" : "bg-destructive"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{t.amount}</p>
                <p className="text-xs text-muted-foreground">{t.bank} · {t.date}</p>
              </div>
              <span className={`status-badge text-[10px] ${t.status === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {t.status}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

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
            { icon: FileText, label: "Transaction Records", desc: `${transactions.length} transactions`, key: "transactions" },
            { icon: BarChart3, label: "Data Dashboard", desc: "View your stats", key: "dashboard" },
            { icon: Shield, label: "Security Settings", desc: "2FA, password", key: "security" },
            { icon: Settings, label: "App Settings", desc: "Notifications, language", key: "settings" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
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
