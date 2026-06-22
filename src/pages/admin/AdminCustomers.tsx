import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations, customerWallets, walletTransactions } from "@/data/mock";
import { Search, Users, Eye, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChannelBadge from "@/components/admin/ChannelBadge";

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
    totalCredits: wallet?.totalCredits ?? 0,
    totalWithdrawals: wallet?.totalWithdrawals ?? 0,
    channel: c.channel,
    whatsappNumber: c.whatsappNumber,
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

  // Get transactions for selected customer (mock: show all wallet transactions)
  const customerTransactions = walletTransactions;

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

        <div className="flex items-center gap-3 mb-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by alias or tag..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Alias</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-center">Channel</TableHead>
                <TableHead className="text-xs font-semibold text-center">Good Rate</TableHead>
                <TableHead className="text-xs font-semibold text-center">Total Orders</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Value</TableHead>
                <TableHead className="text-xs font-semibold text-right">Wallet</TableHead>
                <TableHead className="text-xs font-semibold text-center">Tags</TableHead>
                <TableHead className="text-xs font-semibold text-right">Last Active</TableHead>
                <TableHead className="text-xs font-semibold text-right">Joined</TableHead>
                <TableHead className="text-xs font-semibold text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
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
                    <ChannelBadge channel={c.channel} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{c.goodRate}%</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{c.totalOrders}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{c.totalValue}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <span className="flex items-center justify-end gap-1">
                      <Wallet className="w-3 h-3 text-accent" />
                      ₦{c.walletBalance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      {c.tags.length > 0 ? c.tags.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                      )) : <span className="text-[10px] text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{c.lastActive} ago</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{c.joinedDate}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Customer detail modal with wallet info */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {selectedCustomer?.alias.slice(-2)}
              </div>
              {selectedCustomer?.alias}
            </DialogTitle>
            <DialogDescription>Customer details, wallet & transactions</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="details" className="mt-1">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
                <TabsTrigger value="wallet" className="flex-1 text-xs">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active channel</span>
                  <ChannelBadge channel={selectedCustomer.channel} size="sm" />
                </div>
                {selectedCustomer.whatsappNumber && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">WhatsApp number</span>
                    <a
                      href={`https://wa.me/${selectedCustomer.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {selectedCustomer.whatsappNumber}
                    </a>
                  </div>
                )}
                {[
                  ["Status", selectedCustomer.status],
                  ["Good Rate", `${selectedCustomer.goodRate}%`],
                  ["Total Orders", `${selectedCustomer.totalOrders}`],
                  ["Total Value", selectedCustomer.totalValue],
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
              </TabsContent>

              <TabsContent value="wallet" className="py-2">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-sm font-bold">₦{selectedCustomer.walletBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Balance</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-success">₦{selectedCustomer.totalCredits.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Credits</p>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-warning">₦{selectedCustomer.totalWithdrawals.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Withdrawals</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transactions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerTransactions.map(t => (
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
                  {customerTransactions.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No transactions yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
