import { Fragment, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import {
  Coins, Lock, TrendingUp, TrendingDown, ShoppingCart, Users, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ANALYTICS_NOW,
  type AgentName,
  type Channel,
  cardTypeRankShifts,
  customerGrowth,
  getOrdersInRange,
  newVsReturning,
  peakHoursMatrix,
  summarize,
  volumeByCardType,
  volumeByDay,
} from "@/data/tradingAnalyticsMock";

type Period = "today" | "7d" | "30d" | "quarter";

const PERIOD_OPTIONS: { value: Period; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "Last 7 Days", days: 7 },
  { value: "30d", label: "Last 30 Days", days: 30 },
  { value: "quarter", label: "Last Quarter", days: 90 },
];

const AGENT_OPTIONS: AgentName[] = ["Admin One", "Sarah Lead", "Mike Agent"];
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => h);

function ptsFmt(n: number): string {
  return `Pts ${Math.round(n).toLocaleString()}`;
}

function heatOpacity(value: number, max: number): string {
  if (max === 0 || value === 0) return "bg-success/0";
  const ratio = value / max;
  if (ratio > 0.75) return "bg-success/90";
  if (ratio > 0.5) return "bg-success/70";
  if (ratio > 0.3) return "bg-success/50";
  if (ratio > 0.1) return "bg-success/30";
  return "bg-success/15";
}

export default function AdminTradingAnalytics() {
  const { role } = useAdminRole();
  const isSuperAdmin = role === "super_admin";

  const [period, setPeriod] = useState<Period>("30d");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [agent, setAgent] = useState<AgentName | "all">("all");
  const [aggregation, setAggregation] = useState<"daily" | "weekly">("daily");

  const periodDef = PERIOD_OPTIONS.find((p) => p.value === period)!;

  const { currentOrders, previousOrders, allOrdersBefore, rangeStart, rangeEnd } = useMemo(() => {
    const end = ANALYTICS_NOW;
    const start = new Date(end.getTime() - periodDef.days * DAY_MS);
    const prevEnd = start;
    const prevStart = new Date(prevEnd.getTime() - periodDef.days * DAY_MS);
    const before = getOrdersInRange(new Date(0), start, channel, agent);
    return {
      currentOrders: getOrdersInRange(start, end, channel, agent),
      previousOrders: getOrdersInRange(prevStart, prevEnd, channel, agent),
      allOrdersBefore: before,
      rangeStart: start,
      rangeEnd: end,
    };
  }, [periodDef, channel, agent]);

  const summary = useMemo(() => summarize(currentOrders), [currentOrders]);
  const dailyVolume = useMemo(() => volumeByDay(currentOrders), [currentOrders]);
  const prevDailyVolume = useMemo(() => volumeByDay(previousOrders), [previousOrders]);
  const cardTypeVolumes = useMemo(() => volumeByCardType(currentOrders), [currentOrders]);
  const { matrix, detail } = useMemo(() => peakHoursMatrix(currentOrders), [currentOrders]);
  const { growing, declining } = useMemo(
    () => customerGrowth(currentOrders, previousOrders),
    [currentOrders, previousOrders],
  );
  const newVsReturningData = useMemo(
    () => newVsReturning(currentOrders, allOrdersBefore),
    [currentOrders, allOrdersBefore],
  );
  const rankShifts = useMemo(() => cardTypeRankShifts(), []);

  const maxHeat = useMemo(() => Math.max(...matrix.flat(), 1), [matrix]);

  // Weekly-aggregated series (used when aggregation === weekly)
  const chartSeries = useMemo(() => {
    const bucketize = (series: { date: string; volume: number }[]) => {
      if (aggregation === "daily") return series;
      const weeks = new Map<string, number>();
      for (const d of series) {
        const dt = new Date(d.date);
        const weekStart = new Date(dt);
        weekStart.setUTCDate(dt.getUTCDate() - dt.getUTCDay());
        const key = weekStart.toISOString().slice(0, 10);
        weeks.set(key, (weeks.get(key) || 0) + d.volume);
      }
      return Array.from(weeks.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, volume]) => ({ date, volume }));
    };
    return {
      current: bucketize(dailyVolume),
      previous: bucketize(prevDailyVolume),
    };
  }, [dailyVolume, prevDailyVolume, aggregation]);

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
            <Lock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Trading Analytics is available to Super Admins only.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const maxChartVolume = Math.max(
    ...chartSeries.current.map((d) => d.volume),
    ...chartSeries.previous.map((d) => d.volume),
    1,
  );

  const buildLinePoints = (series: { volume: number }[]) => {
    if (series.length === 0) return "";
    const w = 100;
    const h = 100;
    return series
      .map((d, i) => {
        const x = series.length === 1 ? 0 : (i / (series.length - 1)) * w;
        const y = h - (d.volume / maxChartVolume) * h;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const maxCardVolume = Math.max(...cardTypeVolumes.map((c) => c.volume), 1);
  const maxNewReturning = Math.max(newVsReturningData.newVolume, newVsReturningData.returningVolume, 1);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> Trading Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Customer trading volume, peak hours, and card type trends across all channels.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {PERIOD_OPTIONS.map((p) => (
              <Button
                key={p.value}
                size="sm"
                variant={period === p.value ? "default" : "ghost"}
                className="h-8 text-xs"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <Select value={channel} onValueChange={(v) => setChannel(v as Channel | "all")}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="trtc">App</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agent} onValueChange={(v) => setAgent(v as AgentName | "all")}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue placeholder="Agent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {AGENT_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="peak" className="text-xs">Peak Hours</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs">Customers</TabsTrigger>
            <TabsTrigger value="cardtypes" className="text-xs">Card Types</TabsTrigger>
          </TabsList>

          {/* ---------------- Overview ---------------- */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Total Volume</span>
                </div>
                <p className="text-2xl font-heading font-bold">{ptsFmt(summary.totalVolume)}</p>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Orders</span>
                </div>
                <p className="text-2xl font-heading font-bold">{summary.totalOrders.toLocaleString()}</p>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Avg Order Value</span>
                </div>
                <p className="text-2xl font-heading font-bold">{ptsFmt(summary.avgOrderValue)}</p>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Active Customers</span>
                </div>
                <p className="text-2xl font-heading font-bold">{summary.activeCustomers.toLocaleString()}</p>
              </div>
            </div>

            {/* Volume over time chart */}
            <div className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div>
                  <h2 className="text-sm font-semibold">Volume Over Time</h2>
                  <p className="text-xs text-muted-foreground">
                    Solid = current period · Dotted = previous equivalent period
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={aggregation === "daily" ? "default" : "ghost"}
                    className="h-7 text-xs"
                    onClick={() => setAggregation("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    size="sm"
                    variant={aggregation === "weekly" ? "default" : "ghost"}
                    className="h-7 text-xs"
                    onClick={() => setAggregation("weekly")}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-52">
                <polyline
                  points={buildLinePoints(chartSeries.previous)}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="0.6"
                  strokeDasharray="2,2"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={buildLinePoints(chartSeries.current)}
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                <span>{chartSeries.current[0]?.date ?? ""}</span>
                <span>{chartSeries.current[chartSeries.current.length - 1]?.date ?? ""}</span>
              </div>
            </div>

            {/* Volume by card type */}
            <div className="bg-card border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">Volume by Card Type</h2>
              <div className="space-y-3">
                {cardTypeVolumes.map((c) => (
                  <div key={c.cardType}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{c.cardType}</span>
                      <span className="text-muted-foreground">
                        {ptsFmt(c.volume)} · {c.orders} orders
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${(c.volume / maxCardVolume) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ---------------- Peak Hours ---------------- */}
          <TabsContent value="peak" className="mt-0">
            <div className="bg-card border rounded-xl p-5 overflow-x-auto">
              <h2 className="text-sm font-semibold mb-1">Peak Hours Heatmap</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Order count by day of week and hour — {rangeStart.toDateString()} to {rangeEnd.toDateString()}
              </p>
              <div className="min-w-[820px]">
                <div className="grid" style={{ gridTemplateColumns: "48px repeat(24, minmax(0, 1fr))" }}>
                  <div />
                  {HOUR_LABELS.map((h) => (
                    <div key={h} className="text-[9px] text-muted-foreground text-center pb-1">
                      {h}
                    </div>
                  ))}
                  {DAY_LABELS.map((label, dayIdx) => (
                    <Fragment key={`row-${label}`}>
                      <div className="text-xs text-muted-foreground flex items-center pr-2">
                        {label}
                      </div>
                      {HOUR_LABELS.map((hour) => {
                        const value = matrix[dayIdx][hour];
                        const cellDetail = detail[dayIdx][hour];
                        return (
                          <div
                            key={`${label}-${hour}`}
                            title={`${cellDetail.orders} orders, ${ptsFmt(cellDetail.volume)}, ${cellDetail.customers} customers`}
                            className={`aspect-square m-[1px] rounded-sm ${heatOpacity(value, maxHeat)} border border-border/30`}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
                <span>Less</span>
                {["bg-success/0", "bg-success/15", "bg-success/30", "bg-success/50", "bg-success/70", "bg-success/90"].map((c) => (
                  <div key={c} className={`w-4 h-4 rounded-sm border border-border/30 ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </TabsContent>

          {/* ---------------- Customers ---------------- */}
          <TabsContent value="customers" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" /> Top 10 Growing
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-left py-2 w-10">Rank</th>
                      <th className="text-left py-2">Alias</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">Previous</th>
                      <th className="text-right py-2">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growing.map((g, i) => (
                      <tr key={g.alias} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 font-mono text-xs">{g.alias}</td>
                        <td className="py-2 text-right">{ptsFmt(g.currentVolume)}</td>
                        <td className="py-2 text-right text-muted-foreground">{ptsFmt(g.previousVolume)}</td>
                        <td className="py-2 text-right text-success font-semibold">+{g.growthPct}%</td>
                      </tr>
                    ))}
                    {growing.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">No growth data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-card border rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" /> Top 10 Declining / Churn Risk
                </h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-left py-2 w-10">Rank</th>
                      <th className="text-left py-2">Alias</th>
                      <th className="text-right py-2">Current</th>
                      <th className="text-right py-2">Previous</th>
                      <th className="text-right py-2">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {declining.map((g, i) => (
                      <tr key={g.alias} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 font-mono text-xs">{g.alias}</td>
                        <td className="py-2 text-right">{ptsFmt(g.currentVolume)}</td>
                        <td className="py-2 text-right text-muted-foreground">{ptsFmt(g.previousVolume)}</td>
                        <td className="py-2 text-right text-destructive font-semibold">{g.growthPct}%</td>
                      </tr>
                    ))}
                    {declining.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">No decline data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4">New vs. Returning Customers</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">New Customers · {newVsReturningData.newCount}</span>
                    <span className="text-muted-foreground">{ptsFmt(newVsReturningData.newVolume)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(newVsReturningData.newVolume / maxNewReturning) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">Returning Customers · {newVsReturningData.returningCount}</span>
                    <span className="text-muted-foreground">{ptsFmt(newVsReturningData.returningVolume)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: `${(newVsReturningData.returningVolume / maxNewReturning) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ---------------- Card Types ---------------- */}
          <TabsContent value="cardtypes" className="mt-0">
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Card Type</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">This Week Rank</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Last Week Rank</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Change</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">This Week Volume</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">This Week Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {rankShifts.map((r) => (
                    <tr key={r.cardType} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.cardType}</td>
                      <td className="px-4 py-3 text-center">{r.thisWeekRank}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{r.lastWeekRank ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {r.change === "up" && <TrendingUp className="w-4 h-4 text-success inline" />}
                        {r.change === "down" && <TrendingDown className="w-4 h-4 text-destructive inline" />}
                        {r.change === "same" && <Minus className="w-4 h-4 text-muted-foreground inline" />}
                        {r.change === "new" && <Badge className="bg-accent text-accent-foreground text-[10px]">NEW</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">{ptsFmt(r.thisWeekVolume)}</td>
                      <td className="px-4 py-3 text-right">{r.thisWeekOrders}</td>
                    </tr>
                  ))}
                  {rankShifts.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No card type data this week</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
