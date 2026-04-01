import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Download, Search, X } from "lucide-react";
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
  type: "deposit" | "disbursement";
  amount: number;
  description: string;
  date: string;
  time: string;
};

const initialRecords: PlatformRecord[] = [
  { id: "PW-001", type: "deposit", amount: 2000000, description: "Admin deposit — operational funding", date: "Mar 18, 2026", time: "08:00 AM" },
  { id: "PW-002", type: "disbursement", amount: 215200, description: "Auto-credit → A7X3KP — Order #ORD-20260318-001", date: "Mar 18, 2026", time: "10:42 AM" },
  { id: "PW-003", type: "disbursement", amount: 93000, description: "Auto-credit → K9M2BL — Order #ORD-20260317-005", date: "Mar 17, 2026", time: "03:20 PM" },
  { id: "PW-004", type: "deposit", amount: 1500000, description: "Admin deposit — weekly top-up", date: "Mar 15, 2026", time: "09:00 AM" },
  { id: "PW-005", type: "disbursement", amount: 62000, description: "Auto-credit → B5N1QW — Order #ORD-20260315-008", date: "Mar 15, 2026", time: "02:10 PM" },
  { id: "PW-006", type: "disbursement", amount: 186000, description: "Auto-credit → R4P8TN — Order #ORD-20260316-003", date: "Mar 16, 2026", time: "09:30 AM" },
];

function parseRecordDate(r: PlatformRecord): Date {
  try {
    return parse(`${r.date} ${r.time}`, "MMM dd, yyyy hh:mm aa", new Date());
  } catch {
    return new Date(0);
  }
}

export default function AdminWallets() {
  const [records, setRecords] = useState<PlatformRecord[]>(initialRecords);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "disbursement">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const totalDeposits = records.filter(r => r.type === "deposit").reduce((s, r) => s + r.amount, 0);
  const totalDisbursements = records.filter(r => r.type === "disbursement").reduce((s, r) => s + r.amount, 0);
  const platformBalance = totalDeposits - totalDisbursements;

  const filtered = records.filter(r => {
    const matchSearch = !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    let matchDate = true;
    if (dateFrom || dateTo) {
      const rd = parseRecordDate(r);
      if (dateFrom && rd < dateFrom) matchDate = false;
      if (dateTo && rd > dateTo) matchDate = false;
    }
    return matchSearch && matchType && matchDate;
  });

  const handleDeposit = () => {
    const amount = Number(depositAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const record: PlatformRecord = {
      id: `PW-${Date.now().toString(36).toUpperCase()}`,
      type: "deposit",
      amount,
      description: depositDescription || "Admin deposit",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setRecords(prev => [record, ...prev]);
    toast.success(`₦${amount.toLocaleString()} added to platform wallet`);
    setDepositAmount("");
    setDepositDescription("");
    setShowDeposit(false);
  };

  const handleExport = () => {
    const header = ["ID", "Type", "Description", "Amount (₦)", "Date", "Time"];
    const rows = filtered.map(r => [
      r.id,
      r.type,
      `"${r.description}"`,
      r.amount.toString(),
      r.date,
      r.time,
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

        <div className="grid grid-cols-3 gap-4 mb-6">
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
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">From</label>
              <DateTimePicker value={dateFrom} onChange={setDateFrom} />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">To</label>
              <DateTimePicker value={dateTo} onChange={setDateTo} />
            </div>
            {hasDateFilter && (
              <Button variant="ghost" size="sm" className="h-9 px-2 text-xs text-muted-foreground" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium text-accent">{r.id}</TableCell>
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
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{r.description}</TableCell>
                  <TableCell className={`text-right text-sm font-bold ${r.type === "deposit" ? "text-success" : "text-warning"}`}>
                    {r.type === "deposit" ? "+" : "-"}₦{r.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{r.date} · {r.time}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
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
            <Button className="w-full" onClick={handleDeposit}>
              Deposit to Platform Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}