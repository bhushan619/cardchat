import { useState } from "react";
import { Star, ArrowLeft, Gift, Users, Copy, CheckCircle, Trophy, ArrowDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { rewardsBalance } from "@/data/mock";

type RewardEntry = {
  id: string;
  type: "ranking" | "referral";
  amount: number;
  description: string;
  date: string;
};

const rewardHistory: RewardEntry[] = [
  { id: "RW-005", type: "ranking", amount: 50, description: "Monthly ranking reward — Rank #18", date: "Mar 31, 2026" },
  { id: "RW-006", type: "referral", amount: 500, description: "Referral bonus — invited K9M2BL", date: "Mar 20, 2026" },
  { id: "RW-011", type: "referral", amount: 500, description: "Referral bonus — invited D3F9RX", date: "Mar 10, 2026" },
  { id: "RW-013", type: "ranking", amount: 30, description: "Monthly ranking reward — Rank #22", date: "Feb 28, 2026" },
  { id: "RW-014", type: "referral", amount: 500, description: "Referral bonus — invited W8T4FJ", date: "Feb 15, 2026" },
  { id: "RW-015", type: "ranking", amount: 20, description: "Monthly ranking reward — Rank #25", date: "Jan 31, 2026" },
];

export default function CustomerRewards() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"overview" | "referral">("overview");

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

  const totalRanking = rewardHistory.filter(r => r.type === "ranking").reduce((s, r) => s + r.amount, 0);
  const totalReferral = rewardHistory.filter(r => r.type === "referral").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={() => navigate("/customer")} className="text-sm text-accent flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading font-semibold">Rewards</h2>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-card px-4 gap-4 shrink-0">
        <button
          onClick={() => setTab("overview")}
          className={`py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === "overview" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("referral")}
          className={`py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === "referral" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
        >
          Refer & Earn
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === "overview" ? (
          <>
            {/* Total Rewards Card */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-5 text-accent-foreground text-center">
              <p className="text-xs opacity-80">Total Rewards Earned</p>
              <p className="text-3xl font-heading font-bold mt-1">₦{rewardsBalance.toLocaleString()}</p>
              <div className="flex justify-center gap-6 mt-3">
                <div>
                  <p className="text-lg font-heading font-bold">₦{totalRanking.toLocaleString()}</p>
                  <p className="text-[10px] opacity-70">Ranking</p>
                </div>
                <div className="w-px bg-accent-foreground/20" />
                <div>
                  <p className="text-lg font-heading font-bold">₦{totalReferral.toLocaleString()}</p>
                  <p className="text-[10px] opacity-70">Referral</p>
                </div>
              </div>
            </div>

            {/* Rewards History */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rewards History</p>
              <div className="space-y-2">
                {rewardHistory.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-card border rounded-xl">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${r.type === "ranking" ? "bg-accent/10" : "bg-warning/10"}`}>
                      {r.type === "ranking" ? <Trophy className="w-4 h-4 text-accent" /> : <Gift className="w-4 h-4 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{r.description}</p>
                      <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    </div>
                    <p className="text-sm font-bold text-success shrink-0 flex items-center gap-0.5">
                      <ArrowDownLeft className="w-3 h-3" />
                      ₦{r.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}