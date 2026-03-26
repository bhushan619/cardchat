import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { customerWallets, walletTransactions } from "@/data/mock";
import { Wallet, Search, Eye, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export default function AdminWallets() {
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<(typeof customerWallets)[0] | null>(null);

  const totalBalance = customerWallets.reduce((sum, w) => sum + w.balance, 0);
  const filtered = customerWallets.filter(w =>
    w.alias.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Customer Wallets
            </h1>
            <p className="text-sm text-muted-foreground">View all customer wallet balances and transactions</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Platform Balance</p>
            <p className="text-lg font-heading font-bold text-accent">₦{totalBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold">{customerWallets.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Wallets</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">₦{customerWallets.reduce((s, w) => s + w.totalCredits, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Credits</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">₦{customerWallets.reduce((s, w) => s + w.totalWithdrawals, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Withdrawals</p>
          </div>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by alias..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-right">Balance</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Credits</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Withdrawals</TableHead>
                <TableHead className="text-xs font-semibold text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(w => (
                <TableRow key={w.alias} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {w.alias.slice(-2)}
                      </div>
                      <span className="text-sm font-medium">{w.alias}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold">₦{w.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-success">₦{w.totalCredits.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-warning">₦{w.totalWithdrawals.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setSelectedWallet(w)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No wallets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedWallet} onOpenChange={() => setSelectedWallet(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              Wallet — {selectedWallet?.alias}
            </DialogTitle>
            <DialogDescription>Balance: ₦{selectedWallet?.balance.toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-sm font-bold">₦{selectedWallet.balance.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Balance</p>
                </div>
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-success">₦{selectedWallet.totalCredits.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Credits</p>
                </div>
                <div className="bg-warning/10 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-warning">₦{selectedWallet.totalWithdrawals.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Withdrawals</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Transactions</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {walletTransactions.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-success/10" : "bg-warning/10"}`}>
                        {t.type === "credit" ? <ArrowDownLeft className="w-4 h-4 text-success" /> : <ArrowUpRight className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{t.description}</p>
                        <p className="text-[10px] text-muted-foreground">{t.date} · {t.time}</p>
                      </div>
                      <p className={`text-xs font-bold ${t.type === "credit" ? "text-success" : "text-warning"}`}>
                        {t.type === "credit" ? "+" : "-"}₦{t.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
