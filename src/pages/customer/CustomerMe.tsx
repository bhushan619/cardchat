import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { bankAccounts, transactions } from "@/data/mock";
import { User, CreditCard, FileText, BarChart3, ChevronRight, Plus, Shield, Settings, LogOut, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomerMe() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);

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
            <div key={t.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${t.status === "success" ? "bg-success" : "bg-destructive"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{t.amount}</p>
                <p className="text-xs text-muted-foreground">{t.bank} · {t.date}</p>
              </div>
              <span className={`status-badge text-[10px] ${t.status === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {t.status}
              </span>
            </div>
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
            <p className="text-sm text-muted-foreground">+234 *** *** 4567</p>
            <p className="text-xs text-muted-foreground">johndoe@email.com</p>
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
