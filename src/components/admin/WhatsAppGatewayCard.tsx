import { Activity, Cpu, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { gatewayHealth, onWaNumbersChange, type GatewayHealth } from "@/lib/waBusinessNumbers";
import { toast } from "sonner";

export default function WhatsAppGatewayCard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<GatewayHealth>(gatewayHealth());
  useEffect(() => onWaNumbersChange(() => setHealth(gatewayHealth())), []);

  const stats = [
    { label: "Uptime",         value: `${health.uptimeHours.toFixed(1)}h`,                sub: "since last restart" },
    { label: "Active sessions",value: `${health.activeSessions}/${health.totalSessions}`, sub: "connected numbers" },
    { label: "Total RAM",      value: `${health.totalMemoryMB} MB`,                       sub: "Puppeteer RSS" },
    { label: "Alerts",         value: `${health.disconnectAlerts}`,                       sub: "disconnected / banned",
      danger: health.disconnectAlerts > 0 },
  ];

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-sm">WhatsApp Gateway (wwebjs)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Node.js gateway running one Puppeteer / whatsapp-web.js client per registered number.
              Inbound messages route through this service into the unified Messages inbox.
            </p>
          </div>
        </div>
        <Button
          size="sm" variant="outline" className="gap-1.5 shrink-0"
          onClick={() => toast.success("Gateway pinged — all subsystems nominal")}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Ping Gateway
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-lg border p-3 ${s.danger ? "bg-destructive/5 border-destructive/40" : "bg-muted/30"}`}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.danger ? "text-destructive" : ""}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {health.disconnectAlerts > 0 && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          {health.disconnectAlerts} session{health.disconnectAlerts > 1 ? "s are" : " is"} disconnected. Re-link from the sessions page.
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" /> Daily auto-restart 03:00 · residential proxy · RemoteAuth (Postgres)
        </span>
        <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => navigate("/admin/whatsapp-sessions")}>
          Manage sessions <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
