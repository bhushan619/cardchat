import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
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

  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-600" />
        <h2 className="font-heading font-semibold text-sm">Warmup / Anti-Ban Settings</h2>
      </div>

      <p className="text-xs text-muted-foreground">
        Daily caps per warmup phase — set via Gateway environment variables at startup, not editable here
      </p>

      <div className="grid grid-cols-4 gap-3">
        {policy.dailyCaps.map((cap) => (
          <div key={cap.day} className="rounded-lg bg-muted/40 p-3 text-center">
            <p className="text-sm font-semibold">{cap.day}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {cap.conv === 0 ? "Unlimited convo" : `${cap.conv} convo`} · {cap.msg === 0 ? "Unlimited msg" : `${cap.msg} msg`}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Warmup enforcement</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              When off, all sessions skip daily caps regardless of warmup day.
            </p>
          </div>
          <Switch
            checked={policy.warmupEnforcement}
            onCheckedChange={(v) => setPolicy({ ...policy, warmupEnforcement: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Min Reply Ratio (%)</label>
          <Input
            type="number" min={0} max={100} className="mt-1"
            value={policy.minReplyRatioPct}
            onChange={(e) => setPolicy({ ...policy, minReplyRatioPct: Math.min(100, num(e.target.value)) })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Burst Max (msgs/60s)</label>
          <Input
            type="number" min={0} className="mt-1"
            value={policy.burstMaxPer60s}
            onChange={(e) => setPolicy({ ...policy, burstMaxPer60s: num(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Message Delay Min (ms)</label>
          <Input
            type="number" min={0} className="mt-1"
            value={policy.msgDelayMinMs}
            onChange={(e) => setPolicy({ ...policy, msgDelayMinMs: num(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Message Delay Max (ms)</label>
          <Input
            type="number" min={0} className="mt-1"
            value={policy.msgDelayMaxMs}
            onChange={(e) => setPolicy({ ...policy, msgDelayMaxMs: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={save} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Save Policy
        </Button>
      </div>
    </div>
  );
}
