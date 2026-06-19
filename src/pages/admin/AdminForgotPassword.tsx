import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, ArrowLeft, Check, Copy } from "lucide-react";
import { toast } from "sonner";

const KNOWN_EMAILS = [
  "admin@cardchat.com",
  "lead@cardchat.com",
  "agent@cardchat.com",
  "femi@cardchat.com",
];

type ResetToken = {
  token: string;
  email: string;
  createdAt: number;
  used?: boolean;
};

const RESET_KEY = "cc_password_resets";

function readResets(): ResetToken[] {
  try { return JSON.parse(sessionStorage.getItem(RESET_KEY) || "[]"); } catch { return []; }
}
function writeResets(list: ResetToken[]) {
  sessionStorage.setItem(RESET_KEY, JSON.stringify(list));
}

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  useEffect(() => {
    document.title = "Forgot Password — CardChat Admin";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const lower = email.trim().toLowerCase();
      const exists = KNOWN_EMAILS.includes(lower) || !!sessionStorage.getItem(`cc_password_${lower}`);

      // Always generate token for known emails; for unknown emails still show success (no enumeration)
      if (exists) {
        const token = `rst_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
        const list = readResets().filter(r => r.email !== lower);
        list.push({ token, email: lower, createdAt: Date.now() });
        writeResets(list);
        const url = `${window.location.origin}/admin/reset-password?token=${token}`;
        setResetUrl(url);
      }
      setSent(true);
      setLoading(false);
    }, 600);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetUrl);
    toast.success("Reset link copied");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary/[0.03] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">CardChat Admin</h1>
          <p className="text-sm text-muted-foreground">Reset your password</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Forgot Password</CardTitle>
            <CardDescription>
              {sent
                ? "If an account exists for this email, a reset link has been sent."
                : "Enter your email and we'll send a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@cardchat.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-success/10 p-3">
                  <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Check your inbox</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      We've sent reset instructions to <span className="font-medium text-foreground">{email}</span>.
                    </p>
                  </div>
                </div>
                {resetUrl && (
                  <div className="rounded-lg border border-dashed bg-muted/30 p-3 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Prototype · Reset link
                    </p>
                    <p className="text-xs break-all text-foreground/80">{resetUrl}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={copyLink}>
                        <Copy className="w-3 h-3" /> Copy
                      </Button>
                      <Button size="sm" className="h-8" onClick={() => navigate(`/admin/reset-password?token=${resetUrl.split("token=")[1]}`)}>
                        Open Reset Page
                      </Button>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(""); setResetUrl(""); }}>
                  Use a different email
                </Button>
              </div>
            )}
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
