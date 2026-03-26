import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations, customerWallets } from "@/data/mock";
import { Search, Users, Eye, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const customers = conversations.map(c => {
  const wallet = customerWallets.find(w => w.alias === c.alias);
  return {
    id: c.id,
    alias: c.alias,
    status: c.status,
    goodRate: c.goodRate,
    totalValue: c.totalValue,
    tags: c.tags,
    lastMessage: c.lastMessage,
    lastActive: c.time,
    totalOrders: Math.floor(Math.random() * 20) + 1,
    joinedDate: "Mar 2026",
    walletBalance: wallet?.balance ?? 0,
  };
});

const statusColors: Record<string, string> = {
  consulting: "bg-amber-500/10 text-amber-600",
  trading: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-blue-500/10 text-blue-600",
};

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null);

  const filtered = customers.filter(c =>
    c.alias.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Customers
            </h1>
            <p className="text-sm text-muted-foreground">View and search all customers</p>
          </div>
          <Badge variant="secondary" className="text-xs">{customers.length} total</Badge>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by alias or tag..."
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
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-center">Good Rate</TableHead>
                <TableHead className="text-xs font-semibold text-center">Total Orders</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Value</TableHead>
                <TableHead className="text-xs font-semibold text-right">Balance</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Credits</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Withdrawals</TableHead>
                <TableHead className="text-xs font-semibold text-center">Tags</TableHead>
                <TableHead className="text-xs font-semibold text-right">Last Active</TableHead>
                <TableHead className="text-xs font-semibold text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => {
                const wallet = customerWallets.find(w => w.alias === c.alias);
                return (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.alias.slice(-2)}
                      </div>
                      <span className="text-sm font-medium">{c.alias}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[c.status] || "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{c.goodRate}%</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{c.totalOrders}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{c.totalValue}</TableCell>
                  <TableCell className="text-right text-sm font-bold">₦{(wallet?.balance ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-success">₦{(wallet?.totalCredits ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-warning">₦{(wallet?.totalWithdrawals ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {c.tags.length > 0 ? c.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                      )) : <span className="text-[10px] text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{c.lastActive} ago</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )})}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground text-sm">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Customer detail modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {selectedCustomer?.alias.slice(-2)}
              </div>
              {selectedCustomer?.alias}
            </DialogTitle>
            <DialogDescription>Customer details and activity summary</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-3 py-2">
              {[
                ["Status", selectedCustomer.status],
                ["Good Rate", `${selectedCustomer.goodRate}%`],
                ["Total Orders", `${selectedCustomer.totalOrders}`],
                ["Total Value", selectedCustomer.totalValue],
                ["Wallet Balance", `₦${selectedCustomer.walletBalance.toLocaleString()}`],
                ["Last Active", `${selectedCustomer.lastActive} ago`],
                ["Joined", selectedCustomer.joinedDate],
                ["Tags", selectedCustomer.tags.join(", ") || "None"],
                ["Last Message", selectedCustomer.lastMessage],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
