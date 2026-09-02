import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, Eye, EyeOff, AlertCircle } from "lucide-react";

// Prototype-only credential map. In a production build this MUST be replaced
// with a server-validated auth call (e.g. Lovable Cloud / Supabase Auth).
// Credentials are no longer rendered in the UI and the array is not exported.
const PROTOTYPE_ACCOUNTS: Record<string, { password: string; role: string; macAddress?: string }> = {
  "admin@cardchat.com": { password: "admin123", role: "super_admin", macAddress: "A4:5E:60:E8:1A:2B" },
  "lead@cardchat.com": { password: "lead123", role: "team_lead", macAddress: "B2:18:7F:C3:9D:04" },
  "agent@cardchat.com": { password: "agent123", role: "agent", macAddress: "CC:4A:92:11:E7:55" },
};

// Browsers cannot read the real device MAC — in production the desktop/agent
// app sends it to the backend. For the prototype we simulate one per browser
// and persist it so admins can register it in User Management.
function getDeviceMac(): string {
  const KEY = "cc_device_mac";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const mac = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()
  ).join(":");
  localStorage.setItem(KEY, mac);
  return mac;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [macError, setMacError] = useState(false);
  const [loading, setLoading] = useState(false);
  const deviceMac = getDeviceMac();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMacError(false);
    setLoading(true);

    setTimeout(() => {
      const lowerEmail = email.trim().toLowerCase();
      const stored = sessionStorage.getItem(`cc_password_${lowerEmail}`);
      const known = PROTOTYPE_ACCOUNTS[lowerEmail];
      const passwordMatches = stored
        ? password === stored || (known && password === known.password)
        : known && password === known.password;
      if (!known || !passwordMatches) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      // Device MAC verification — account with no MAC set is not device-locked
      if (known.macAddress && known.macAddress.toUpperCase() !== deviceMac.toUpperCase()) {
        setMacError(true);
        setError("Device not registered");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("adminAuth", JSON.stringify({ email: lowerEmail, role: known.role }));
      navigate("/admin");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.03] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">CardChat Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to access the admin panel</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/admin/forgot-password" className="text-xs font-medium text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && macError && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 space-y-1.5">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Device not registered
                  </div>
                  <p className="text-xs leading-relaxed">
                    This device's MAC address is not linked to this account. Sign-in is only allowed from the registered device.
                  </p>
                  <p className="text-xs">
                    Your device MAC: <span className="font-mono font-semibold select-all">{deviceMac}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ask a Super Admin to register this MAC address under User Management, or sign in from your registered device.
                  </p>
                </div>
              )}
              {error && !macError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 rounded-md border border-border/60 bg-muted/40 p-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Demo credentials</p>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <div>Super Admin · admin@cardchat.com / admin123</div>
                <div>Team Lead · lead@cardchat.com / lead123</div>
                <div>Agent · agent@cardchat.com / agent123</div>
              </div>
              <div className="border-t border-border/60 pt-2">
                <p className="text-[11px] text-muted-foreground">
                  This device's simulated MAC: <span className="font-mono font-medium text-foreground select-all">{deviceMac}</span>
                  <br />Registered MACs: A4:5E:60:E8:1A:2B (Super Admin) · B2:18:7F:C3:9D:04 (Team Lead) · CC:4A:92:11:E7:55 (Agent)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Prototype only · Enable Lovable Cloud for real authentication
        </p>
      </div>
    </div>
  );
}
