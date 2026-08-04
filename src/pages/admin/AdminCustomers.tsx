import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations, customerWallets, walletTransactions } from "@/data/mock";
import { Search, Users, Eye, Wallet, ArrowDownLeft, ArrowUpRight, Coins, Phone, Landmark, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChannelBadge from "@/components/admin/ChannelBadge";
import { listWaNumbers, pickBusinessNumberFor } from "@/lib/waBusinessNumbers";
import { listBankAccounts, addBankAccount, removeBankAccount, onBankAccountsChange, mockVerifyAccount, NIGERIAN_BANKS, type CustomerBankAccount } from "@/lib/customerBankAccounts";
import { toast } from "sonner";
import { maskName } from "@/lib/utils";
import { isVip, setVip, listVipAliases, onVipChange } from "@/lib/vipCustomers";
import { Crown } from "lucide-react";

const customers = conversations.map((c) => {
  const wallet = customerWallets.find((w) => w.alias === c.alias);
  const inboundLine = c.channel === "whatsapp" ? pickBusinessNumberFor(c.id) : null;
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
    inboundLineId: inboundLine?.id ?? null,
    inboundLineLabel: inboundLine?.label ?? null,
    inboundLinePhone: inboundLine?.phone ?? null,
  };
});

const lineSwatch: Record<string, string> = {
  emerald: "bg-emerald-500", sky: "bg-sky-500", violet: "bg-violet-500",
  amber: "bg-amber-500", rose: "bg-rose-500", cyan: "bg-cyan-500",
};

const statusColors: Record<string, string> = {
  consulting: "bg-amber-500/10 text-amber-600",
  trading: "bg-emerald-500/10 text-emerald-600",
  pending: "bg-blue-500/10 text-blue-600",
};

const statusLabels: Record<string, string> = {
  consulting: "Consulting",
  trading: "Processing",
  pending: "Pending",
};

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null);
  const [vipFilter, setVipFilter] = useState<string>("all");
  const [vipAliases, setVipAliases] = useState<string[]>(() => listVipAliases());
  const [vipConfirm, setVipConfirm] = useState<{ alias: string; next: boolean } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"set" | "cancel" | null>(null);
  const waNumbers = listWaNumbers();

  useEffect(() => onVipChange(() => setVipAliases(listVipAliases())), []);


  const applyVip = () => {
    if (!vipConfirm) return;
    setVip(vipConfirm.alias, vipConfirm.next);
    toast.success(
      vipConfirm.next
        ? `${vipConfirm.alias} is now a VIP customer`
        : `VIP status cancelled for ${vipConfirm.alias}`
    );
    setVipConfirm(null);
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.alias.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      (c.inboundLinePhone?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.inboundLineLabel?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesChannel = channelFilter === "all" || c.channel === channelFilter;
    const matchesLine = lineFilter === "all" || c.inboundLineId === lineFilter;
    const vip = vipAliases.includes(c.alias);
    const matchesVip = vipFilter === "all" || (vipFilter === "vip" ? vip : !vip);
    return matchesSearch && matchesStatus && matchesChannel && matchesLine && matchesVip;
  });

  // Bulk VIP selection — VIP applies to in-app (TRTC) customers only.
  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.includes(c.id));
  const selectableSelected = filtered.filter((c) => selectedIds.includes(c.id) && c.channel === "trtc");

  const applyBulkVip = () => {
    if (!bulkAction) return;
    selectableSelected.forEach((c) => setVip(c.alias, bulkAction === "set"));
    toast.success(
      bulkAction === "set"
        ? `${selectableSelected.length} customer(s) set as VIP`
        : `VIP cancelled for ${selectableSelected.length} customer(s)`
    );
    setBulkAction(null);
    setSelectedIds([]);
  };

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
          <Badge variant="secondary" className="text-xs">
            {customers.length} total
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by alias or tag..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="trading">Processing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="trtc">In-App (TRTC)</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lineFilter} onValueChange={setLineFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="WhatsApp line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All WhatsApp lines</SelectItem>
              {waNumbers.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.label} · {n.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={vipFilter} onValueChange={setVipFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="VIP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              <SelectItem value="vip">VIP only</SelectItem>
              <SelectItem value="normal">Non-VIP only</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg border bg-muted/40">
            <span className="text-xs font-medium">
              {selectedIds.length} selected
              {selectableSelected.length !== selectedIds.length && (
                <span className="text-muted-foreground font-normal"> · {selectableSelected.length} eligible (in-app only)</span>
              )}
            </span>
            <Button
              size="sm"
              className="h-7 px-2 text-[11px] gap-1 bg-amber-500 text-amber-950 hover:bg-amber-500/90"
              onClick={() => setBulkAction("set")}
              disabled={selectableSelected.length === 0}
            >
              <Crown className="w-3 h-3" /> Set VIP
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px] gap-1"
              onClick={() => setBulkAction("cancel")}
              disabled={selectableSelected.length === 0}
            >
              <Crown className="w-3 h-3" /> Cancel VIP
            </Button>
            <button className="text-[11px] text-muted-foreground hover:text-foreground ml-auto" onClick={() => setSelectedIds([])}>
              Clear selection
            </button>
          </div>
        )}


        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => setSelectedIds(v ? filtered.map((c) => c.id) : [])}
                    aria-label="Select all customers"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold">Alias</TableHead>
                <TableHead className="text-xs font-semibold text-center">VIP</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-center">Channel</TableHead>
                <TableHead className="text-xs font-semibold text-center">Good Rate</TableHead>
                <TableHead className="text-xs font-semibold text-center">Total Orders</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total points</TableHead>
                <TableHead className="text-xs font-semibold text-right">Points account</TableHead>
                <TableHead className="text-xs font-semibold text-right">Last Active</TableHead>
                <TableHead className="text-xs font-semibold text-right">Joined</TableHead>
                <TableHead className="text-xs font-semibold text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(c.id)}
                      onCheckedChange={(v) =>
                        setSelectedIds((prev) => (v ? [...prev, c.id] : prev.filter((id) => id !== c.id)))
                      }
                      aria-label={`Select ${c.alias}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.alias.slice(-2)}
                      </div>
                      <span className="text-sm font-medium">{c.alias}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {c.channel === "trtc" ? (
                      vipAliases.includes(c.alias) ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-amber-950">
                          <Crown className="w-2.5 h-2.5" /> VIP
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Normal</span>
                      )
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status] || "bg-muted text-muted-foreground"}`}
                    >
                      {statusLabels[c.status] || c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <ChannelBadge channel={c.channel} size="sm" />
                      {c.channel === "whatsapp" && c.inboundLineLabel && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                          title={`Received on ${c.inboundLineLabel} · ${c.inboundLinePhone}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${lineSwatch[waNumbers.find((n) => n.id === c.inboundLineId)?.color || "emerald"]}`} />
                          <span className="font-medium">{c.inboundLineLabel}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{c.goodRate}%</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{c.totalOrders}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <span className="inline-flex items-center justify-end gap-0.5"><Coins className="w-3 h-3 text-accent" />{(parseInt(String(c.totalValue).replace(/[^\d]/g, ""), 10) || 0).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <span className="flex items-center justify-end gap-1">
                      <Coins className="w-3 h-3 text-accent" />{c.walletBalance.toLocaleString()}
                    </span>
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
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground text-sm">
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
                <TabsTrigger value="details" className="flex-1 text-xs">
                  Details
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex-1 text-xs">
                  Points account
                </TabsTrigger>
                <TabsTrigger value="banks" className="flex-1 text-xs">
                  Bank Accounts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">VIP status</span>
                  <div className="flex items-center gap-2">
                    {vipAliases.includes(selectedCustomer.alias) ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Standard</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] gap-1 border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                      onClick={() =>
                        setVipConfirm({
                          alias: selectedCustomer.alias,
                          next: !vipAliases.includes(selectedCustomer.alias),
                        })
                      }
                    >
                      <Crown className="w-3 h-3" />
                      {vipAliases.includes(selectedCustomer.alias) ? "Cancel VIP" : "Set VIP"}
                    </Button>
                  </div>
                </div>
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
                {selectedCustomer.channel === "whatsapp" && selectedCustomer.inboundLineLabel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Business line</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${lineSwatch[waNumbers.find((n) => n.id === selectedCustomer.inboundLineId)?.color || "emerald"]}`} />
                      {selectedCustomer.inboundLineLabel}
                      <span className="text-muted-foreground font-mono text-xs">{selectedCustomer.inboundLinePhone}</span>
                    </span>
                  </div>
                )}
                {[
                  ["Status", statusLabels[selectedCustomer.status] || selectedCustomer.status],
                  ["Good Rate", `${selectedCustomer.goodRate}%`],
                  ["Total Orders", `${selectedCustomer.totalOrders}`],
                  ["Total points", String(selectedCustomer.totalValue).replace(/₦/g, "")],
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
                    <p className="text-sm font-bold inline-flex items-center gap-0.5 justify-center"><Coins className="w-3 h-3" />{selectedCustomer.walletBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Balance</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-success inline-flex items-center gap-0.5 justify-center"><Coins className="w-3 h-3" />{selectedCustomer.totalCredits.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Credits</p>
                  </div>
                  <div className="bg-warning/10 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-warning inline-flex items-center gap-0.5 justify-center">
                      <Coins className="w-3 h-3" />{selectedCustomer.totalWithdrawals.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{selectedCustomer.channel === "whatsapp" ? "Transfers" : "Withdrawals"}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Transactions
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerTransactions.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-success/10" : "bg-warning/10"}`}
                      >
                        {t.type === "credit" ? (
                          <ArrowDownLeft className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-warning" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {selectedCustomer.channel === "whatsapp" ? t.description.replace(/Withdrawal/gi, "Transfer") : t.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t.date} · {t.time}
                        </p>
                      </div>
                      <p className={`text-xs font-bold inline-flex items-center gap-0.5 ${t.type === "credit" ? "text-success" : "text-warning"}`}>
                        {t.type === "credit" ? "+" : "-"}<Coins className="w-3 h-3" />{t.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {customerTransactions.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No transactions yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="banks" className="py-2">
                <BankAccountsTab alias={selectedCustomer.alias} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      {/* VIP confirmation */}
      <Dialog open={!!vipConfirm} onOpenChange={(o) => !o && setVipConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              {vipConfirm?.next ? "Set as VIP" : "Cancel VIP status"}
            </DialogTitle>
            <DialogDescription>
              {vipConfirm?.next
                ? `${vipConfirm?.alias} will receive VIP pricing (VIP price control) on all new orders.`
                : `${vipConfirm?.alias} will go back to standard pricing on all new orders.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVipConfirm(null)}>Cancel</Button>
            <Button
              className="gap-1.5 bg-amber-500 text-white hover:bg-amber-500/90"
              onClick={applyVip}
            >
              <Crown className="w-3.5 h-3.5" /> Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}

function BankAccountsTab({ alias }: { alias: string }) {
  const [accounts, setAccounts] = useState<CustomerBankAccount[]>(() => listBankAccounts(alias));
  const [adding, setAdding] = useState(false);
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [confirmDel, setConfirmDel] = useState<CustomerBankAccount | null>(null);

  useEffect(() => onBankAccountsChange(() => setAccounts(listBankAccounts(alias))), [alias]);
  useEffect(() => { setAccounts(listBankAccounts(alias)); }, [alias]);

  const reset = () => { setAccountNumber(""); setHolderName(""); setVerified(false); setBankName(NIGERIAN_BANKS[0]); };

  const doVerify = async () => {
    if (accountNumber.length !== 10) { toast.error("Account number must be 10 digits"); return; }
    setVerifying(true);
    try {
      const name = await mockVerifyAccount(accountNumber, bankName);
      setHolderName(name);
      setVerified(true);
      toast.success("Account verified");
    } finally { setVerifying(false); }
  };

  const doSave = () => {
    if (!verified) { toast.error("Please verify the account first"); return; }
    addBankAccount(alias, { bankName, accountNumber, holderName });
    toast.success("Bank account added");
    setAdding(false); reset();
  };

  const doDelete = () => {
    if (!confirmDel) return;
    removeBankAccount(alias, confirmDel.id);
    toast.success("Bank account removed");
    setConfirmDel(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Saved beneficiaries · {accounts.length}
        </p>
        <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setAdding(true)}>
          <Plus className="w-3 h-3" /> Add Account
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-[10px] h-8">Bank</TableHead>
              <TableHead className="text-[10px] h-8">Account No.</TableHead>
              <TableHead className="text-[10px] h-8">Holder</TableHead>
              <TableHead className="text-[10px] h-8">Added</TableHead>
              <TableHead className="text-[10px] h-8 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-xs font-medium">{a.bankName}</TableCell>
                <TableCell className="text-xs font-mono">{a.accountNumber}</TableCell>
                <TableCell className="text-xs font-mono" title="Name masked for privacy">{maskName(a.holderName)}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground">{new Date(a.addedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <button onClick={() => setConfirmDel(a)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">No bank accounts saved</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add dialog */}
      <Dialog open={adding} onOpenChange={(o) => { if (!o) { setAdding(false); reset(); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Landmark className="w-4 h-4" /> Add Bank Account</DialogTitle>
            <DialogDescription>Verify the account before saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bank</label>
              <Select value={bankName} onValueChange={(v) => { setBankName(v); setVerified(false); setHolderName(""); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{NIGERIAN_BANKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Account Number</label>
              <div className="flex gap-2 mt-1">
                <Input value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10)); setVerified(false); setHolderName(""); }} placeholder="10 digits" maxLength={10} className="font-mono" />
                <Button size="sm" variant="outline" onClick={doVerify} disabled={verifying || accountNumber.length !== 10}>
                  {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : verified ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : "Verify"}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Account Holder Name</label>
              <Input value={maskName(holderName)} disabled placeholder="Auto-filled after verification" className="mt-1 bg-muted/40" />
              <p className="text-[10px] text-muted-foreground mt-1">Name is masked for privacy after verification.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAdding(false); reset(); }}>Cancel</Button>
            <Button onClick={doSave} disabled={!verified} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove bank account?</DialogTitle>
            <DialogDescription>
              Remove <b>{maskName(confirmDel?.holderName)}</b>'s <b>{confirmDel?.bankName}</b> account ending in <b>{confirmDel?.accountNumber.slice(-4)}</b>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
