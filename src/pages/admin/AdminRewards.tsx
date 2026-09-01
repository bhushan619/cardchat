import { useState, useMemo } from "react";
import { parse } from "date-fns";
import { formatDate } from "@/lib/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import {
  Gift, Search, ArrowDownLeft, Trophy, AlertTriangle, CheckCircle2, Loader2,
  Medal, Award, Download, Users, Settings2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { getBiWeeklyPeriods, getRankedUsers, rankingList, rankingTiers } from "@/data/rankingMock";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getReferralBonus, setReferralBonus, type ReferralBonusSettings } from "@/lib/referralBonus";
import { toast } from "sonner";
import PointsAmount from "@/components/admin/PointsAmount";



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
  { id: "RW-006", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited K9M2BL", date: "20/03/2026", time: "02:15 PM" },
  { id: "RW-007", alias: "R4P8TN", type: "referral", amount: 500, description: "Referral bonus — invited B5N1QW", date: "18/03/2026", time: "09:30 AM" },
  { id: "RW-010", alias: "W8T4FJ", type: "referral", amount: 500, description: "Referral bonus — invited H2L6YD", date: "15/03/2026", time: "11:00 AM" },
  { id: "RW-011", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited D3F9RX", date: "10/03/2026", time: "04:45 PM" },
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

const medalIcons: Record<number, JSX.Element> = {
  1: <Trophy className="w-4 h-4 text-yellow-500" />,
  2: <Medal className="w-4 h-4 text-gray-400" />,
  3: <Award className="w-4 h-4 text-amber-600" />,
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

  // Shared period
  const [selectedPeriod, setSelectedPeriod] = useState("2-h1");
  const activePeriod = periodOptions.find(p => p.value === selectedPeriod);

  // Records tab
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ranking" | "referral">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [allRecords, setAllRecords] = useState<RewardRecord[]>(rewardRecords);

  // Leaderboard tab
  const [rankSearch, setRankSearch] = useState("");

  // Distribution dialog
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<"ready" | "blocked" | null>(null);
  const [distributing, setDistributing] = useState(false);

  // Referral bonus settings dialog
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralCfg, setReferralCfg] = useState<ReferralBonusSettings>(() => getReferralBonus());
  const [referralDraft, setReferralDraft] = useState<ReferralBonusSettings>(referralCfg);

  const openReferral = () => {
    setReferralDraft(getReferralBonus());
    setReferralOpen(true);
  };

  const saveReferral = () => {
    setReferralBonus(referralDraft);
    setReferralCfg(referralDraft);
    setReferralOpen(false);
    toast.success("Referral bonus settings saved");
  };


  const pendingOrders = mockPendingOrders[selectedPeriod] || [];
  const isDistributed = distributedPeriods.has(selectedPeriod);

  const filtered = allRecords.filter(r => {
    const matchSearch = !search || r.alias.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    let matchDate = true;
    if (dateFrom || dateTo) {
      const recordDate = parse(`${r.date} ${r.time}`, "dd/MM/yyyy hh:mm aa", new Date());
      if (dateFrom && recordDate < dateFrom) matchDate = false;
      if (dateTo && recordDate > dateTo) matchDate = false;
    }
    return matchSearch && matchType && matchDate;
  });

  const rankedUsers = useMemo(() => getRankedUsers(rankingList), []);

  const filteredRanking = useMemo(() => {
    if (!rankSearch.trim()) return rankedUsers;
    return rankedUsers.filter(u => u.alias.toLowerCase().includes(rankSearch.toLowerCase()));
  }, [rankSearch, rankedUsers]);

  const totalRewards = allRecords.reduce((s, r) => s + r.amount, 0);
  const totalRanking = allRecords.filter(r => r.type === "ranking").reduce((s, r) => s + r.amount, 0);
  const totalReferral = allRecords.filter(r => r.type === "referral").reduce((s, r) => s + r.amount, 0);
  const projectedPayout = rankedUsers.reduce((s, u) => s + u.reward, 0);


  const handleExportRanking = () => {
    const headers = ["Rank", "Alias", "Volume", "Reward (Pts)"];
    const rows = filteredRanking.map(u => [u.rank, u.alias, u.volume, u.reward]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ranking_${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckAndDistribute = () => {
    setChecking(true);
    setCheckResult(null);
    setTimeout(() => {
      setChecking(false);
      setCheckResult(pendingOrders.length > 0 ? "blocked" : "ready");
    }, 1200);
  };

  const handleDistribute = () => {
    setDistributing(true);
    setTimeout(() => {
      const newRecords: RewardRecord[] = rankedUsers.map((u, i) => ({
        id: `RW-${String(allRecords.length + i + 1).padStart(3, "0")}`,
        alias: u.alias,
        type: "ranking" as const,
        amount: u.reward,
        description: `Bi-weekly ranking reward — Rank #${u.rank} (${activePeriod?.label || selectedPeriod})`,
        date: activePeriod ? formatDate(activePeriod.end) : "—",
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Ranking &amp; Rewards
            </h1>
            <p className="text-sm text-muted-foreground">
              Bi-weekly trading volume leaderboard and all rewards distributed to customers. Referral rewards are automatic; ranking rewards require manual distribution.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedPeriod} onValueChange={v => { setSelectedPeriod(v); setCheckResult(null); }}>
              <SelectTrigger className="w-60 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {periodOptions.map(p => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">
                    {p.label}{distributedPeriods.has(p.value) && " ✓"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSuperAdmin && (
              <Button variant="outline" onClick={openReferral} className="gap-2 h-9">
                <Settings2 className="w-4 h-4" />
                Referral Bonus Settings
              </Button>
            )}
            {isSuperAdmin && (
              <Button onClick={handleOpenDistribute} className="gap-2 h-9">
                <Gift className="w-4 h-4" />
                Distribute Ranking Rewards
              </Button>
            )}

          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent">Pts {totalRewards.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Rewards Paid</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">Pts {totalRanking.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Ranking Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">Pts {totalReferral.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Referral Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold">Pts {projectedPayout.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Projected — {activePeriod?.label || "current period"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="leaderboard">
          <TabsList className="mb-4">
            <TabsTrigger value="leaderboard" className="text-xs gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Volume Leaderboard
            </TabsTrigger>
            <TabsTrigger value="records" className="text-xs gap-1.5">
              <Gift className="w-3.5 h-3.5" /> Reward Records
            </TabsTrigger>
          </TabsList>

          {/* ---------- Leaderboard ---------- */}
          <TabsContent value="leaderboard" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reward Tiers */}
              <div className="bg-card border rounded-xl p-5 h-fit">
                <h2 className="text-sm font-semibold mb-4">Reward Tiers</h2>
                <div className="space-y-2">
                  {rankingTiers.map(t => (
                    <div key={t.threshold} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/50">
                      <span className="text-muted-foreground">≥ {t.threshold.toLocaleString()}</span>
                      <span className="font-semibold text-accent">Pts {t.reward.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard table */}
              <div className="lg:col-span-2 bg-card border rounded-xl p-5">
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <h2 className="text-sm font-semibold">Leaderboard ({filteredRanking.length} users)</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative w-48">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search alias..."
                        value={rankSearch}
                        onChange={e => setRankSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExportRanking}>
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-xs text-muted-foreground border-b">
                        <th className="text-left py-2 pl-3 w-16">Rank</th>
                        <th className="text-left py-2">Alias</th>
                        <th className="text-right py-2">Volume</th>
                        <th className="text-right py-2 pr-3">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRanking.map(u => (
                        <tr key={u.rank} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 pl-3">
                            <span className="flex items-center gap-1.5">
                              {medalIcons[u.rank] || <span className="text-muted-foreground">{u.rank}</span>}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-xs">{u.alias}</td>
                          <td className="py-2.5 text-right">{u.volume.toLocaleString()}</td>
                          <td className="py-2.5 text-right pr-3 font-semibold text-accent">Pts {u.reward.toLocaleString()}</td>
                        </tr>
                      ))}
                      {filteredRanking.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No trades yet this period — leaderboard is empty</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ---------- Reward Records ---------- */}
          <TabsContent value="records" className="mt-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
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
              <DateTimePicker value={dateFrom} onChange={setDateFrom} placeholder="From" />
              <DateTimePicker value={dateTo} onChange={setDateTo} placeholder="To" />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear dates
                </button>
              )}
            </div>

            <div className="bg-card border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">ID</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
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
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                            {r.alias.slice(-2)}
                          </div>
                          <span className="text-xs font-medium">{r.alias}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <ArrowDownLeft className={`w-3.5 h-3.5 ${r.type === "ranking" ? "text-success" : "text-warning"}`} />
                          <span className={`text-xs font-medium capitalize ${r.type === "ranking" ? "text-success" : "text-warning"}`}>
                            {r.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{r.description}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-success">
                        <PointsAmount value={r.amount} className="justify-end" prefix="+" />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{r.date} · {r.time}</TableCell>

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
          </TabsContent>
        </Tabs>
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

            {isDistributed && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-success">Already Distributed</p>
                  <p className="text-muted-foreground mt-0.5">Ranking rewards for this period have already been distributed.</p>
                </div>
              </div>
            )}

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

            {checkResult === "ready" && !isDistributed && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-success">All Orders Settled</p>
                  <p className="text-muted-foreground mt-0.5">
                    Rankings have been generated. Ready to distribute rewards to {rankedUsers.length} users totalling Pts {projectedPayout.toLocaleString()}.
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

      {/* Referral Bonus Settings */}
      <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-accent" /> Referral Bonus Settings
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure the bonus that is automatically credited when a referral qualifies. No manual distribution is required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-xs font-semibold">Auto-credit referral bonus</Label>
                  <p className="text-[11px] text-muted-foreground">Turn off to pause all referral payouts</p>
                </div>
                <Switch
                  checked={referralDraft.enabled}
                  onCheckedChange={v => setReferralDraft(d => ({ ...d, enabled: v }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Inviter bonus (Pts)</Label>
                  <Input
                    type="number" min={0} className="h-9 text-xs"
                    value={referralDraft.inviterBonus}
                    onChange={e => setReferralDraft(d => ({ ...d, inviterBonus: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Invitee bonus (Pts)</Label>
                  <Input
                    type="number" min={0} className="h-9 text-xs"
                    value={referralDraft.inviteeBonus}
                    onChange={e => setReferralDraft(d => ({ ...d, inviteeBonus: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Min. first order value (Pts)</Label>
                  <Input
                    type="number" min={0} className="h-9 text-xs"
                    value={referralDraft.minFirstOrderValue}
                    onChange={e => setReferralDraft(d => ({ ...d, minFirstOrderValue: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Max referrals / user (0 = ∞)</Label>
                  <Input
                    type="number" min={0} className="h-9 text-xs"
                    value={referralDraft.maxReferralsPerUser}
                    onChange={e => setReferralDraft(d => ({ ...d, maxReferralsPerUser: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-[11px]">Payout delay after qualifying order (hours)</Label>
                  <Input
                    type="number" min={0} className="h-9 text-xs"
                    value={referralDraft.payoutDelayHours}
                    onChange={e => setReferralDraft(d => ({ ...d, payoutDelayHours: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Referral Rules
              </p>
              <ul className="space-y-2 text-[11px] text-muted-foreground list-disc pl-4">
                <li>Each customer gets a unique invite code; the invitee must enter it during registration.</li>
                <li>
                  The bonus triggers only after the invitee completes their first successful order of at least{" "}
                  <span className="font-semibold text-foreground">Pts {referralDraft.minFirstOrderValue.toLocaleString()}</span>.
                </li>
                <li>
                  Inviter receives <span className="font-semibold text-foreground">Pts {referralDraft.inviterBonus.toLocaleString()}</span>;
                  invitee receives <span className="font-semibold text-foreground">Pts {referralDraft.inviteeBonus.toLocaleString()}</span>.
                </li>
                <li>Bonuses are credited automatically to the rewards balance{referralDraft.payoutDelayHours > 0 ? ` after ${referralDraft.payoutDelayHours}h` : " immediately"} — no admin action needed.</li>
                <li>
                  {referralDraft.maxReferralsPerUser > 0
                    ? `A user can earn the bonus for a maximum of ${referralDraft.maxReferralsPerUser} referrals.`
                    : "There is no cap on the number of referrals a user can earn from."}
                </li>
                <li>Cancelled or reversed first orders void the bonus; self-referral and duplicate devices are rejected.</li>
                <li>Referral rewards are separate from ranking rewards and do not affect leaderboard volume.</li>
              </ul>
              {!referralDraft.enabled && (
                <p className="mt-2 text-[11px] text-destructive font-medium">
                  Auto-credit is currently disabled — no referral bonuses will be paid.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReferralOpen(false)}>Cancel</Button>
            <Button onClick={saveReferral} className="gap-2">
              <CheckCircle2 className="w-4 h-4" /> Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>

  );
}
