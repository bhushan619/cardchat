import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { useAdminT } from "@/contexts/AdminLangContext";
import { Users, MessageSquare, TrendingUp, Clock, Download, Timer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type Source = "app" | "whatsapp";
type Shift = "Day" | "Night";

type Incident = {
  alias: string;
  message: string;
  receivedAt: string;
  repliedAt: string | null;
  waitedSec: number | null;
};

type PerfRow = {
  date: string;
  agent: string;
  shift: Shift;
  source: Source;
  avgResponse: number; // seconds
  delayed: number;
  missing: number;
  chatUsers: number;
  delayedDetails: Incident[];
  missingDetails: Incident[];
};

const inc = (alias: string, message: string, receivedAt: string, repliedAt: string | null, waitedSec: number | null): Incident =>
  ({ alias, message, receivedAt, repliedAt, waitedSec });

const rows: PerfRow[] = [
  {
    date: "2026/8/1", agent: "RM Green mou", shift: "Day", source: "app",
    avgResponse: 20, delayed: 0, missing: 0, chatUsers: 100, delayedDetails: [], missingDetails: [],
  },
  {
    date: "2026/8/1", agent: "RM Green mou", shift: "Night", source: "app",
    avgResponse: 30, delayed: 1, missing: 0, chatUsers: 200,
    delayedDetails: [inc("B5N1QW", "Is my payout processed?", "2026/8/1 21:14", "2026/8/1 21:22", 480)],
    missingDetails: [],
  },
  {
    date: "2026/8/1", agent: "RM Blue mou", shift: "Day", source: "whatsapp",
    avgResponse: 40, delayed: 0, missing: 0, chatUsers: 100, delayedDetails: [], missingDetails: [],
  },
  {
    date: "2026/8/1", agent: "RM Blue mou", shift: "Night", source: "whatsapp",
    avgResponse: 20, delayed: 1, missing: 1, chatUsers: 200,
    delayedDetails: [inc("K9TZ4M", "Sent the card codes, please check", "2026/8/1 23:02", "2026/8/1 23:09", 420)],
    missingDetails: [inc("Q2XR8P", "Hello, are you still there?", "2026/8/1 23:51", null, null)],
  },
  {
    date: "2026/8/2", agent: "RM Green mou", shift: "Day", source: "app",
    avgResponse: 30, delayed: 0, missing: 0, chatUsers: 100, delayedDetails: [], missingDetails: [],
  },
  {
    date: "2026/8/2", agent: "RM Green mou", shift: "Night", source: "app",
    avgResponse: 40, delayed: 0, missing: 0, chatUsers: 200, delayedDetails: [], missingDetails: [],
  },
  {
    date: "2026/8/2", agent: "RM Blue mou", shift: "Day", source: "whatsapp",
    avgResponse: 20, delayed: 0, missing: 0, chatUsers: 100, delayedDetails: [], missingDetails: [],
  },
  {
    date: "2026/8/2", agent: "RM Blue mou", shift: "Night", source: "whatsapp",
    avgResponse: 30, delayed: 0, missing: 0, chatUsers: 200, delayedDetails: [], missingDetails: [],
  },
];

const escalations = [
  { agent: "Mike Agent", customer: "B5N1QW", participants: ["Sarah Lead"], duration: "12 min ago" },
  { agent: "Tunde Agent", customer: "K9M2BL", participants: ["Sarah Lead", "Admin One"], duration: "34 min ago" },
];

const fmtSec = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

export default function AdminTeam() {
  const t = useAdminT();
  const [source, setSource] = useState<Source>("app");
  const [date, setDate] = useState("");
  const [agent, setAgent] = useState("all");
  const [shift, setShift] = useState("all");
  const [drill, setDrill] = useState<{ row: PerfRow; kind: "delayed" | "missing" } | null>(null);

  const agents = useMemo(
    () => Array.from(new Set(rows.filter((r) => r.source === source).map((r) => r.agent))),
    [source],
  );

  const filtered = useMemo(
    () => rows.filter((r) =>
      r.source === source &&
      (!date || r.date === date.replace(/-/g, "/").replace(/\/0/g, "/")) &&
      (agent === "all" || r.agent === agent) &&
      (shift === "all" || r.shift === shift)),
    [source, date, agent, shift],
  );

  const totals = useMemo(() => {
    const users = filtered.reduce((s, r) => s + r.chatUsers, 0);
    const avg = filtered.length
      ? Math.round(filtered.reduce((s, r) => s + r.avgResponse, 0) / filtered.length)
      : 0;
    return {
      avg,
      delayed: filtered.reduce((s, r) => s + r.delayed, 0),
      missing: filtered.reduce((s, r) => s + r.missing, 0),
      users,
    };
  }, [filtered]);

  const exportCsv = () => {
    const head = ["Date", "Agent", "Shift", "Source", "Average response time (s)", "Delayed response times", "Number of missing replies", "Total number of chat users"];
    const body = filtered.map((r) => [r.date, r.agent, r.shift, r.source === "app" ? "App" : "WhatsApp", r.avgResponse, r.delayed, r.missing, r.chatUsers]);
    const csv = [head, ...body, ["Total", "", "", "", totals.avg, totals.delayed, totals.missing, totals.users]]
      .map((line) => line.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-response-report-${source}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: `${filtered.length} rows` });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="font-heading text-xl font-bold mb-1">Team Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Team Lead view · Agent performance overview</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: MessageSquare, label: "Active Chats", value: "27", change: "+5" },
            { icon: Users, label: "Online Agents", value: "3/4", change: "" },
            { icon: TrendingUp, label: "Orders Today", value: "16", change: "+3" },
            { icon: Clock, label: "Avg Response", value: fmtSec(totals.avg), change: "" },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-heading font-bold">{s.value}</p>
              {s.change && <p className="text-xs text-accent mt-1">{s.change}</p>}
            </div>
          ))}
        </div>

        {/* Agent Response Performance */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-semibold text-sm">Agent Performance</h2>
              <p className="text-xs text-muted-foreground">Response time reporting · counted separately by customer source</p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={source} onValueChange={(v) => { setSource(v as Source); setAgent("all"); }}>
                <TabsList className="h-8">
                  <TabsTrigger value="app" className="text-xs">App report</TabsTrigger>
                  <TabsTrigger value="whatsapp" className="text-xs">WhatsApp report</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" variant="outline" className="h-8" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="px-4 py-3 border-b flex flex-wrap gap-3">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-44"
            />
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Agent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Shift" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All shifts</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Night">Night</SelectItem>
              </SelectContent>
            </Select>
            {(date || agent !== "all" || shift !== "all") && (
              <Button size="sm" variant="ghost" className="h-9"
                onClick={() => { setDate(""); setAgent("all"); setShift("all"); }}>
                Clear
              </Button>
            )}
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Agent</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Shift</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Average response time</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Delayed response times</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Missing replies</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Total chat users</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.date}-${r.agent}-${r.shift}`} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium">{r.agent}</td>
                  <td className="px-4 py-3 text-sm text-center">{r.shift}</td>
                  <td className="px-4 py-3 text-sm text-center">{fmtSec(r.avgResponse)}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {r.delayed > 0 ? (
                      <button className="text-warning hover:underline font-medium"
                        onClick={() => setDrill({ row: r, kind: "delayed" })}>
                        {r.delayed}
                      </button>
                    ) : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {r.missing > 0 ? (
                      <button className="text-destructive hover:underline font-medium"
                        onClick={() => setDrill({ row: r, kind: "missing" })}>
                        {r.missing}
                      </button>
                    ) : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">{r.chatUsers}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td className="px-4 py-3 text-sm" colSpan={3}>Total ({filtered.length} rows)</td>
                  <td className="px-4 py-3 text-sm text-center">{fmtSec(totals.avg)}</td>
                  <td className="px-4 py-3 text-sm text-center text-warning">{totals.delayed}</td>
                  <td className="px-4 py-3 text-sm text-center text-destructive">{totals.missing}</td>
                  <td className="px-4 py-3 text-sm text-right">{totals.users}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Active Escalations */}
        <div className="mt-6 bg-card border rounded-xl p-4">
          <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" /> {t("Active Escalations")}
          </h2>
          {escalations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("No active escalations")}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Agent</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Participants</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((e) => (
                  <tr key={e.customer} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{e.agent}</td>
                    <td className="px-4 py-3 text-sm font-mono">{e.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.participants.join(", ")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.duration}</td>
                    <td className="px-4 py-3">
                      <span className="status-badge bg-success/10 text-success text-[10px]">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/admin" className="text-xs text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={!!drill} onOpenChange={(o) => !o && setDrill(null)}>
        <DialogContent className="max-w-lg">
          {drill && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {drill.kind === "delayed"
                    ? <><Timer className="w-4 h-4 text-warning" /> Delayed responses</>
                    : <><AlertTriangle className="w-4 h-4 text-destructive" /> Missing replies</>}
                </DialogTitle>
                <DialogDescription>
                  {drill.row.agent} · {drill.row.date} · {drill.row.shift} shift ·{" "}
                  {drill.row.source === "app" ? "App" : "WhatsApp"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {(drill.kind === "delayed" ? drill.row.delayedDetails : drill.row.missingDetails).map((d, i) => (
                  <div key={i} className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{d.alias}</span>
                      <span className="text-xs text-muted-foreground">{d.receivedAt}</span>
                    </div>
                    <p className="text-sm mt-1">{d.message}</p>
                    <p className="text-xs mt-2">
                      {d.repliedAt
                        ? <span className="text-warning">Replied {d.repliedAt} · waited {fmtSec(d.waitedSec ?? 0)}</span>
                        : <span className="text-destructive">No reply during the shift</span>}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
