import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type ResetToken = {
  token: string;
  email: string;
  createdAt: number;
  used?: boolean;
};

const RESET_KEY = "cc_password_resets";
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function readResets(): ResetToken[] {
  try { return JSON.parse(sessionStorage.getItem(RESET_KEY) || "[]"); } catch { return []; }
}
function writeResets(list: ResetToken[]) {
  sessionStorage.setItem(RESET_KEY, JSON.stringify(list));
}

export default function AdminResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const reset = useMemo(() => readResets().find(r => r.token === token), [token]);
  const expired = reset ? Date.now() - reset.createdAt > TOKEN_TTL_MS : false;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Reset Password — CardChat Admin";
  }, []);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reset) return;
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    sessionStorage.setItem(`cc_password_${reset.email}`, password);
    const list = readResets().map(r => r.token === token ? { ...r, used: true } : r);
    writeResets(list);
    setDone(true);
    toast.success("Password reset. You can now sign in.");
  };

  // Invalid token
  if (!token || !reset) {
    return (
      <CenteredCard
        icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
        iconBg="bg-destructive/10"
        title="Invalid or expired link"
        description="This password reset link is no longer valid. Please request a new one."
        cta={<Button onClick={() => navigate("/admin/forgot-password")} className="w-full">Request New Link</Button>}
      />
    );
  }

  if (expired) {
    return (
      <CenteredCard
        icon={<AlertTriangle className="w-6 h-6 text-warning" />}
        iconBg="bg-warning/10"
        title="Link expired"
        description="For security, reset links expire after 1 hour. Please request a new one."
        cta={<Button onClick={() => navigate("/admin/forgot-password")} className="w-full">Request New Link</Button>}
      />
    );
  }

  if (reset.used && !done) {
    return (
      <CenteredCard
        icon={<AlertTriangle className="w-6 h-6 text-warning" />}
        iconBg="bg-warning/10"
        title="Link already used"
        description="This reset link has already been used. Request a new one if you still need to reset your password."
        cta={
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/admin/forgot-password")}>New Link</Button>
            <Button className="flex-1" onClick={() => navigate("/admin/login")}>Sign In</Button>
          </div>
        }
      />
    );
  }

  if (done) {
    return (
      <CenteredCard
        icon={<Check className="w-6 h-6 text-success" />}
        iconBg="bg-success/10"
        title="Password updated"
        description={`Your password has been reset. You can now sign in with your new password.`}
        cta={<Button className="w-full" onClick={() => navigate("/admin/login")}>Go to Sign In</Button>}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.03] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">for {reset.email}</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create new password</CardTitle>
            <CardDescription>Choose a strong password with at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 pt-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength <= 1 ? "bg-destructive" : strength === 2 ? "bg-warning" : strength === 3 ? "bg-accent" : "bg-success") : "bg-muted"}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">Update Password</Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

function CenteredCard({ icon, iconBg, title, description, cta }: { icon: React.ReactNode; iconBg: string; title: string; description: string; cta: React.ReactNode; }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full bg-card border rounded-2xl p-6 text-center">
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-3`}>
          {icon}
        </div>
        <h1 className="font-heading text-lg font-bold mb-1">{title}</h1>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {cta}
      </div>
    </div>
  );
}
