import AdminLayout from "@/components/admin/AdminLayout";
import { Globe, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminApiConfig() {
  const [showSecret, setShowSecret] = useState(false);
  const [withdrawalsDisabled, setWithdrawalsDisabled] = useState(
    sessionStorage.getItem("cc_withdrawals_disabled") === "1"
  );
  const [disableReason, setDisableReason] = useState(
    sessionStorage.getItem("cc_withdrawals_reason") || "Withdrawals are temporarily paused for system maintenance. Please try again later."
  );

  const toggleWithdrawals = (next: boolean) => {
    setWithdrawalsDisabled(next);
    sessionStorage.setItem("cc_withdrawals_disabled", next ? "1" : "0");
    sessionStorage.setItem("cc_withdrawals_reason", disableReason);
    toast.success(next ? "All user withdrawals have been disabled" : "User withdrawals have been re-enabled");
  };

  const saveReason = () => {
    sessionStorage.setItem("cc_withdrawals_reason", disableReason);
    toast.success("Message saved");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="font-heading text-xl font-bold mb-1">3rd-Party Merchant API Config</h1>
        <p className="text-sm text-muted-foreground mb-6">Super Admin only · Configure endpoints, credentials, and webhooks</p>

        {/* API Status */}
        <div className="bg-card border rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">API Status: Connected</p>
              <p className="text-xs text-muted-foreground">Last health check: 2 min ago</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Test Connection
          </Button>
        </div>

        <div className="space-y-6">
          {/* Base Config */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">Base Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">API Base URL</label>
                <Input defaultValue="https://api.merchant.com/v2" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">API Version</label>
                <Input defaultValue="v2" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Environment</label>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-9">Sandbox</Button>
                  <Button size="sm" className="flex-1 text-xs h-9 bg-accent text-accent-foreground">Production</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Rate Limit (req/min)</label>
                <Input defaultValue="100" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">API Credentials</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">API Key</label>
                <Input defaultValue="pk_live_****************************" className="mt-1" readOnly />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">API Secret</label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    defaultValue="sk_live_abcdef1234567890"
                    className="mt-1 pr-16"
                    readOnly
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 mt-0.5">
                    <button onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Rotate Credentials
            </Button>
          </div>

          {/* Webhooks */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">Webhooks</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Callback URL</label>
                <Input defaultValue="https://api.cardchat.com/webhooks/merchant" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Signing Secret</label>
                <Input type="password" defaultValue="whsec_****" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Bank Verification */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">Bank Verification API</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Verification Endpoint</label>
              <Input defaultValue="https://api.merchant.com/v2/bank/verify" className="mt-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle className="w-3.5 h-3.5" /> Bank verification API is operational
            </div>
          </div>

          {/* Health Check */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">Health Monitoring</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Health Check Endpoint</label>
              <Input defaultValue="https://api.merchant.com/v2/health" className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Payment API", status: "operational" },
                { label: "Bank Verify", status: "operational" },
                { label: "Card Rates", status: "operational" },
              ].map(s => (
                <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
                  <CheckCircle className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-[10px] text-success">{s.status}</p>
                </div>
              ))}
            </div>
          </div>

          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Configuration</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
