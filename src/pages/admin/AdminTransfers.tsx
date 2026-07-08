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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Send, Search, Download, CheckCircle2, XCircle, Clock, Wallet, Coins } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Status = "pending" | "successful" | "failed" | "processing";

type Transfer = {
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
const channels: Transfer["channel"][] = ["PalmPay 1", "PalmPay 2", "Manual"];
const statuses: Status[] = ["pending", "successful", "processing", "failed"];

// Build consolidated transfers (initiated from chat transfer pop-up) from customer wallet mock data
const seed: Transfer[] = customerWallets.flatMap((w, i) => {
  const count = 2 + ((i + 1) % 3);
  return Array.from({ length: count }).map((_, j) => {
    const idx = i * 5 + j;
    return {
      id: `${20260311 + ((idx) % 8)}${String(200 + idx).padStart(4, "0")}`,
      alias: w.alias,
      amount: Math.round((w.totalWithdrawals / count) * (0.5 + (j * 0.2))),
      bankName: banks[(idx + 3) % banks.length],
      accountNumber: `****${String(2000 + idx * 211).slice(-4)}`,
      accountName: `Customer ${w.alias}`,
      requestedAt: `Mar ${11 + ((idx) % 8)}, 2026 · ${String(9 + (j % 8)).padStart(2, "0")}:${String((idx * 11) % 60).padStart(2, "0")} ${j % 2 ? "PM" : "AM"}`,
      status: statuses[(idx + 1) % statuses.length],
      reference: `TRF${(idx * 8317).toString(36).toUpperCase()}`,
      channel: channels[(idx) % channels.length],
    } satisfies Transfer;
  });
});

const statusConfig: Record<Status, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-500/10 text-blue-600", icon: Clock },
  successful: { label: "Successful", className: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-rose-500/10 text-rose-600", icon: XCircle },
};

export default function AdminTransfers() {
  const [items] = useState<Transfer[]>(seed);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [selected, setSelected] = useState<Transfer | null>(null);

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

  const exportCsv = () => {
    const headers = ["ID", "Alias", "Amount", "Bank", "Account", "Channel", "Status", "Reference", "Requested"];
    const rows = filtered.map(w => [w.id, w.alias, w.amount, w.bankName, w.accountNumber, w.channel, w.status, w.reference, w.requestedAt]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transfers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} records exported.` });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-accent" /> Customer Transfers
            </h1>
            <p className="text-sm text-muted-foreground">Consolidated view of all transfers initiated from the chat transfer pop-up</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <SummaryCard label="Total Transfers" value={totals.count.toString()} hint="In current view" />
          <SummaryCard label="Total Volume" value={totals.all} hint="All filtered" points />
          <SummaryCard label="Pending" value={totals.pending} hint="Awaiting action" tone="warning" points />
          <SummaryCard label="Successful" value={totals.successful} hint="Disbursed" tone="success" points />
        </div>

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
          <Input type="number" placeholder="Min pts" className="w-24" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
          <Input type="number" placeholder="Max pts" className="w-24" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Transfer ID</TableHead>
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
                    <TableCell className="text-right text-sm font-semibold"><span className="inline-flex items-center gap-0.5 justify-end"><Coins className="w-3 h-3" />{w.amount.toLocaleString()}</span></TableCell>
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
                    No transfers match your filters
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
              <Wallet className="w-4 h-4 text-accent" /> Transfer Details
            </DialogTitle>
            <DialogDescription>{selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {[
                ["Customer", selected.alias],
                ["Amount", <span key="amt" className="inline-flex items-center gap-0.5"><Coins className="w-3 h-3" />{selected.amount.toLocaleString()}</span>],
                ["Bank", selected.bankName],
                ["Account", selected.accountNumber],
                ["Account Name", selected.accountName],
                ["Channel", selected.channel],
                ["Reference", selected.reference],
                ["Requested", selected.requestedAt],
                ["Status", statusConfig[selected.status].label],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
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

function SummaryCard({ label, value, hint, tone, points }: { label: string; value: string | number; hint: string; tone?: "success" | "warning"; points?: boolean }) {
  const toneClass = tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-foreground";
  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold mt-1 ${toneClass} inline-flex items-center gap-0.5`}>
        {points && <Coins className="w-4 h-4" />}
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}
