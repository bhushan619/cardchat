import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { customerWallets } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ArrowDownToLine, Search, Download, CheckCircle2, XCircle, Clock, Wallet } from "lucide-react";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { toast } from "@/hooks/use-toast";

type Status = "pending" | "successful" | "failed" | "processing";

type Withdrawal = {
  id: string;
  alias: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  requestedAt: string;
  status: Status;
  reference: string;
  channel: "PalmPay 1" | "PalmPay 2" | "Manual";
};

const banks = ["First Bank", "GTBank", "Access Bank", "UBA", "Zenith", "Opay", "Kuda"];
const channels: Withdrawal["channel"][] = ["PalmPay 1", "PalmPay 2", "Manual"];
const statuses: Status[] = ["pending", "successful", "processing", "failed"];

// Build consolidated withdrawals from customer wallet mock data
const seed: Withdrawal[] = customerWallets.flatMap((w, i) => {
  const count = 2 + (i % 3);
  return Array.from({ length: count }).map((_, j) => {
    const idx = i * 5 + j;
    return {
      id: `WD-2026031${(8 - (j % 4))}-${String(100 + idx).padStart(3, "0")}`,
      alias: w.alias,
      amount: Math.round((w.totalWithdrawals / count) * (0.6 + (j * 0.15))),
      bankName: banks[(idx) % banks.length],
      accountNumber: `****${String(1000 + idx * 137).slice(-4)}`,
      accountName: `Customer ${w.alias}`,
      requestedAt: `Mar ${10 + ((idx) % 9)}, 2026 · ${String(8 + (j % 9)).padStart(2, "0")}:${String((idx * 7) % 60).padStart(2, "0")} ${j % 2 ? "PM" : "AM"}`,
      status: statuses[(idx) % statuses.length],
      reference: `REF${(idx * 9173).toString(36).toUpperCase()}`,
      channel: channels[(idx) % channels.length],
    } satisfies Withdrawal;
  });
});

const statusConfig: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-500/10 text-blue-600", icon: Clock },
  successful: { label: "Successful", className: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-rose-500/10 text-rose-600", icon: XCircle },
};

export default function AdminWithdrawals() {
  const { role } = useAdminRole();
  const canAct = role === "super_admin" || role === "finance";

  const [items, setItems] = useState<Withdrawal[]>(seed);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [selected, setSelected] = useState<Withdrawal | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const min = minAmount === "" ? -Infinity : Number(minAmount);
    const max = maxAmount === "" ? Infinity : Number(maxAmount);
    return items.filter(w =>
      (statusFilter === "all" || w.status === statusFilter) &&
      (channelFilter === "all" || w.channel === channelFilter) &&
      (bankFilter === "all" || w.bankName === bankFilter) &&
      w.amount >= min && w.amount <= max &&
      (q === "" || w.alias.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.reference.toLowerCase().includes(q) || w.bankName.toLowerCase().includes(q) || w.accountNumber.toLowerCase().includes(q))
    );
  }, [items, search, statusFilter, channelFilter, bankFilter, minAmount, maxAmount]);

  const totals = useMemo(() => {
    const sum = (s: Status) => filtered.filter(w => w.status === s).reduce((a, w) => a + w.amount, 0);
    return {
      all: filtered.reduce((a, w) => a + w.amount, 0),
      pending: sum("pending"),
      successful: sum("successful"),
      processing: sum("processing"),
      count: filtered.length,
    };
  }, [filtered]);

  const updateStatus = (id: string, status: Status) => {
    setItems(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    setSelected(s => s && s.id === id ? { ...s, status } : s);
    toast({ title: `Withdrawal ${status}`, description: `${id} marked as ${status}.` });
  };

  const exportCsv = () => {
    const headers = ["ID", "Alias", "Amount", "Bank", "Account", "Channel", "Status", "Reference", "Requested"];
    const rows = filtered.map(w => [w.id, w.alias, w.amount, w.bankName, w.accountNumber, w.channel, w.status, w.reference, w.requestedAt]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `withdrawals-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} records exported.` });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-accent" /> Customer Withdrawals
            </h1>
            <p className="text-sm text-muted-foreground">Consolidated view of all customer withdrawal transactions</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Summary widgets */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <SummaryCard label="Total Requests" value={totals.count.toString()} hint="In current view" />
          <SummaryCard label="Total Volume" value={`Pts ${totals.all.toLocaleString()}`} hint="All filtered" />
          <SummaryCard label="Pending" value={`Pts ${totals.pending.toLocaleString()}`} hint="Awaiting action" tone="warning" />
          <SummaryCard label="Successful" value={`Pts ${totals.successful.toLocaleString()}`} hint="Disbursed" tone="success" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search alias, ID, bank, account, ref..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Bank" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All banks</SelectItem>
              {banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min pts"
            className="w-24"
            value={minAmount}
            onChange={e => setMinAmount(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max pts"
            className="w-24"
            value={maxAmount}
            onChange={e => setMaxAmount(e.target.value)}
          />
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Request ID</TableHead>
                <TableHead className="text-xs font-semibold">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold">Bank</TableHead>
                <TableHead className="text-xs font-semibold">Channel</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Requested</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(w => {
                const cfg = statusConfig[w.status];
                const Icon = cfg.icon;
                return (
                  <TableRow key={w.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{w.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {w.alias.slice(-2)}
                        </div>
                        <span className="text-sm font-medium">{w.alias}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">Pts {w.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">
                      <p className="font-medium">{w.bankName}</p>
                      <p className="text-muted-foreground">{w.accountNumber}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{w.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{w.requestedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(w)}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    No withdrawal requests match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent" /> Withdrawal Details
            </DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                ["Customer", selected.alias],
                ["Amount", `Pts ${selected.amount.toLocaleString()}`],
                ["Bank", selected.bankName],
                ["Account", selected.accountNumber],
                ["Account Name", selected.accountName],
                ["Channel", selected.channel],
                ["Reference", selected.reference],
                ["Requested", selected.requestedAt],
                ["Status", statusConfig[selected.status].label],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function SummaryCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-foreground";
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold mt-1 ${toneClass}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}
