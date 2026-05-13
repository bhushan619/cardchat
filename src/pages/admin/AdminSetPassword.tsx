import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Mail, Check, ShieldCheck, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Invite = {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  createdAt: number;
  used?: boolean;
};

const STORAGE_KEY = "cc_password_invites";

function readInvites(): Invite[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeInvites(list: Invite[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function AdminSetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const invite = useMemo(() => readInvites().find(i => i.token === token), [token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Set Password — CardChat Admin";
  }, []);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = () => {
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (!invite) return;
    const list = readInvites().map(i => i.token === token ? { ...i, used: true } : i);
    writeInvites(list);
    sessionStorage.setItem(`cc_password_${invite.email}`, password);
    setDone(true);
    toast.success("Password created. You can now log in.");
  };

  if (!token || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full bg-card border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="font-heading text-lg font-bold mb-1">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This password setup link is no longer valid. Please ask your admin to resend the invite.
          </p>
          <Button variant="outline" onClick={() => navigate("/admin/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (invite.used && !done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full bg-card border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-warning" />
          </div>
          <h1 className="font-heading text-lg font-bold mb-1">Link already used</h1>
          <p className="text-sm text-muted-foreground mb-4">
            A password has already been set with this link.
          </p>
          <Button onClick={() => navigate("/admin/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full bg-card border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-success" />
          </div>
          <h1 className="font-heading text-lg font-bold mb-1">Password created!</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Welcome aboard, {invite.name}. You can now log in to CardChat Admin.
          </p>
          <Button className="w-full" onClick={() => navigate("/admin/login")}>Continue to Login</Button>
        </div>
      </div>
    );
  }

  const strengthColors = ["bg-muted", "bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full bg-card border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight">Set your password</h1>
            <p className="text-xs text-muted-foreground">Finish setting up your CardChat Admin account</p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {invite.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{invite.name}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" /> {invite.email}
            </p>
          </div>
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">
            {invite.role.replace("_", " ")}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pr-9"
              />
              <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`flex-1 ${i <= strength ? strengthColors[strength] : "bg-muted"}`} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground w-14 text-right">{strengthLabels[strength]}</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="pr-9"
              />
              <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={password.length < 8 || password !== confirm}>
            Create Password & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
