import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  QrCode, Plus, MoreVertical, Play, Pause, Link as LinkIcon, Trash2,
  Wifi, WifiOff, Timer, MessageSquare, Shield, RotateCw, CheckCircle2, Users, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  listWaNumbers, upsertWaNumber, removeWaNumber, setStatus, completeLink,
  onWaNumbersChange, appendAudit, gatewayHealth, setAssignedAgents,
  type WaBusinessNumber, type WaSessionStatus,
} from "@/lib/waBusinessNumbers";
import { adminUsers } from "@/data/mock";
import { useAdminRole } from "@/contexts/AdminRoleContext";

const statusMeta: Record<WaSessionStatus, { label: string; cls: string; Icon: any }> = {
  connected:    { label: "Connected",    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", Icon: Wifi },
  linking:      { label: "Awaiting QR",  cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",         Icon: QrCode },
  initializing: { label: "Booting",      cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",                 Icon: RotateCw },
  paused:       { label: "Paused",       cls: "bg-muted text-muted-foreground border-border",                                    Icon: Pause },
  disconnected: { label: "Disconnected", cls: "bg-destructive/15 text-destructive border-destructive/30",                        Icon: WifiOff },
  banned:       { label: "Banned",       cls: "bg-destructive/15 text-destructive border-destructive/30",                        Icon: WifiOff },
};

const maskPhone = (p: string) => {
  const clean = p.replace(/\D/g, "");
  if (clean.length < 4) return p;
  return `+${clean.slice(0, 3)}\u2009•••••\u2009${clean.slice(-4)}`;
};

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Deterministic mock QR — a checkerboard SVG that changes per phone
function MockQR({ seed }: { seed: string }) {
  const size = 21;
  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = (i: number) => {
      const x = Math.sin(h + i * 9301) * 43758.5453;
      return x - Math.floor(x);
    };
    const grid: boolean[] = [];
    for (let i = 0; i < size * size; i++) grid.push(rand(i) > 0.5);
    // Corner finder patterns
    const finder = (r: number, c: number) => {
      for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
        const on = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        grid[(r + dr) * size + (c + dc)] = on;
      }
    };
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
    return grid;
  }, [seed]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => on ? (
        <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="black" />
      ) : null)}
    </svg>
  );
}

export default function AdminWhatsAppSessions() {
  const { role } = useAdminRole();
  const [sessions, setSessions] = useState<WaBusinessNumber[]>(listWaNumbers());
  const [linking, setLinking] = useState<WaBusinessNumber | null>(null);
  const [addForm, setAddForm] = useState<{ label: string; phone: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<WaBusinessNumber | null>(null);
  const [selected, setSelected] = useState<WaBusinessNumber | null>(null);
  const [assignFor, setAssignFor] = useState<WaBusinessNumber | null>(null);
  const [assignDraft, setAssignDraft] = useState<string[]>([]);

  const agentUsers = useMemo(() => adminUsers.filter((u) => u.role === "agent"), []);

  useEffect(() => onWaNumbersChange(() => setSessions(listWaNumbers())), []);
  useEffect(() => {
    if (selected) setSelected(sessions.find((s) => s.id === selected.id) || null);
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const canManage = role === "super_admin";
  const health = gatewayHealth();

  const addSession = () => {
    if (!addForm?.label?.trim() || !addForm?.phone?.trim()) {
      toast.error("Label and phone number are required");
      return;
    }
    if (!/^\+?[0-9\s-]{7,20}$/.test(addForm.phone)) {
      toast.error("Enter a valid E.164 phone, e.g. +2348011112222");
      return;
    }
    const created = upsertWaNumber({
      label: addForm.label.trim(),
      phone: addForm.phone.trim(),
      status: "linking",
      active: false,
      color: "emerald",
    });
    setAddForm(null);
    setLinking(created);
  };

  const simulateScan = () => {
    if (!linking) return;
    completeLink(linking.id);
    toast.success(`${linking.label} is now connected`);
    setLinking(null);
  };

  const handleRemove = () => {
    if (!confirmDelete) return;
    removeWaNumber(confirmDelete.id);
    toast.success(`${confirmDelete.label} removed`);
    setConfirmDelete(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">WhatsApp Sessions</h1>
            <p className="text-sm text-muted-foreground">
              Shared pool of wwebjs numbers powering customer chat. Inbound conversations auto-route to available agents.
            </p>
          </div>
          {canManage && (
            <Button
              className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setAddForm({ label: "", phone: "" })}
            >
              <Plus className="w-4 h-4" /> Link WhatsApp Number
            </Button>
          )}
        </div>

        {/* Health strip */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active",   value: `${health.activeSessions}/${health.totalSessions}`, Icon: Wifi,          tint: "emerald" },
            { label: "Uptime",   value: `${health.uptimeHours.toFixed(1)}h`,                Icon: Timer,         tint: "sky" },
            { label: "RAM",      value: `${health.totalMemoryMB} MB`,                       Icon: Users,         tint: "violet" },
            { label: "Alerts",   value: `${health.disconnectAlerts}`,                       Icon: Shield,        tint: health.disconnectAlerts > 0 ? "rose" : "muted" },
          ].map((s) => (
            <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${s.tint === "muted" ? "muted" : `${s.tint}-500/10`}`}>
                <s.Icon className={`w-4 h-4 ${s.tint === "muted" ? "text-muted-foreground" : `text-${s.tint}-600`}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sessions table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Assigned agents</th>
                <th className="text-left px-4 py-3 font-medium">Warmup</th>
                <th className="text-left px-4 py-3 font-medium">Today</th>
                <th className="text-left px-4 py-3 font-medium">Reply ratio</th>
                <th className="text-left px-4 py-3 font-medium">RAM</th>
                <th className="text-left px-4 py-3 font-medium">Last seen</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const st = statusMeta[s.status];
                const StatusIcon = st.Icon;
                return (
                  <tr key={s.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(s)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          s.status === "connected" ? "bg-emerald-500" :
                          s.status === "paused" ? "bg-muted-foreground" :
                          s.status === "linking" || s.status === "initializing" ? "bg-amber-500 animate-pulse" :
                          "bg-destructive"
                        }`} />
                        <div>
                          <p className="font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">{maskPhone(s.phone)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`gap-1 ${st.cls}`}>
                        <StatusIcon className="w-3 h-3" /> {st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {s.assignedAgents && s.assignedAgents.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {s.assignedAgents.slice(0, 3).map((a) => (
                            <span key={a} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-medium">
                              {a}
                            </span>
                          ))}
                          {s.assignedAgents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{s.assignedAgents.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Shared pool</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {s.warmupDay ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Timer className="w-3 h-3" /> Day {s.warmupDay}/14
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Warmed up
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {s.dailyMsgCount} msg</span>
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span>{s.dailyConvCount} new</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={s.replyRatio < 0.5 ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {(s.replyRatio * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.memoryMB} MB</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(s.lastSeenAt)}</td>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {s.status === "paused" || s.status === "disconnected" ? (
                              <DropdownMenuItem onClick={() => { setStatus(s.id, "connected", "Resumed from admin panel"); toast.success(`${s.label} resumed`); }}>
                                <Play className="w-3.5 h-3.5 mr-2" /> Resume
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => { setStatus(s.id, "paused", "Paused from admin panel"); toast.success(`${s.label} paused`); }}>
                                <Pause className="w-3.5 h-3.5 mr-2" /> Pause
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { setStatus(s.id, "linking", "Re-link requested"); setLinking(s); }}>
                              <LinkIcon className="w-3.5 h-3.5 mr-2" /> Re-link (new QR)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { appendAudit(s.id, { ts: new Date().toISOString(), event: "warmup_advanced", actor: "Admin One", note: "Manually advanced warmup day" }); toast.success("Warmup day advanced"); }}>
                              <RotateCw className="w-3.5 h-3.5 mr-2" /> Advance warmup
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setAssignFor(s); setAssignDraft(s.assignedAgents || []); }}>
                              <UserPlus className="w-3.5 h-3.5 mr-2" /> Assign agents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(s)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">No sessions yet. Click "Link WhatsApp Number" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-muted-foreground mt-3">
          Sessions run as one Puppeteer instance per number. If a handset goes offline, the gateway attempts auto-reconnect (10s → 30s → 60s) and alerts Team Chat.
        </p>
      </div>

      {/* Add-session dialog */}
      <Dialog open={!!addForm} onOpenChange={(o) => !o && setAddForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link a new WhatsApp number</DialogTitle>
            <DialogDescription>
              Give the number a label, enter its phone in E.164 format, then scan the QR from the handset's WhatsApp → Linked Devices menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <Input
                autoFocus placeholder="e.g. Support Line"
                value={addForm?.label ?? ""}
                onChange={(e) => setAddForm((s) => ({ ...s!, label: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone (E.164)</label>
              <Input
                placeholder="+2348011112222" className="mt-1 font-mono"
                value={addForm?.phone ?? ""}
                onChange={(e) => setAddForm((s) => ({ ...s!, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddForm(null)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={addSession}>
              Continue → QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR-linking dialog */}
      <Dialog open={!!linking} onOpenChange={(o) => !o && setLinking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Scan to link {linking?.label}
            </DialogTitle>
            <DialogDescription>
              On the handset for <span className="font-mono">{linking?.phone}</span>, open WhatsApp → Settings → Linked Devices → Link a Device, then scan this code.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white p-4 rounded-lg border mx-auto w-64 h-64">
            {linking && <MockQR seed={linking.id + linking.phone} />}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <RotateCw className="w-3 h-3 animate-spin" /> Waiting for scan… (QR refreshes every 60s)
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinking(null)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={simulateScan}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simulate successful scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {confirmDelete?.label}?</DialogTitle>
            <DialogDescription>
              The wwebjs client will be torn down and the number logged out. Existing conversations stay visible; new inbound messages to {confirmDelete?.phone} will no longer reach the inbox.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>Remove session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit-log drawer (simple dialog) */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.label}
              {selected && <span className="text-xs text-muted-foreground font-mono font-normal">{maskPhone(selected.phone)}</span>}
            </DialogTitle>
            <DialogDescription>
              Session audit log · proxy {selected?.proxyRegion}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
            {selected?.auditLog.length === 0 && (
              <p className="p-4 text-xs text-muted-foreground text-center">No events yet.</p>
            )}
            {selected?.auditLog.map((e, i) => (
              <div key={i} className="p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{e.event.replace("_", " ")}</span>
                  <span className="text-muted-foreground">{timeAgo(e.ts)}</span>
                </div>
                <div className="text-muted-foreground">by {e.actor}{e.note ? ` · ${e.note}` : ""}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign agents dialog */}
      <Dialog open={!!assignFor} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Assign agents to {assignFor?.label}
            </DialogTitle>
            <DialogDescription>
              Select agents who can handle conversations on <span className="font-mono">{assignFor?.phone}</span>. One agent can be assigned to multiple numbers. Leave empty to keep this number in the shared pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 max-h-72 overflow-y-auto -mx-1 px-1">
            {agentUsers.map((agent) => {
              const checked = assignDraft.includes(agent.name);
              return (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    checked ? "bg-primary/5 border-primary/40" : "hover:bg-muted border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={checked}
                    onChange={(e) => {
                      setAssignDraft((d) =>
                        e.target.checked ? [...d, agent.name] : d.filter((n) => n !== agent.name)
                      );
                    }}
                  />
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{agent.email} · {agent.status}</p>
                  </div>
                </label>
              );
            })}
            {agentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No agents available.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFor(null)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                if (!assignFor) return;
                setAssignedAgents(assignFor.id, assignDraft);
                toast.success(
                  assignDraft.length === 0
                    ? `${assignFor.label} moved back to the shared pool`
                    : `${assignFor.label} assigned to ${assignDraft.length} agent${assignDraft.length === 1 ? "" : "s"}`
                );
                setAssignFor(null);
              }}
            >
              Save assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
