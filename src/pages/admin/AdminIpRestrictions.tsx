import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Globe, Plus, Trash2, Shield, AlertTriangle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type RestrictionMode = "allow" | "block";

interface CountryRule {
  id: string;
  country: string;
  code: string;
  mode: RestrictionMode;
  enabled: boolean;
}

interface IpRule {
  id: string;
  cidr: string;
  label: string;
  mode: RestrictionMode;
  enabled: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  rule: string;
  action: string;
}

const initialCountries: CountryRule[] = [
  { id: "1", country: "Nigeria", code: "NG", mode: "allow", enabled: true },
  { id: "2", country: "Ghana", code: "GH", mode: "allow", enabled: true },
  { id: "3", country: "North Korea", code: "KP", mode: "block", enabled: true },
];

const initialIps: IpRule[] = [
  { id: "1", cidr: "192.168.1.0/24", label: "Office network", mode: "allow", enabled: true },
  { id: "2", cidr: "10.0.0.0/8", label: "VPN range", mode: "allow", enabled: false },
  { id: "3", cidr: "203.0.113.0/24", label: "Known bad actors", mode: "block", enabled: true },
];

const initialAudit: AuditEntry[] = [
  { id: "1", timestamp: "Mar 18, 11:32 AM", ip: "203.0.113.45", country: "Unknown", rule: "IP Block: 203.0.113.0/24", action: "Blocked" },
  { id: "2", timestamp: "Mar 18, 10:15 AM", ip: "185.22.44.12", country: "North Korea", rule: "Country Block: KP", action: "Blocked" },
  { id: "3", timestamp: "Mar 17, 09:48 PM", ip: "203.0.113.99", country: "Unknown", rule: "IP Block: 203.0.113.0/24", action: "Blocked" },
];

export default function AdminIpRestrictions() {
  const [countries, setCountries] = useState<CountryRule[]>(initialCountries);
  const [ips, setIps] = useState<IpRule[]>(initialIps);
  const [audit] = useState<AuditEntry[]>(initialAudit);
  const [restrictionMessage, setRestrictionMessage] = useState(
    "Access to this service is restricted in your region. Please contact support if you believe this is an error."
  );
  const [newCountry, setNewCountry] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryMode, setNewCountryMode] = useState<RestrictionMode>("block");
  const [newIp, setNewIp] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");
  const [newIpMode, setNewIpMode] = useState<RestrictionMode>("block");
  const [activeTab, setActiveTab] = useState<"countries" | "ips" | "message" | "audit">("countries");

  const addCountry = () => {
    if (!newCountry || !newCountryCode) return;
    setCountries(prev => [...prev, { id: Date.now().toString(), country: newCountry, code: newCountryCode.toUpperCase(), mode: newCountryMode, enabled: true }]);
    setNewCountry("");
    setNewCountryCode("");
    toast({ title: "Country rule added", description: `${newCountry} (${newCountryMode})` });
  };

  const addIp = () => {
    if (!newIp) return;
    setIps(prev => [...prev, { id: Date.now().toString(), cidr: newIp, label: newIpLabel || newIp, mode: newIpMode, enabled: true }]);
    setNewIp("");
    setNewIpLabel("");
    toast({ title: "IP rule added", description: `${newIp} (${newIpMode})` });
  };

  const toggleCountry = (id: string) => setCountries(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  const removeCountry = (id: string) => setCountries(prev => prev.filter(c => c.id !== id));
  const toggleIp = (id: string) => setIps(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const removeIp = (id: string) => setIps(prev => prev.filter(r => r.id !== id));

  const tabs = [
    { id: "countries" as const, label: "Countries" },
    { id: "ips" as const, label: "IP Ranges" },
    { id: "message" as const, label: "Block Message" },
    { id: "audit" as const, label: "Audit Log" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">IP & Country Restrictions</h1>
            <p className="text-sm text-muted-foreground">Configure access restrictions by country or IP range · Cache refreshes every 5 minutes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 mb-5 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "countries" && (
          <div className="space-y-4">
            {/* Add country */}
            <div className="bg-card border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold">Add Country Rule</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Country Name</label>
                  <Input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="e.g. China" className="mt-1" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted-foreground">Code</label>
                  <Input value={newCountryCode} onChange={e => setNewCountryCode(e.target.value)} placeholder="CN" className="mt-1" maxLength={2} />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground">Mode</label>
                  <select
                    value={newCountryMode}
                    onChange={e => setNewCountryMode(e.target.value as RestrictionMode)}
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="allow">Allow</option>
                    <option value="block">Block</option>
                  </select>
                </div>
                <Button onClick={addCountry} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Country list */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Country</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Code</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Mode</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Enabled</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map(c => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm font-medium">{c.country}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.code}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.mode === "allow" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {c.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={c.enabled} onCheckedChange={() => toggleCountry(c.id)} className="scale-75" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeCountry(c.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ips" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold">Add IP/CIDR Rule</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">IP or CIDR Range</label>
                  <Input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="e.g. 192.168.0.0/16" className="mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Label</label>
                  <Input value={newIpLabel} onChange={e => setNewIpLabel(e.target.value)} placeholder="e.g. Office network" className="mt-1" />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground">Mode</label>
                  <select
                    value={newIpMode}
                    onChange={e => setNewIpMode(e.target.value as RestrictionMode)}
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="allow">Allow</option>
                    <option value="block">Block</option>
                  </select>
                </div>
                <Button onClick={addIp} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">CIDR</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Label</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Mode</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Enabled</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ips.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm font-mono">{r.cidr}</td>
                      <td className="px-4 py-3 text-xs">{r.label}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.mode === "allow" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {r.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch checked={r.enabled} onCheckedChange={() => toggleIp(r.id)} className="scale-75" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeIp(r.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "message" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold">Restriction Message</h3>
              <p className="text-xs text-muted-foreground">This message is shown to users when their access is blocked by country or IP rules.</p>
              <Textarea
                value={restrictionMessage}
                onChange={e => setRestrictionMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => toast({ title: "Message saved", description: "Restriction message updated successfully." })}
              >
                Save Message
              </Button>
            </div>

            {/* Preview */}
            <div className="bg-card border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold">Preview</h3>
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <h4 className="font-heading font-bold text-lg">Access Restricted</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{restrictionMessage}</p>
                <p className="text-xs text-muted-foreground">Error Code: GEO_BLOCK_001</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Showing recent blocked access attempts</span>
            </div>
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Timestamp</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">IP Address</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Country</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Matched Rule</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map(a => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-xs">{a.timestamp}</td>
                      <td className="px-4 py-3 text-xs font-mono">{a.ip}</td>
                      <td className="px-4 py-3 text-xs">{a.country}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.rule}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{a.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
