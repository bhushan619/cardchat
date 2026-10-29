import AdminLayout from "@/components/admin/AdminLayout";
import { Lock, Save } from "lucide-react";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUnregisteredUserAgent, saveUnregisteredUserAgent, unregisteredUserAgents } from "@/lib/unregisteredUserAgent";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getCustomerIntroductionMessage, isCustomerIntroductionMessageEnabled, saveCustomerIntroductionMessage, setCustomerIntroductionMessageEnabled } from "@/lib/customerIntroductionMessage";

export default function AdminApiConfig() {
  const { role } = useAdminRole();
  const [agentId, setAgentId] = useState(getUnregisteredUserAgent);
  const [savedIntroduction, setSavedIntroduction] = useState(getCustomerIntroductionMessage);
  const [introduction, setIntroduction] = useState(savedIntroduction);
  const [introductionEnabled, setIntroductionEnabled] = useState(isCustomerIntroductionMessageEnabled);

  const canView = role === "super_admin";

  if (!canView) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
            <Lock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Settings are available to Super Admins only.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-xl font-bold mb-1">Settings</h1>
        </div>

        <div className="max-w-md space-y-2">
          <label htmlFor="unregistered-user-agent" className="text-sm font-medium">Select Agent for unregistered users</label>
          <Select value={agentId} onValueChange={(value) => {
            setAgentId(value);
            saveUnregisteredUserAgent(value);
            toast.success("Agent selection saved");
          }}>
            <SelectTrigger id="unregistered-user-agent" aria-label="Select Agent for unregistered users">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent>
              {unregisteredUserAgents.map((agent) => (
                <SelectItem key={agent.id} value={String(agent.id)}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form className="space-y-3 border-t pt-6" onSubmit={(event) => {
          event.preventDefault();
          saveCustomerIntroductionMessage(introduction);
          setSavedIntroduction(introduction);
          toast.success("Customer introduction message saved");
        }}>
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-3">
            <div className="space-y-0.5">
              <label htmlFor="customer-introduction-enabled" className="block text-sm font-medium">
                Send introduction message to customers
              </label>
              <p className="text-xs text-muted-foreground">
                When switched off, customers do not receive the introduction message.
              </p>
            </div>
            <Switch
              id="customer-introduction-enabled"
              checked={introductionEnabled}
              onCheckedChange={(checked) => {
                setIntroductionEnabled(checked);
                setCustomerIntroductionMessageEnabled(checked);
                toast.success(checked ? "Introduction message enabled" : "Introduction message disabled");
              }}
            />
          </div>
          <label htmlFor="customer-introduction-message" className="block text-sm font-medium">
            Introduction message
          </label>
          <Textarea
            id="customer-introduction-message"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
            placeholder="Enter your introduction message"
            className="min-h-36 disabled:opacity-50"
            disabled={!introductionEnabled}
          />

          <Button type="submit" disabled={introduction === savedIntroduction}>
            <Save className="h-4 w-4 mr-2" />Save Message
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
