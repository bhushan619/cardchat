import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Download, Search, X, Building2, RefreshCw, Coins } from "lucide-react";
import PointsAmount from "@/components/admin/PointsAmount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { parse } from "date-fns";

type PlatformRecord = {
  id: string;
  transferId: string;
  orderId: string;
  customer: string;
  type: "deposit" | "disbursement";
  amount: number;
  nairaRate: number;
  description: string;
  date: string;
  time: string;
  remark: string;
};

const initialRecords: PlatformRecord[] = [
  { id: "PW-001", transferId: "TRF-001", orderId: "—", customer: "—", type: "deposit", amount: 2000000, nairaRate: 289, description: "Operational funding", date: "Mar 18, 2026", time: "08:00 AM", remark: "Weekly ops funding" },
  { id: "PW-002", transferId: "TRF-002", orderId: "ORD-20260318-001", customer: "A7X3KP", type: "disbursement", amount: 215200, nairaRate: 289, description: "Auto-credit — iTunes US trade", date: "Mar 18, 2026", time: "10:42 AM", remark: "iTunes US trade" },
  { id: "PW-003", transferId: "TRF-003", orderId: "ORD-20260317-005", customer: "K9M2BL", type: "disbursement", amount: 93000, nairaRate: 270, description: "Auto-credit — Amazon US trade", date: "Mar 17, 2026", time: "03:20 PM", remark: "Amazon US trade" },
  { id: "PW-004", transferId: "TRF-004", orderId: "—", customer: "—", type: "deposit", amount: 1500000, nairaRate: 270, description: "Weekly top-up", date: "Mar 15, 2026", time: "09:00 AM", remark: "Scheduled top-up" },
  { id: "PW-005", transferId: "TRF-005", orderId: "ORD-20260315-008", customer: "B5N1QW", type: "disbursement", amount: 62000, nairaRate: 255, description: "Auto-credit — iTunes UK trade", date: "Mar 15, 2026", time: "02:10 PM", remark: "iTunes UK trade" },
  { id: "PW-006", transferId: "TRF-006", orderId: "ORD-20260316-003", customer: "R4P8TN", type: "disbursement", amount: 186000, nairaRate: 255, description: "Auto-credit — Steam US trade", date: "Mar 16, 2026", time: "09:30 AM", remark: "Steam US trade" },
];

function parseRecordDate(r: PlatformRecord): Date {
  try {
    return parse(`${r.date} ${r.time}`, "MMM dd, yyyy hh:mm aa", new Date());
  } catch {
    return new Date(0);
  }
}

const uniqueCustomers = [...new Set(initialRecords.map(r => r.customer).filter(c => c !== "—"))];

export default function AdminWallets() {
  const [records, setRecords] = useState<PlatformRecord[]>(initialRecords);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");
  const [depositRemark, setDepositRemark] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "disbursement">("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const totalDeposits = records.filter(r => r.type === "deposit").reduce((s, r) => s + r.amount, 0);
  const totalDisbursements = records.filter(r => r.type === "disbursement").reduce((s, r) => s + r.amount, 0);
  const platformBalance = totalDeposits - totalDisbursements;

  const filtered = records.filter(r => {
    const matchSearch = !search ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.transferId.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.remark.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    const matchCustomer = customerFilter === "all" || r.customer === customerFilter;
    let matchDate = true;
    if (dateFrom || dateTo) {
      const rd = parseRecordDate(r);
      if (dateFrom && rd < dateFrom) matchDate = false;
      if (dateTo && rd > dateTo) matchDate = false;
    }
    return matchSearch && matchType && matchCustomer && matchDate;
  });

  const handleDeposit = () => {
    const amount = Number(depositAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const record: PlatformRecord = {
      id: `PW-${Date.now().toString(36).toUpperCase()}`,
      transferId: `TRF-${Date.now().toString(36).toUpperCase()}`,
      orderId: "—",
      customer: "—",
      type: "deposit",
      amount,
      nairaRate: 289,
      description: depositDescription || "Admin deposit",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      remark: depositRemark || "Manual deposit",
    };
    setRecords(prev => [record, ...prev]);
    toast.success(`${amount.toLocaleString()} points added to platform wallet`);
    setDepositAmount("");
    setDepositDescription("");
    setDepositRemark("");
    setShowDeposit(false);
  };

  const handleExport = () => {
    const header = ["Transfer ID", "Order ID", "Customer", "Type", "Description", "Naira Rate", "Amount (₦)", "Date", "Time", "Remark"];
    const rows = filtered.map(r => [
      r.transferId,
      r.orderId,
      r.customer,
      r.type,
      `"${r.description}"`,
      r.nairaRate.toString(),
      r.amount.toString(),
      r.date,
      r.time,
      `"${r.remark}"`,
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-wallet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} records`);
  };

  const hasDateFilter = !!dateFrom || !!dateTo;
  const hasActiveFilters = search || typeFilter !== "all" || customerFilter !== "all" || hasDateFilter;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Platform Wallet
            </h1>
            <p className="text-sm text-muted-foreground">
              Funds used to auto-credit customer wallets on successful orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowDeposit(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Money
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent">₦{platformBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Platform Balance</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">₦{totalDeposits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Deposits</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">₦{totalDisbursements.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Disbursements</p>
          </div>
          {[
            { name: "PalmPay 1", account: "****8821", balance: 4820500, lastSync: "2 min ago" },
            { name: "PalmPay 2", account: "****4477", balance: 1265300, lastSync: "5 min ago" },
          ].map((p) => (
            <div key={p.name} className="bg-card border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.account}</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success(`${p.name} balance refreshed`)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  title="Refresh balance"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xl font-heading font-bold text-accent">₦{p.balance.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Connected · {p.lastSync}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="relative max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="disbursement">Disbursements</SelectItem>
            </SelectContent>
          </Select>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {uniqueCustomers.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">From</label>
              <DateTimePicker value={dateFrom} onChange={setDateFrom} />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">To</label>
              <DateTimePicker value={dateTo} onChange={setDateTo} />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-9 px-2 text-xs text-muted-foreground" onClick={() => { setSearch(""); setTypeFilter("all"); setCustomerFilter("all"); setDateFrom(undefined); setDateTo(undefined); }}>
                <X className="w-3 h-3 mr-1" /> Clear All
              </Button>
            )}
            <Button size="sm" className="h-9 gap-1.5 text-sm bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
              <Search className="w-3.5 h-3.5" /> Search
            </Button>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Transfer ID</TableHead>
                <TableHead className="text-xs font-semibold">Order ID</TableHead>
                <TableHead className="text-xs font-semibold">Customer</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold text-right">Naira Rate</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-right">Date</TableHead>
                <TableHead className="text-xs font-semibold">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium text-accent">{r.transferId}</TableCell>
                  <TableCell className="text-xs font-medium">{r.orderId === "—" ? <span className="text-muted-foreground">—</span> : <span className="text-accent">{r.orderId}</span>}</TableCell>
                  <TableCell>
                    {r.customer === "—" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                          {r.customer.slice(-2)}
                        </div>
                        <span className="text-xs font-medium">{r.customer}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {r.type === "deposit" ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-warning" />
                      )}
                      <span className={`text-xs font-medium capitalize ${r.type === "deposit" ? "text-success" : "text-warning"}`}>
                        {r.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.description}</TableCell>
                  <TableCell className="text-right text-xs font-medium">₦{r.nairaRate.toLocaleString()}</TableCell>
                  <TableCell className={`text-right text-sm font-bold ${r.type === "deposit" ? "text-success" : "text-warning"}`}>
                    {r.type === "deposit" ? "+" : "-"}₦{r.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{r.date} · {r.time}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{r.remark}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Money Modal */}
      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" /> Add Money to Platform Wallet
            </DialogTitle>
            <DialogDescription>Deposit funds into the platform wallet for customer disbursements</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Amount (₦)</label>
              <Input
                placeholder="Enter amount..."
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value.replace(/[^0-9,]/g, ""))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Description (optional)</label>
              <Textarea
                placeholder="e.g. Weekly operational funding..."
                value={depositDescription}
                onChange={e => setDepositDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Remark (optional)</label>
              <Input
                placeholder="e.g. Scheduled top-up..."
                value={depositRemark}
                onChange={e => setDepositRemark(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleDeposit}>
              Deposit to Platform Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
