import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { customerWallets, walletTransactions } from "@/data/mock";
import { Wallet, Search, Plus, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type WalletOperation = {
  id: string;
  type: "credit" | "withdrawal" | "top_up";
  alias: string;
  amount: number;
  description: string;
  date: string;
  time: string;
  performedBy: string;
};

export default function AdminWallets() {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAlias, setTopUpAlias] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDescription, setTopUpDescription] = useState("");
  const [searchOps, setSearchOps] = useState("");

  // Initialize operations from mock wallet transactions + manual top-ups
  const [operations, setOperations] = useState<WalletOperation[]>(
    walletTransactions.map(t => ({
      id: t.id,
      type: t.type,
      alias: "A7X3KP", // mock: attribute to first customer
      amount: t.amount,
      description: t.description,
      date: t.date,
      time: t.time,
      performedBy: "System",
    }))
  );

  const totalBalance = customerWallets.reduce((sum, w) => sum + w.balance, 0);
  const totalCredits = operations.filter(o => o.type === "credit" || o.type === "top_up").reduce((s, o) => s + o.amount, 0);
  const totalWithdrawals = operations.filter(o => o.type === "withdrawal").reduce((s, o) => s + o.amount, 0);

  const handleTopUp = () => {
    const amount = Number(topUpAmount.replace(/,/g, ""));
    if (!topUpAlias || !amount || amount <= 0) {
      toast.error("Please select a customer and enter a valid amount");
      return;
    }
    const op: WalletOperation = {
      id: `TU-${Date.now().toString(36).toUpperCase()}`,
      type: "top_up",
      alias: topUpAlias,
      amount,
      description: topUpDescription || "Manual top-up by admin",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      performedBy: "Admin One",
    };
    setOperations(prev => [op, ...prev]);
    toast.success(`₦${amount.toLocaleString()} credited to ${topUpAlias}'s wallet`);
    setTopUpAlias("");
    setTopUpAmount("");
    setTopUpDescription("");
    setShowTopUp(false);
  };

  const filteredOps = operations.filter(o =>
    o.alias.toLowerCase().includes(searchOps.toLowerCase()) ||
    o.description.toLowerCase().includes(searchOps.toLowerCase()) ||
    o.id.toLowerCase().includes(searchOps.toLowerCase())
  );

  const typeStyles: Record<string, { label: string; color: string; bg: string }> = {
    credit: { label: "Credit", color: "text-success", bg: "bg-success/10" },
    withdrawal: { label: "Withdrawal", color: "text-warning", bg: "bg-warning/10" },
    top_up: { label: "Top-up", color: "text-accent", bg: "bg-accent/10" },
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Platform Wallet
            </h1>
            <p className="text-sm text-muted-foreground">Manage wallet operations and view all transaction records</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-1.5" onClick={() => setShowTopUp(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Money
            </Button>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Platform Balance</p>
              <p className="text-lg font-heading font-bold text-accent">₦{totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold">{customerWallets.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Wallets</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">₦{totalCredits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Credits</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">₦{totalWithdrawals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Withdrawals</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent">{operations.filter(o => o.type === "top_up").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Manual Top-ups</p>
          </div>
        </div>

        {/* Operations Log */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" /> Wallet Operations Log
          </h2>
          <Badge variant="secondary" className="text-xs">{operations.length} records</Badge>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by alias, description, ID..."
            className="pl-10"
            value={searchOps}
            onChange={e => setSearchOps(e.target.value)}
          />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Customer</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold">Performed By</TableHead>
                <TableHead className="text-xs font-semibold text-right">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOps.map(op => {
                const style = typeStyles[op.type];
                return (
                  <TableRow key={op.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium text-accent">{op.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${style.bg}`}>
                          {op.type === "withdrawal" ? (
                            <ArrowUpRight className={`w-3 h-3 ${style.color}`} />
                          ) : (
                            <ArrowDownLeft className={`w-3 h-3 ${style.color}`} />
                          )}
                        </div>
                        <span className={`text-[10px] font-medium ${style.color}`}>{style.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                          {op.alias.slice(-2)}
                        </div>
                        <span className="text-sm">{op.alias}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{op.description}</TableCell>
                    <TableCell className="text-right text-sm font-bold">
                      <span className={op.type === "withdrawal" ? "text-warning" : "text-success"}>
                        {op.type === "withdrawal" ? "-" : "+"}₦{op.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{op.performedBy}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{op.date} · {op.time}</TableCell>
                  </TableRow>
                );
              })}
              {filteredOps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    No operations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Money Dialog */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" /> Add Money to Wallet
            </DialogTitle>
            <DialogDescription>Credit a customer's platform wallet</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Customer</label>
              <Select value={topUpAlias} onValueChange={setTopUpAlias}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customerWallets.map(w => (
                    <SelectItem key={w.alias} value={w.alias}>
                      {w.alias} — Balance: ₦{w.balance.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Amount (₦)</label>
              <Input
                placeholder="Enter amount..."
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value.replace(/[^0-9,]/g, ""))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Description (optional)</label>
              <Input
                placeholder="e.g. Bonus credit, Refund..."
                value={topUpDescription}
                onChange={e => setTopUpDescription(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleTopUp}>
              Credit Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
