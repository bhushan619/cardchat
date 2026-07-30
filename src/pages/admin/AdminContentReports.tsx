import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
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
import {
  Flag, Search, Clock, CheckCircle2, ShieldAlert, UserX, MessageSquare, Eye,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ReportStatus = "pending" | "reviewed" | "resolved";

type ContentReport = {
  id: string;
  alias: string;
  agent: string;
  reason: string;
  message: string;
  details?: string;
  blocked: boolean;
  status: ReportStatus;
  createdAt: string;
  conversationId: string;
};

const REASONS = [
  "Scam or fraud attempt",
  "Abusive or harassing language",
  "Requesting off-platform payment",
  "Sharing inappropriate content",
  "Other",
];

const seed: ContentReport[] = [
  {
    id: "RPT-001", alias: "B5N1QW", agent: "CardChat Support", reason: "Scam or fraud attempt",
    message: "Please send your bank PIN so I can verify the payout account faster.",
    details: "The agent asked for my card PIN twice after the order was already confirmed.",
    blocked: true, status: "pending", createdAt: "Jul 30, 2026 10:33 AM", conversationId: "1",
  },
  {
    id: "RPT-002", alias: "K9TZ4M", agent: "Agent Mike", reason: "Requesting off-platform payment",
    message: "Let's finish this deal on WhatsApp, send me your number.",
    details: "Wanted to move the trade outside the app.",
    blocked: false, status: "reviewed", createdAt: "Jul 29, 2026 04:12 PM", conversationId: "2",
  },
  {
    id: "RPT-003", alias: "Q2XR8P", agent: "Agent Sophia", reason: "Abusive or harassing language",
    message: "You are wasting my time, stop messaging me about this order.",
    blocked: true, status: "resolved", createdAt: "Jul 28, 2026 09:05 AM", conversationId: "3",
  },
  {
    id: "RPT-004", alias: "L7WD3C", agent: "CardChat Support", reason: "Sharing inappropriate content",
    message: "Check this link for a bonus rate — bit.ly/xxx",
    details: "Suspicious external link shared inside the chat.",
    blocked: false, status: "pending", createdAt: "Jul 28, 2026 07:41 PM", conversationId: "4",
  },
  {
    id: "RPT-005", alias: "M4VB6H", agent: "Agent Mike", reason: "Other",
    message: "Ignore the rate on the app, I will give you a better one.",
    blocked: false, status: "resolved", createdAt: "Jul 26, 2026 11:20 AM", conversationId: "5",
  },
];

const statusStyles: Record<ReportStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-success/10 text-success border-success/20",
};

const statusLabel: Record<ReportStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

export default function AdminContentReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ContentReport[]>(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReportStatus>("all");
  const [reason, setReason] = useState<string>("all");
  const [active, setActive] = useState<ContentReport | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ = !q || [r.id, r.alias, r.agent, r.message].some((v) => v.toLowerCase().includes(q));
      const matchS = status === "all" || r.status === status;
      const matchR = reason === "all" || r.reason === reason;
      return matchQ && matchS && matchR;
    });
  }, [reports, query, status, reason]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    blocked: new Set(reports.filter((r) => r.blocked).map((r) => r.agent)).size,
  }), [reports]);

  const setStatusFor = (id: string, next: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    setActive((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev));
    toast({ title: `${id} marked as ${statusLabel[next]}` });
  };

  const widgets = [
    { label: "Total Reports", value: stats.total, icon: Flag, tone: "text-foreground" },
    { label: "Pending Review", value: stats.pending, icon: Clock, tone: "text-warning" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, tone: "text-success" },
    { label: "Blocked Agents", value: stats.blocked, icon: UserX, tone: "text-destructive" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" /> Content Reports
            </h1>
            <p className="text-sm text-muted-foreground">Customer reports of inappropriate agent behaviour</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets.map((w) => (
            <div key={w.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{w.label}</span>
                <w.icon className={`w-4 h-4 ${w.tone}`} />
              </div>
              <p className={`mt-2 text-2xl font-bold ${w.tone}`}>{w.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search report ID, alias, agent or message..."
                className="pl-9 h-9"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-9 w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-9 w-full md:w-56"><SelectValue placeholder="Reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reported Agent</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Block?</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.alias}</TableCell>
                  <TableCell className="text-sm">{r.agent}</TableCell>
                  <TableCell className="text-sm">{r.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                    '{r.message}'
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.blocked
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-muted text-muted-foreground"}>
                      {r.blocked ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[r.status]}>{statusLabel[r.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{r.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setActive(r)}
                      className="text-sm text-accent hover:underline"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                    No reports match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-destructive" /> {active.id}
                </DialogTitle>
                <DialogDescription>{active.createdAt}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer alias</p>
                    <p className="font-mono">{active.alias}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reported agent</p>
                    <p>{active.agent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agent blocked</p>
                    <p>{active.blocked ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className={statusStyles[active.status]}>{statusLabel[active.status]}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">{active.reason}</p>
                  {active.details && (
                    <p className="text-sm text-muted-foreground mt-1">{active.details}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reported message</p>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">{active.message}</div>
                </div>

                <button
                  onClick={() => navigate(`/admin/chat/${active.conversationId}`)}
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <MessageSquare className="w-4 h-4" /> Open conversation
                </button>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={active.status !== "pending"}
                    onClick={() => setStatusFor(active.id, "reviewed")}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Mark as Reviewed
                  </Button>
                  <Button
                    size="sm"
                    disabled={active.status === "resolved"}
                    onClick={() => setStatusFor(active.id, "resolved")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mark as Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => navigate("/admin/users", { state: { suspendAgent: active.agent } })}
                  >
                    <UserX className="w-4 h-4 mr-1" /> Suspend Agent
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
