import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  InactivitySettings,
  loadInactivitySettings,
  saveInactivitySettings,
  getInactivityStats,
} from "@/lib/inactivity";

function InactivityStatsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [period, setPeriod] = useState<"7" | "30">("30");
  const stats = useMemo(() => getInactivityStats(Number(period)), [period, open]);

  const items = [
    { label: "Conversations Flagged Inactive", value: stats.flagged },
    { label: "Reminders Sent", value: stats.remindersSent },
    { label: "Recovered", value: stats.recovered },
    { label: "Recovery Rate", value: `${stats.recoveryRatePct}%` },
    { label: "Avg Recovery Time", value: `${stats.avgRecoveryMinutes} min` },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Inactivity Follow-Up Stats</DialogTitle>
          <DialogDescription>Recovery performance for inactive conversations.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Select value={period} onValueChange={(v) => setPeriod(v as "7" | "30")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-heading text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InactivityFollowUpCard() {
  const [settings, setSettings] = useState<InactivitySettings>(() => loadInactivitySettings());
  const [statsOpen, setStatsOpen] = useState(false);

  const update = <K extends keyof InactivitySettings>(key: K, value: InactivitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveInactivitySettings(settings);
    toast({
      title: "Settings saved",
      description: "Inactivity follow-up settings have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-heading">Inactivity Follow-Up</CardTitle>
          <CardDescription>
            Automatically detect and re-engage customers who go quiet mid-conversation.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setStatsOpen(true)} className="shrink-0 gap-2">
          <BarChart3 className="h-4 w-4" />
          View Stats
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="inactivity-enabled" className="text-sm font-medium">
              Enable Inactivity Tracking
            </Label>
            <p className="text-xs text-muted-foreground">Turn on inactivity detection and follow-up reminders.</p>
          </div>
          <Switch
            id="inactivity-enabled"
            checked={settings.enabled}
            onCheckedChange={(v) => update("enabled", v)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warning-threshold">Warning Threshold (minutes)</Label>
            <Input
              id="warning-threshold"
              type="number"
              min={0}
              value={settings.warningThresholdMin}
              onChange={(e) => update("warningThresholdMin", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-threshold">Reminder Threshold (minutes)</Label>
            <Input
              id="reminder-threshold"
              type="number"
              min={0}
              value={settings.reminderThresholdMin}
              onChange={(e) => update("reminderThresholdMin", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Set to 0 to disable automatic reminders.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-message">Reminder Message</Label>
          <Textarea
            id="reminder-message"
            rows={3}
            value={settings.reminderMessage}
            onChange={(e) => update("reminderMessage", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <div className="space-y-2">
            <Label htmlFor="max-reminders">Max Reminders Per Conversation</Label>
            <Input
              id="max-reminders"
              type="number"
              min={0}
              max={5}
              value={settings.maxRemindersPerConversation}
              onChange={(e) =>
                update(
                  "maxRemindersPerConversation",
                  Math.max(0, Math.min(5, Number(e.target.value)))
                )
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="active-hours-only" className="text-sm font-medium">
                Active Hours Only
              </Label>
              <p className="text-xs text-muted-foreground">
                Only track inactivity during business hours (Day shift).
              </p>
            </div>
            <Switch
              id="active-hours-only"
              checked={settings.activeHoursOnly}
              onCheckedChange={(v) => update("activeHoursOnly", v)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>

      <InactivityStatsDialog open={statsOpen} onOpenChange={setStatsOpen} />
    </Card>
  );
}
