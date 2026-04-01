import { useState, useMemo } from "react";
import { parse } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Gift, Search, ArrowDownLeft, Trophy, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { getBiWeeklyPeriods } from "@/data/rankingMock";
import { rankingList } from "@/data/rankingMock";
import { toast } from "sonner";

type RewardRecord = {
  id: string;
  alias: string;
  type: "ranking" | "referral";
  amount: number;
  description: string;
  date: string;
  time: string;
};

// Previously distributed rewards (referral auto, ranking manual)
const rewardRecords: RewardRecord[] = [
  { id: "RW-006", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited K9M2BL", date: "Mar 20, 2026", time: "02:15 PM" },
  { id: "RW-007", alias: "R4P8TN", type: "referral", amount: 500, description: "Referral bonus — invited B5N1QW", date: "Mar 18, 2026", time: "09:30 AM" },
  { id: "RW-010", alias: "W8T4FJ", type: "referral", amount: 500, description: "Referral bonus — invited H2L6YD", date: "Mar 15, 2026", time: "11:00 AM" },
  { id: "RW-011", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited D3F9RX", date: "Mar 10, 2026", time: "04:45 PM" },
];

// Mock: which periods have had ranking rewards distributed
const distributedPeriods = new Set<string>();

// Mock pending orders per period
const mockPendingOrders: Record<string, { id: string; customer: string; status: string; cardType: string; amount: number }[]> = {
  "2-h1": [], // Mar H1 — all settled
  "2-h2": [
    { id: "ORD-20260318-002", customer: "K9M2BL", status: "in_trade", cardType: "Amazon US", amount: 150 },
    { id: "ORD-20260320-004", customer: "R4P8TN", status: "pending", cardType: "iTunes US", amount: 200 },
  ],
};

function getPeriodOptions() {
  const options: { value: string; label: string; start: Date; end: Date }[] = [];
  for (let month = 0; month < 12; month++) {
    const [p1, p2] = getBiWeeklyPeriods(2026, month);
    options.push({ value: `${month}-h1`, label: p1.label, start: p1.start, end: p1.end });
    options.push({ value: `${month}-h2`, label: p2.label, start: p2.start, end: p2.end });
  }
  return options;
}

const periodOptions = getPeriodOptions();

export default function AdminRewards() {
  const { role } = useAdminRole();
  const isSuperAdmin = role === "super_admin";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ranking" | "referral">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("2-h1");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<"ready" | "blocked" | null>(null);
  const [distributing, setDistributing] = useState(false);
  const [allRecords, setAllRecords] = useState<RewardRecord[]>(rewardRecords);

  const pendingOrders = mockPendingOrders[selectedPeriod] || [];
  const isDistributed = distributedPeriods.has(selectedPeriod);
  const activePeriod = periodOptions.find(p => p.value === selectedPeriod);

  const filtered = allRecords.filter(r => {
    const matchSearch = !search || r.alias.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalRewards = allRecords.reduce((s, r) => s + r.amount, 0);
  const totalRanking = allRecords.filter(r => r.type === "ranking").reduce((s, r) => s + r.amount, 0);
  const totalReferral = allRecords.filter(r => r.type === "referral").reduce((s, r) => s + r.amount, 0);

  const handleCheckAndDistribute = () => {
    setChecking(true);
    setCheckResult(null);
    // Simulate checking orders
    setTimeout(() => {
      setChecking(false);
      if (pendingOrders.length > 0) {
        setCheckResult("blocked");
      } else {
        setCheckResult("ready");
      }
    }, 1200);
  };

  const handleDistribute = () => {
    setDistributing(true);
    setTimeout(() => {
      // Generate ranking reward records from the ranking list
      const newRecords: RewardRecord[] = rankingList.map((u, i) => ({
        id: `RW-${String(allRecords.length + i + 1).padStart(3, "0")}`,
        alias: u.alias,
        type: "ranking" as const,
        amount: u.reward,
        description: `Bi-weekly ranking reward — Rank #${u.rank} (${activePeriod?.label || selectedPeriod})`,
        date: activePeriod ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(activePeriod.end) : "—",
        time: "12:00 AM",
      }));
      setAllRecords(prev => [...newRecords, ...prev]);
      distributedPeriods.add(selectedPeriod);
      setDistributing(false);
      setDistributeOpen(false);
      setCheckResult(null);
      toast.success(`Ranking rewards distributed for ${activePeriod?.label || selectedPeriod}`);
    }, 1500);
  };

  const handleOpenDistribute = () => {
    setCheckResult(null);
    setChecking(false);
    setDistributing(false);
    setDistributeOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-accent" /> Rewards Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Track all rewards distributed to customers. Referral rewards are automatic; ranking rewards require manual distribution.
            </p>
          </div>
          {isSuperAdmin && (
            <Button onClick={handleOpenDistribute} className="gap-2">
              <Trophy className="w-4 h-4" />
              Distribute Ranking Rewards
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent">₦{totalRewards.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">₦{totalRanking.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Ranking Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">₦{totalReferral.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Referral Rewards</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search alias..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ranking">Ranking</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Alias</TableHead>
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
                  <TableCell className="text-xs font-bold">{r.alias}</TableCell>
                  <TableCell>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      r.type === "ranking"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{r.description}</TableCell>
                  <TableCell className="text-right text-sm font-bold text-success">
                    <span className="flex items-center justify-end gap-1">
                      <ArrowDownLeft className="w-3 h-3" />
                      ₦{r.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{r.date} · {r.time}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No rewards found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Distribute Ranking Rewards Dialog */}
      <Dialog open={distributeOpen} onOpenChange={setDistributeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Distribute Ranking Rewards
            </DialogTitle>
            <DialogDescription>
              Select a bi-weekly period and verify all orders are settled before distributing ranking rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Period selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bi-Weekly Period</label>
              <Select value={selectedPeriod} onValueChange={v => { setSelectedPeriod(v); setCheckResult(null); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {periodOptions.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">
                      {p.label}
                      {distributedPeriods.has(p.value) && " ✓"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Already distributed notice */}
            {isDistributed && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-success">Already Distributed</p>
                  <p className="text-muted-foreground mt-0.5">Ranking rewards for this period have already been distributed.</p>
                </div>
              </div>
            )}

            {/* Check result: blocked */}
            {checkResult === "blocked" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-destructive">Cannot Distribute — Open Orders Found</p>
                    <p className="text-muted-foreground mt-0.5">
                      {pendingOrders.length} order{pendingOrders.length > 1 ? "s" : ""} must be settled or cancelled before ranking rewards can be distributed.
                    </p>
                  </div>
                </div>

                {/* Pending orders list */}
                <div className="bg-muted/50 rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-semibold py-2">Order ID</TableHead>
                        <TableHead className="text-[10px] font-semibold py-2">Customer</TableHead>
                        <TableHead className="text-[10px] font-semibold py-2">Card</TableHead>
                        <TableHead className="text-[10px] font-semibold py-2">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-[10px] font-medium text-accent py-1.5">{o.id}</TableCell>
                          <TableCell className="text-[10px] font-bold py-1.5">{o.customer}</TableCell>
                          <TableCell className="text-[10px] py-1.5">{o.cardType} ${o.amount}</TableCell>
                          <TableCell className="py-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium capitalize">
                              {o.status.replace("_", " ")}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Check result: ready */}
            {checkResult === "ready" && !isDistributed && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-success">All Orders Settled</p>
                  <p className="text-muted-foreground mt-0.5">
                    Rankings have been generated. Ready to distribute rewards to {rankingList.length} users totalling ₦{rankingList.reduce((s, u) => s + u.reward, 0).toLocaleString()}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!checkResult && !isDistributed && (
              <Button onClick={handleCheckAndDistribute} disabled={checking} className="gap-2">
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {checking ? "Checking orders..." : "Check & Generate Rankings"}
              </Button>
            )}
            {checkResult === "blocked" && (
              <Button onClick={() => { setCheckResult(null); }} variant="outline" className="gap-2">
                Retry Check
              </Button>
            )}
            {checkResult === "ready" && !isDistributed && (
              <Button onClick={handleDistribute} disabled={distributing} className="gap-2">
                {distributing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                {distributing ? "Distributing..." : "Confirm & Distribute"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
