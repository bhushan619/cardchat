import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

const MOCK_CREDENTIALS = [
  { email: "admin@cardchat.com", password: "admin123", role: "super_admin" },
  { email: "lead@cardchat.com", password: "lead123", role: "team_lead" },
  { email: "agent@cardchat.com", password: "agent123", role: "agent" },
];

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
      const knownByEmail = MOCK_CREDENTIALS.find((c) => c.email === lowerEmail);
      // Accept either the original mock password OR a password set/reset by the user
      const passwordMatches = stored
        ? password === stored || (knownByEmail && password === knownByEmail.password)
        : knownByEmail && password === knownByEmail.password;
      const match = knownByEmail && passwordMatches ? knownByEmail : null;
      if (match) {
        sessionStorage.setItem("adminAuth", JSON.stringify({ email: match.email, role: match.role }));
        navigate("/admin");
      } else {
        setError("Invalid email or password. Try the demo credentials below.");
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
                  placeholder="admin@cardchat.com"
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

        {/* Demo credentials */}
        <Card className="border-dashed border-border/50 bg-muted/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-2">
              {MOCK_CREDENTIALS.map((c) => (
                <button
                  key={c.email}
                  onClick={() => { setEmail(c.email); setPassword(c.password); setError(""); }}
                  className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-muted transition-colors text-sm"
                >
                  <div>
                    <span className="font-medium text-foreground">{c.email}</span>
                    <span className="text-muted-foreground ml-2">/ {c.password}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium capitalize">
                    {c.role.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Prototype only · No real authentication
        </p>
      </div>
    </div>
  );
}
