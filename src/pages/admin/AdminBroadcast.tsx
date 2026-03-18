import AdminLayout from "@/components/admin/AdminLayout";
import { Send, Users, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminBroadcast() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="font-heading text-xl font-bold mb-1">SMS Broadcast</h1>
        <p className="text-sm text-muted-foreground mb-6">Send bulk SMS to customers · Super Admin only</p>

        <div className="bg-card border rounded-xl p-5 space-y-4 mb-6">
          <h2 className="font-heading font-semibold text-sm">Compose Broadcast</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="outline" className="text-xs">All Users</Button>
              <Button size="sm" variant="outline" className="text-xs">VIP Only</Button>
              <Button size="sm" variant="outline" className="text-xs">Active (30d)</Button>
              <Button size="sm" variant="outline" className="text-xs">Custom</Button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              className="mt-1 w-full border rounded-lg p-3 text-sm bg-background resize-none h-24"
              placeholder="Type your broadcast message..."
              defaultValue="🎉 New card rates available! Check LightChat for the latest iTunes and Amazon card prices."
            />
            <p className="text-[10px] text-muted-foreground mt-1">87/160 characters</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Send className="w-3.5 h-3.5" /> Send Now
            </Button>
            <Button variant="outline" className="gap-2">
              <Clock className="w-3.5 h-3.5" /> Schedule
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-heading font-semibold text-sm">Broadcast History</h2>
          </div>
          <div className="divide-y">
            {[
              { date: "Mar 17, 2:00 PM", msg: "New rates available! Check the app.", recipients: 1240, delivered: 1198 },
              { date: "Mar 15, 10:00 AM", msg: "Welcome to LightChat! Start trading now.", recipients: 850, delivered: 832 },
            ].map((b, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{b.msg}</p>
                  <p className="text-xs text-muted-foreground">{b.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{b.delivered}/{b.recipients}</p>
                  <p className="text-[10px] text-muted-foreground">delivered</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
