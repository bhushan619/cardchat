import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { nairaRateHistory, systemNairaRate, systemDenomination, systemPriceControl } from "@/data/mock";
import { Coins, Clock, Edit, Save, CheckCircle2, Loader2, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminRole } from "@/contexts/AdminRoleContext";

export default function AdminNairaRate() {
  const { role } = useAdminRole();
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(systemNairaRate.toString());
  const [denomination, setDenomination] = useState(systemDenomination.toString());
  const [priceControl, setPriceControl] = useState(systemPriceControl.toFixed(2));
  const [reason, setReason] = useState("");
  const [broadcasting, setBroadcasting] = useState<"idle" | "broadcasting" | "done">("idle");

  if (role === "agent") {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground">You do not have access to this page.</p>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = () => {
    const rateNum = Number(rate);
    if (isNaN(rateNum) || rateNum < 99 || rateNum > 299) {
      toast({
        title: "Invalid Rate",
        description: "Naira rate must be between 99 and 299.",
        variant: "destructive",
      });
      return;
    }
    const pcNum = Number(priceControl);
    if (isNaN(pcNum) || pcNum < 1 || pcNum > 100) {
      toast({
        title: "Invalid Price Control",
        description: "Price control must be between 1.00% and 100.00%.",
        variant: "destructive",
      });
      return;
    }
    setBroadcasting("broadcasting");
    toast({
      title: "Rate Updated",
      description: `Rate updated to ₦${rateNum.toLocaleString()} — broadcasting to all sessions...`,
    });
    setTimeout(() => {
      setBroadcasting("done");
      toast({
        title: "Broadcast Complete",
        description: "✓ All sessions updated successfully",
      });
    }, 2000);
    setTimeout(() => {
      setBroadcasting("idle");
      setEditing(false);
      setReason("");
    }, 4000);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="font-heading text-xl font-bold mb-1">Points Rate Configuration</h1>
        <p className="text-sm text-muted-foreground mb-6">System-wide rate · Locked into orders at creation</p>

        {/* Current Rate & Denomination Card */}
        <div className="bg-card border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active System Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-heading font-bold inline-flex items-center gap-1"><Coins className="w-6 h-6 text-accent" />{systemNairaRate.toLocaleString()}<span className="text-base font-normal text-muted-foreground"> / CNY</span></p>
                  {broadcasting === "broadcasting" && (
                    <span className="status-badge bg-warning/10 text-warning gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Broadcasting...
                    </span>
                  )}
                  {broadcasting === "done" && (
                    <span className="status-badge bg-success/10 text-success gap-1 animate-slide-up">
                      <CheckCircle2 className="w-3 h-3" /> All sessions updated
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="gap-2">
              <Edit className="w-3.5 h-3.5" /> {editing ? "Cancel" : "Update"}
            </Button>
          </div>

          {/* Price Control display */}
          <div className="flex items-center gap-2 mb-3 pl-[60px]">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Price Control:</p>
            <p className="text-lg font-heading font-bold">{systemPriceControl.toFixed(2)}%</p>
          </div>

          {editing && (
            <div className="border-t pt-4 space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">New Rate (Points per CNY)</label>
                  <Input value={rate} onChange={e => setRate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">New Price Control (%)</label>
                  <Input value={priceControl} onChange={e => setPriceControl(e.target.value)} placeholder="e.g. 85.00" className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Range: 1.00% – 100.00%</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Reason for Change</label>
                  <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Market adjustment" className="mt-1" />
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 space-y-1">
                <p className="text-xs text-warning-foreground">⚠ These values will be broadcast to all active sessions and the Customer App immediately. All new orders will use these values.</p>
                <p className="text-[10px] text-muted-foreground">Points rate: <strong>99–299</strong> · Price control: <strong>1.00%–100.00%</strong></p>
              </div>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                onClick={handleSave}
                disabled={broadcasting !== "idle"}
              >
                {broadcasting === "broadcasting" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Broadcasting...</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save & Broadcast</>
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Displayed on: Auto-billing modal · Customer App Home · Card Rates screen · Order creation
          </p>
        </div>

        {/* Rate History */}
        <div>
          <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Rate Change History
          </h2>
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Timestamp</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Old Rate</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">New Rate</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Changed By</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {nairaRateHistory.map((h, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-3 text-xs">{h.timestamp}</td>
                    <td className="px-4 py-3 text-xs text-right text-muted-foreground">₦{h.oldRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-right font-medium">₦{h.newRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{h.changedBy}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
