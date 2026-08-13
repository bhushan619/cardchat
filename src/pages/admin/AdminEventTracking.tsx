import { useMemo, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Activity, Search, Download, CheckCircle2, Circle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  trackingPlan,
  commonProperties,
  trackingNamingConvention,
  type Priority,
} from "@/data/trackingPlan";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const PRIORITY_STYLES: Record<Priority, string> = {
  P0: "bg-destructive/10 text-destructive",
  P1: "bg-warning/10 text-warning",
  P2: "bg-primary/10 text-primary",
  P3: "bg-muted text-muted-foreground",
};

const STORE_KEY = "cardchat_event_tracking_status";

function readStatus(): string[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminEventTracking() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "pending">("all");
  const [done, setDone] = useState<string[]>(readStatus);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(done));
    } catch {}
  }, [done]);

  const allEvents = useMemo(
    () => trackingPlan.flatMap((c) => c.events.map((e) => ({ ...e, category: c.name, categoryId: c.id }))),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEvents.filter((e) => {
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.trigger.toLowerCase().includes(q) ||
        e.properties.toLowerCase().includes(q) ||
        e.where.toLowerCase().includes(q);
      const matchCat = category === "all" || e.categoryId === category;
      const matchPri = priority === "all" || e.priority === priority;
      const isDone = done.includes(e.name);
      const matchStatus = statusFilter === "all" || (statusFilter === "done" ? isDone : !isDone);
      return matchSearch && matchCat && matchPri && matchStatus;
    });
  }, [allEvents, search, category, priority, statusFilter, done]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((e) => {
      const list = map.get(e.categoryId) || [];
      list.push(e);
      map.set(e.categoryId, list);
    });
    return trackingPlan
      .filter((c) => map.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, events: map.get(c.id)! }));
  }, [filtered]);

  const counts = useMemo(() => {
    const byPriority: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
    allEvents.forEach((e) => (byPriority[e.priority] += 1));
    return { total: allEvents.length, byPriority, implemented: done.length };
  }, [allEvents, done]);

  const toggle = (name: string) =>
    setDone((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const exportCsv = () => {
    const rows = [
      ["Category", "Event", "Trigger", "Properties", "Where to Implement", "Priority", "Status"],
      ...filtered.map((e) => [
        e.category,
        e.name,
        e.trigger,
        e.properties,
        e.where,
        e.priority,
        done.includes(e.name) ? "Implemented" : "Pending",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `cardchat-event-tracking-plan.csv`;
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
              Mobile App Event Tracking Plan
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              card-chat-app (Flutter / Android + iOS) · Analytics instrumentation specification
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Naming convention */}
        <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Naming convention</p>
            <p className="text-xs text-muted-foreground mt-0.5">{trackingNamingConvention}</p>
          </div>
        </div>

        {/* Summary widgets */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total events</p>
            <p className="text-2xl font-bold mt-1">{counts.total}</p>
          </div>
          {PRIORITIES.map((p) => (
            <div key={p} className="rounded-lg border bg-card p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{p} events</p>
              <p className="text-2xl font-bold mt-1">{counts.byPriority[p]}</p>
            </div>
          ))}
          <div className="rounded-lg border bg-card p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Implemented</p>
            <p className="text-2xl font-bold mt-1 text-success">
              {counts.implemented}
              <span className="text-sm text-muted-foreground font-normal">/{counts.total}</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search event, trigger, property, implementation point..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "done" | "pending")}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="done">Implemented</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Event tables by category */}
        <div className="space-y-5">
          {grouped.map((cat, idx) => (
            <div key={cat.id} className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b flex items-center justify-between bg-muted/40">
                <h2 className="text-sm font-semibold">
                  {idx + 1}. {cat.name}
                </h2>
                <span className="text-[11px] text-muted-foreground">{cat.events.length} events</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                      <th className="text-left font-medium px-4 py-2 w-[220px]">Event</th>
                      <th className="text-left font-medium px-4 py-2">Trigger</th>
                      <th className="text-left font-medium px-4 py-2">Properties</th>
                      <th className="text-left font-medium px-4 py-2">Where to implement</th>
                      <th className="text-left font-medium px-4 py-2 w-[70px]">Priority</th>
                      <th className="text-left font-medium px-4 py-2 w-[110px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.events.map((e) => {
                      const isDone = done.includes(e.name);
                      return (
                        <tr key={e.name} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2.5 font-mono text-xs text-primary break-all">{e.name}</td>
                          <td className="px-4 py-2.5 text-xs">{e.trigger}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{e.properties}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.where}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[e.priority]}`}
                            >
                              {e.priority}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => toggle(e.name)}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                isDone ? "text-success" : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                              {isDone ? "Done" : "Pending"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              No events match the current filters.
            </div>
          )}
        </div>

        {/* Common properties */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/40">
            <h2 className="text-sm font-semibold">Common properties (auto-attached to every event)</h2>
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
