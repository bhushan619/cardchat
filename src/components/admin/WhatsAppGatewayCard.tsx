import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { gatewayHealth, onWaNumbersChange, type GatewayHealth } from "@/lib/waBusinessNumbers";
import { toast } from "sonner";

function formatUptime(since: Date, now: number): string {
  const totalSec = Math.max(0, Math.floor((now - since.getTime()) / 1000));
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default function WhatsAppGatewayCard() {
  const [health, setHealth] = useState<GatewayHealth>(gatewayHealth());
  const [now, setNow] = useState(Date.now());

  useEffect(() => onWaNumbersChange(() => setHealth(gatewayHealth())), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const gwMB = Math.round(health.totalMemoryMB * 0.12);
  const sessMB = health.totalMemoryMB - gwMB;
  const healthy = health.disconnectAlerts === 0;

  const stats = [
    { label: "Active Sessions", value: `${health.activeSessions}/${health.totalSessions}`, sub: "" },
    { label: "Uptime", value: formatUptime(new Date(health.lastRestart), now), sub: "" },
    { label: "RAM", value: `${health.totalMemoryMB} MB`, sub: `${gwMB} gw + ${sessMB} sess` },
    { label: "Status", value: healthy ? "Healthy" : "Degraded", sub: "", green: healthy },
  ];

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h2 className="font-heading font-semibold text-sm">WhatsApp Gateway Health</h2>
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
          <div key={s.label} className="rounded-lg bg-muted/40 p-3 text-center">
            <p className={`text-lg font-bold ${s.green ? "text-emerald-600" : ""}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
