import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Activity,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { trackingPlan, commonProperties, type Priority } from "@/data/trackingPlan";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "bg-destructive/10 text-destructive",
  P1: "bg-warning/10 text-warning",
  P2: "bg-primary/10 text-primary",
  P3: "bg-muted text-muted-foreground",
};

const RANGES = [
  { id: "24h", label: "Last 24h", mult: 0.06 },
  { id: "7d", label: "Last 7 days", mult: 0.35 },
  { id: "30d", label: "Last 30 days", mult: 1 },
  { id: "90d", label: "Last 90 days", mult: 2.7 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

const PLATFORMS = [
  { id: "all", label: "All platforms", share: 1 },
  { id: "android", label: "Android", share: 0.68 },
  { id: "ios", label: "iOS", share: 0.32 },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

// Deterministic pseudo-random generator so the mock results stay stable per event
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const BASE_BY_PRIORITY: Record<Priority, number> = {
  P0: 48000,
  P1: 17000,
  P2: 5200,
  P3: 1400,
};

function nf(n: number) {
  return n.toLocaleString("en-US");
}

export default function AdminEventTracking() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [range, setRange] = useState<RangeId>("30d");
  const [platform, setPlatform] = useState<PlatformId>("all");
  const [sort, setSort] = useState<"volume" | "users" | "trend" | "name">("volume");

  const rangeMult = RANGES.find((r) => r.id === range)!.mult;
  const platformShare = PLATFORMS.find((p) => p.id === platform)!.share;

  const allEvents = useMemo(() => {
    return trackingPlan.flatMap((c) =>
      c.events.map((e) => {
        const h = hash(e.name);
        const base = BASE_BY_PRIORITY[e.priority];
        const variance = 0.35 + ((h % 1000) / 1000) * 1.3;
        const count = Math.round(base * variance * rangeMult * platformShare);
        const usersRatio = 0.18 + ((h >> 3) % 400) / 1000;
        const users = Math.max(1, Math.round(count * usersRatio));
        const trend = Math.round((((h >> 7) % 700) / 10 - 30) * 10) / 10;
        const errorRate = e.name.includes("fail") || e.name.includes("error") ? ((h >> 5) % 90) / 10 : 0;
        const minsAgo = (h >> 11) % 240;
        return {
          ...e,
          category: c.name,
          categoryId: c.id,
          count,
          users,
          trend,
          errorRate,
          lastSeen: minsAgo < 60 ? `${Math.max(1, minsAgo)}m ago` : `${Math.round(minsAgo / 60)}h ago`,
        };
      }),
    );
  }, [rangeMult, platformShare]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allEvents.filter((e) => {
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchCat = category === "all" || e.categoryId === category;
      const matchPri = priority === "all" || e.priority === priority;
      return matchSearch && matchCat && matchPri;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "users") return b.users - a.users;
      if (sort === "trend") return b.trend - a.trend;
      return b.count - a.count;
    });
  }, [allEvents, search, category, priority, sort]);

  const totals = useMemo(() => {
    const totalEvents = allEvents.reduce((s, e) => s + e.count, 0);
    const activeUsers = Math.round(
      Math.max(...allEvents.map((e) => e.users)) * 1.35,
    );
    const errorEvents = allEvents.filter((e) => e.errorRate > 0).reduce((s, e) => s + e.count, 0);
    const crashFree = 99.4 - (errorEvents / totalEvents) * 3;
    return {
      totalEvents,
      activeUsers,
      errorEvents,
      errorShare: (errorEvents / totalEvents) * 100,
      crashFree,
      eventsTracked: allEvents.length,
    };
  }, [allEvents]);

  const byCategory = useMemo(() => {
    const rows = trackingPlan.map((c) => {
      const evs = allEvents.filter((e) => e.categoryId === c.id);
      const count = evs.reduce((s, e) => s + e.count, 0);
      return { id: c.id, name: c.name, count, events: evs.length };
    });
    const max = Math.max(...rows.map((r) => r.count), 1);
    return rows.sort((a, b) => b.count - a.count).map((r) => ({ ...r, pct: (r.count / max) * 100 }));
  }, [allEvents]);

  const topEvents = useMemo(() => [...allEvents].sort((a, b) => b.count - a.count).slice(0, 6), [allEvents]);

  const funnel = useMemo(() => {
    const pick = (name: string) => allEvents.find((e) => e.name === name);
    const steps = [
      { label: "App opened", ev: pick("app_open") || allEvents[0] },
      { label: "Registration started", ev: pick("auth_register_started") },
      { label: "Registration completed", ev: pick("auth_register_completed") },
      { label: "Login success", ev: pick("auth_login_success") },
      { label: "Order created", ev: pick("order_created") || pick("order_submit_tapped") },
    ].filter((s) => s.ev) as { label: string; ev: (typeof allEvents)[number] }[];
    const first = steps[0]?.ev.users || 1;
    return steps.map((s) => ({ label: s.label, users: s.ev.users, pct: (s.ev.users / first) * 100 }));
  }, [allEvents]);

  const exportCsv = () => {
    const rows = [
      ["Category", "Event", "Priority", "Events", "Unique users", "Trend %", "Error rate %", "Last seen"],
      ...filtered.map((e) => [
        e.category,
        e.name,
        e.priority,
        e.count,
        e.users,
        e.trend,
        e.errorRate.toFixed(1),
        e.lastSeen,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `cardchat-event-results-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} events exported to CSV.` });
  };

  return (
    <AdminLayout>
      <div className="p-5 space-y-5 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Mobile App Event Analytics
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              card-chat-app (Android + iOS) · {RANGES.find((r) => r.id === range)!.label} ·{" "}
              {PLATFORMS.find((p) => p.id === platform)!.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`px-3 h-9 text-xs font-medium transition-colors ${
                    range === r.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Events received
            </p>
            <p className="text-2xl font-bold mt-1">{nf(totals.totalEvents)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Active users
            </p>
            <p className="text-2xl font-bold mt-1">{nf(totals.activeUsers)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Events firing
            </p>
            <p className="text-2xl font-bold mt-1">{totals.eventsTracked}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Error events
            </p>
            <p className="text-2xl font-bold mt-1 text-destructive">
              {nf(totals.errorEvents)}
              <span className="text-sm text-muted-foreground font-normal"> · {totals.errorShare.toFixed(1)}%</span>
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Crash-free sessions
            </p>
            <p className="text-2xl font-bold mt-1 text-success">{totals.crashFree.toFixed(2)}%</p>
          </div>
        </div>

        {/* Top events + category volume + funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/40">
              <h2 className="text-sm font-semibold">Top events by volume</h2>
            </div>
            <div className="p-4 space-y-3">
              {topEvents.map((e) => (
                <div key={e.name} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-primary truncate">{e.name}</span>
                  <span className="text-xs font-semibold shrink-0">{nf(e.count)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/40">
              <h2 className="text-sm font-semibold">Volume by category</h2>
            </div>
            <div className="p-4 space-y-2.5 max-h-[260px] overflow-y-auto">
              {byCategory.slice(0, 8).map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="truncate">{c.name}</span>
                    <span className="text-muted-foreground shrink-0">{nf(c.count)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/40">
              <h2 className="text-sm font-semibold">Onboarding → first order funnel</h2>
            </div>
            <div className="p-4 space-y-2.5">
              {funnel.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="truncate">{s.label}</span>
                    <span className="text-muted-foreground shrink-0">
                      {nf(s.users)} · {s.pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search event or category..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All categories</option>
            {trackingPlan.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | "all")}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as PlatformId)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="volume">Sort: Volume</option>
            <option value="users">Sort: Unique users</option>
            <option value="trend">Sort: Trend</option>
            <option value="name">Sort: Event name</option>
          </select>
        </div>

        {/* Results table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b flex items-center justify-between bg-muted/40">
            <h2 className="text-sm font-semibold">Event results</h2>
            <span className="text-[11px] text-muted-foreground">{filtered.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="text-left font-medium px-4 py-2 w-[240px]">Event</th>
                  <th className="text-left font-medium px-4 py-2">Category</th>
                  <th className="text-left font-medium px-4 py-2 w-[70px]">Priority</th>
                  <th className="text-right font-medium px-4 py-2 w-[110px]">Events</th>
                  <th className="text-right font-medium px-4 py-2 w-[120px]">Unique users</th>
                  <th className="text-right font-medium px-4 py-2 w-[100px]">Trend</th>
                  <th className="text-right font-medium px-4 py-2 w-[100px]">Error rate</th>
                  <th className="text-right font-medium px-4 py-2 w-[100px]">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.name} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary break-all">{e.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.category}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[e.priority]}`}
                      >
                        {e.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right font-semibold">{nf(e.count)}</td>
                    <td className="px-4 py-2.5 text-xs text-right">{nf(e.users)}</td>
                    <td className="px-4 py-2.5 text-xs text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          e.trend >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {e.trend >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {Math.abs(e.trend).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right">
                      {e.errorRate > 0 ? (
                        <span className="text-destructive font-medium">{e.errorRate.toFixed(1)}%</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-right text-muted-foreground">{e.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No events match the current filters.</div>
          )}
        </div>

        {/* Common properties */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/40">
            <h2 className="text-sm font-semibold">Common properties (attached to every event)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                <th className="text-left font-medium px-4 py-2 w-[220px]">Property</th>
                <th className="text-left font-medium px-4 py-2">Source</th>
                <th className="text-left font-medium px-4 py-2">Example</th>
              </tr>
            </thead>
            <tbody>
              {commonProperties.map((p) => (
                <tr key={p.property} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs text-primary">{p.property}</td>
                  <td className="px-4 py-2.5 text-xs">{p.source}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{p.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
