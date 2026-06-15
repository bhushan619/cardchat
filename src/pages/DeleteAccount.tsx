import Logo from "@/components/Logo";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const reasons = [
  "I no longer need the service",
  "I had a bad experience",
  "I found a better alternative",
  "Privacy concerns",
  "Other",
];

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !reason || !confirm) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Deletion request received", description: "We'll email you within 24 hours to confirm." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/landing" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="font-heading font-bold text-lg">CardChat</span>
          </Link>
          <Link to="/landing" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        {submitted ? (
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Request submitted</h1>
            <p className="text-muted-foreground mt-3 text-sm">
              We've received your account deletion request for <span className="text-foreground font-medium">{email}</span>. Our team will email you within 24 hours to verify your identity and confirm next steps.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Your data will be permanently erased within 30 days, except information we are legally required to retain (e.g. transaction records for tax compliance).
            </p>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/landing">Return Home</Link>
            </Button>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h1 className="font-heading text-3xl font-bold">Delete your account</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                We're sorry to see you go. Use this form to request permanent deletion of your CardChat account and associated data.
              </p>
            </header>

            <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <p className="font-semibold text-foreground">Before you continue</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Withdraw any remaining wallet balance — it cannot be recovered after deletion.</li>
                  <li>All trade history, chat messages, and rewards will be permanently erased.</li>
                  <li>This action is irreversible. You cannot reactivate the same account.</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Account Email *</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Reason for leaving *</label>
                <div className="mt-2 space-y-2">
                  {reasons.map((r) => (
                    <label key={r} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="accent-accent"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Additional feedback (optional)</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us how we could have done better..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(Boolean(v))} className="mt-0.5" />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I understand this action is permanent and irreversible. I have withdrawn my remaining balance and accept that my data will be deleted within 30 days.
                </span>
              </label>

              <Button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-500/90 text-white"
                disabled={!email || !reason || !confirm}
              >
                Request Account Deletion
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Changed your mind? <Link to="/landing" className="text-accent">Return home</Link>
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
