import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { Star, ArrowLeft, Gift, Users, Copy, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CustomerRewards() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const myReferralCode = "A7X3KP";

  const handleSubmitCode = () => {
    if (inviteCode.trim()) {
      setSubmitted(true);
      toast.success("Invite code submitted successfully!");
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={() => navigate("/customer")} className="text-sm text-accent flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading font-semibold">Rewards</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
            <Star className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-heading font-bold text-lg">Invite Friends, Earn Rewards</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Earn rewards on every successful trade your invited friends make.
          </p>
        </div>

        {/* Your Referral Code */}
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-accent" />
            Your Referral Code
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-heading font-bold text-lg tracking-widest text-center">
              {myReferralCode}
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopyReferral}>
              {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Share this code with friends to earn rewards</p>
        </div>

        {/* Enter Invite Code */}
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="w-4 h-4 text-accent" />
            Got an Invite Code?
          </div>
          {submitted ? (
            <div className="text-center py-3 space-y-2">
              <CheckCircle className="w-8 h-8 text-success mx-auto" />
              <p className="text-sm font-medium">Code submitted!</p>
              <p className="text-[10px] text-muted-foreground">"{inviteCode}" has been applied to your account</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Enter a 6-character invite code or WS alias</p>
              <Input
                placeholder="e.g. ABC123 or WS alias"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
              />
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!inviteCode.trim()}
                onClick={handleSubmitCode}
              >
                Submit Code
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                You can enter a code within 7 days of registration. After that, source defaults to "App Ad".
              </p>
            </>
          )}
        </div>

        {/* Rewards Info */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-semibold">How it works</h4>
          <div className="space-y-1.5 text-[11px] text-muted-foreground">
            <p>1. Share your referral code with friends</p>
            <p>2. They sign up and enter your code</p>
            <p>3. Earn rewards on every successful trade they make</p>
          </div>
        </div>
      </div>
    </div>
  );
}
