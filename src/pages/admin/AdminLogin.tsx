import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

// Prototype-only credential map. In a production build this MUST be replaced
// with a server-validated auth call (e.g. Lovable Cloud / Supabase Auth).
// Credentials are no longer rendered in the UI and the array is not exported.
const PROTOTYPE_ACCOUNTS: Record<string, { password: string; role: string }> = {
  "admin@cardchat.com": { password: "admin123", role: "super_admin" },
  "lead@cardchat.com": { password: "lead123", role: "team_lead" },
  "agent@cardchat.com": { password: "agent123", role: "agent" },
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const lowerEmail = email.trim().toLowerCase();
      const stored = sessionStorage.getItem(`cc_password_${lowerEmail}`);
      const known = PROTOTYPE_ACCOUNTS[lowerEmail];
      const passwordMatches = stored
        ? password === stored || (known && password === known.password)
        : known && password === known.password;
      if (known && passwordMatches) {
        sessionStorage.setItem("adminAuth", JSON.stringify({ email: lowerEmail, role: known.role }));
        navigate("/admin");
      } else {
        setError("Invalid email or password.");
      }
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

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Prototype only · Enable Lovable Cloud for real authentication
        </p>
      </div>
    </div>
  );
}
