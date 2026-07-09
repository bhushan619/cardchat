import { useEffect, useState } from "react";
import { Shield, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getWarmupPolicy, saveWarmupPolicy, onWarmupPolicyChange, type WarmupPolicy,
} from "@/lib/waBusinessNumbers";

export default function WarmupAntiBanCard() {
  const [policy, setPolicy] = useState<WarmupPolicy>(getWarmupPolicy());
  useEffect(() => onWarmupPolicyChange(() => setPolicy(getWarmupPolicy())), []);

  const save = () => {
    saveWarmupPolicy(policy);
    toast.success("Warmup & anti-ban policy saved");
  };

  const updateCap = (i: number, field: "conv" | "msg", value: number) => {
    const next = policy.dailyCaps.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setPolicy({ ...policy, dailyCaps: next });
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-sm">Warmup &amp; Anti-Ban Policy</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily caps applied to every wwebjs session while it warms up, plus
            reply-ratio and proxy safeguards to keep numbers healthy.
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Warmup phase</th>
              <th className="text-left px-3 py-2 font-medium">Max new conversations / day</th>
              <th className="text-left px-3 py-2 font-medium">Max outbound messages / day</th>
            </tr>
          </thead>
          <tbody>
            {policy.dailyCaps.map((cap, i) => (
              <tr key={cap.day} className="border-t">
                <td className="px-3 py-2 font-medium">{cap.day}</td>
                <td className="px-3 py-2">
                  <Input
                    type="number" min={0} value={cap.conv}
                    onChange={(e) => updateCap(i, "conv", Number(e.target.value) || 0)}
                    className="h-8 text-xs w-28"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number" min={0} value={cap.msg}
                    onChange={(e) => updateCap(i, "msg", Number(e.target.value) || 0)}
                    className="h-8 text-xs w-28"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">Set caps to 0 for "no enforced limit" (rate-limited only by anti-ban logic).</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Minimum reply ratio</label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number" step="0.05" min={0} max={1}
              value={policy.minReplyRatio}
              onChange={(e) => setPolicy({ ...policy, minReplyRatio: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">inbound / outbound over 24h. Below this triggers auto-pause.</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Residential proxy region</label>
          <Input
            className="mt-1 font-mono"
            value={policy.proxyRegion}
            onChange={(e) => setPolicy({ ...policy, proxyRegion: e.target.value })}
            placeholder="NG-Lagos-Residential"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Daily gateway restart</label>
          <Input
            type="time" className="mt-1 w-32"
            value={policy.dailyRestartAt}
            onChange={(e) => setPolicy({ ...policy, dailyRestartAt: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between border rounded-lg px-3 py-2">
          <div>
            <p className="text-sm font-medium">Number rotation</p>
            <p className="text-[11px] text-muted-foreground">Rotate sender number for broadcasts to spread load.</p>
          </div>
          <Switch
            checked={policy.numberRotation}
            onCheckedChange={(v) => setPolicy({ ...policy, numberRotation: v })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={save} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="w-3.5 h-3.5" /> Save Policy
        </Button>
      </div>
    </div>
  );
}
