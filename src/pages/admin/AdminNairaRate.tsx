import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { nairaRateHistory, systemNairaRate } from "@/data/mock";
import { DollarSign, Clock, Edit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminNairaRate() {
  const [editing, setEditing] = useState(false);
  const [rate, setRate] = useState(systemNairaRate.toString());
  const [reason, setReason] = useState("");

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="font-heading text-xl font-bold mb-1">Naira Rate Configuration</h1>
        <p className="text-sm text-muted-foreground mb-6">System-wide rate · Locked into orders at creation</p>

        {/* Current Rate Card */}
        <div className="bg-card border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active System Rate</p>
                <p className="text-3xl font-heading font-bold">₦{systemNairaRate.toLocaleString()}<span className="text-base font-normal text-muted-foreground"> / USD</span></p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)} className="gap-2">
              <Edit className="w-3.5 h-3.5" /> {editing ? "Cancel" : "Update Rate"}
            </Button>
          </div>

          {editing && (
            <div className="border-t pt-4 space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">New Rate (NGN per USD)</label>
                  <Input value={rate} onChange={e => setRate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Reason for Change</label>
                  <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Market adjustment" className="mt-1" />
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                <p className="text-xs text-warning-foreground">⚠ This rate will be broadcast to all active sessions and the Customer App immediately. All new orders will use this rate.</p>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <Save className="w-3.5 h-3.5" /> Save & Broadcast
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
