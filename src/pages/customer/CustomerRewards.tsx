import { useState } from "react";
import { ArrowLeft, Gift, Users, Copy, CheckCircle, Trophy, ArrowDownLeft, X, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { rewardsBalance } from "@/data/mock";
import { getReferralBonus } from "@/lib/referralBonus";
import { maskAlias } from "@/lib/utils";
import NotificationPermissionBar from "@/components/customer/NotificationPermissionBar";
import { currentUserAlias } from "@/data/rankingMock";

type RewardEntry = {
  id: string;
  type: "ranking" | "referral";
  amount: number;
  description: string;
  date: string;
  invitedAlias?: string;
};

const rewardHistory: RewardEntry[] = [
  { id: "RW-005", type: "ranking", amount: 10000, description: "Ranking reward — Rank #18", date: "Mar 31, 2026" },
  { id: "RW-006", type: "referral", amount: 500, description: "Referral — invited K9M2BL", invitedAlias: "K9M2BL", date: "Mar 20, 2026" },
  { id: "RW-011", type: "referral", amount: 500, description: "Referral — invited D3F9RX", invitedAlias: "D3F9RX", date: "Mar 10, 2026" },
  { id: "RW-013", type: "ranking", amount: 20000, description: "Ranking reward — Rank #14", date: "Feb 28, 2026" },
  { id: "RW-014", type: "referral", amount: 500, description: "Referral — invited W8T4FJ", invitedAlias: "W8T4FJ", date: "Feb 15, 2026" },
  { id: "RW-015", type: "ranking", amount: 10000, description: "Ranking reward — Rank #17", date: "Jan 31, 2026" },
];

// Prototype: referral codes whose owner has already reached the invite limit.
// Any code entered here triggers the "invalid referral code" modal.
const LIMIT_REACHED_CODES = ["FULL00", "LMT999"];

export default function CustomerRewards() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showInvalidCode, setShowInvalidCode] = useState(false);

  const myReferralCode = "A7X3KP";
  const bonusSettings = getReferralBonus();
  const referralsUsed = rewardHistory.filter(r => r.type === "referral").length;
  const inviteLimitLabel =
    bonusSettings.maxReferralsPerUser > 0
      ? `${referralsUsed} of ${bonusSettings.maxReferralsPerUser} invites used`
      : `Unlimited invites — ${referralsUsed} used so far`;

  const totalRanking = rewardHistory.filter(r => r.type === "ranking").reduce((s, r) => s + r.amount, 0);
  const totalReferral = rewardHistory.filter(r => r.type === "referral").reduce((s, r) => s + r.amount, 0);

  const handleSubmitCode = () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;
    // Invalid when the inviter has already reached their invite limit
    if (LIMIT_REACHED_CODES.includes(code)) {
      setShowInvalidCode(true);
      return;
    }
    setSubmitted(true);
    toast.success("Invite code submitted successfully!");
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background border-x">
      <NotificationPermissionBar />
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={() => navigate("/customer")} className="text-sm text-accent flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading font-semibold flex-1">Rewards</h2>
        <button
          onClick={() => setShowInfo(true)}
          className="shrink-0 flex items-center h-7 rounded-full border bg-card px-2.5 text-[10px] font-medium text-muted-foreground hover:bg-accent/10 hover:text-accent hover:border-accent/40 transition-colors"
        >
          View Details
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Total Rewards Card */}
        <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-4 text-accent-foreground text-center">
          <p className="text-[11px] opacity-80">Total Rewards Earned</p>
          <p className="text-2xl font-heading font-bold mt-0.5">₦{rewardsBalance.toLocaleString()}</p>
          <div className="flex justify-center gap-6 mt-2.5">
            <div>
              <p className="text-base font-heading font-bold">₦{totalRanking.toLocaleString()}</p>
              <p className="text-[10px] opacity-70">Ranking</p>
            </div>
            <div className="w-px bg-accent-foreground/20" />
            <div>
              <p className="text-base font-heading font-bold">₦{totalReferral.toLocaleString()}</p>
              <p className="text-[10px] opacity-70">Referral</p>
            </div>
          </div>
        </div>

        {/* How Referrals Work — step by step, immediately visible at the top of the referral section */}
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4 text-accent" />
            How Referrals Work
          </div>
          <div className="space-y-2.5">
            {[
              { title: "Share your code", desc: "Send your referral code to friends who trade gift cards." },
              { title: "Friend joins & trades", desc: "They register with your code and complete their first trade." },
              { title: "You both earn", desc: "Bonus rewards are credited to both of you automatically." },
            ].map((s, i) => (
              <div key={s.title} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-2.5 space-y-1.5">
            {[
              "Earn a bonus for every friend who starts trading",
              "Your friend gets a welcome bonus too",
              "Rewards are credited automatically — no claiming needed",
            ].map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                <p className="text-[11px] text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Code */}

        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Users className="w-4 h-4 text-accent" />
            Your Referral Code
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 font-heading font-bold text-lg tracking-widest text-center">
              {myReferralCode}
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopyReferral}>
              {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{inviteLimitLabel}</p>
        </div>


        {/* Enter Invite Code */}
        {!submitted && (
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gift className="w-4 h-4 text-accent" />
              Got an Invite Code?
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code or alias"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
                disabled={!inviteCode.trim()}
                onClick={handleSubmitCode}
              >
                Submit
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {bonusSettings.codeValidityDays > 0
                ? `Must be submitted within ${bonusSettings.codeValidityDays} day${bonusSettings.codeValidityDays === 1 ? "" : "s"} of registration`
                : "Can be submitted any time after registration"}
            </p>
          </div>
        )}

        {/* Rewards History */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">History</p>
          <div className="space-y-2">
            {rewardHistory.map(r => {
              const displayDescription = r.invitedAlias
                ? `Referral — invited ${r.invitedAlias === currentUserAlias ? r.invitedAlias : maskAlias(r.invitedAlias)}`
                : r.description;
              return (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-card border rounded-xl">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${r.type === "ranking" ? "bg-accent/10" : "bg-warning/10"}`}>
                  {r.type === "ranking" ? <Trophy className="w-4 h-4 text-accent" /> : <Gift className="w-4 h-4 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{displayDescription}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date}</p>
                </div>
                <p className="text-sm font-bold text-success shrink-0 flex items-center gap-0.5">
                  <ArrowDownLeft className="w-3 h-3" />
                  ₦{r.amount.toLocaleString()}
                </p>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* How it works info modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-card w-full max-w-md rounded-2xl flex flex-col max-h-[80dvh] animate-zoom-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0">
              <h3 className="font-heading font-semibold text-base">How Rewards Work</h3>
              <button onClick={() => setShowInfo(false)} className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-2.5 text-sm">
              {[
                { icon: Trophy, color: "text-accent bg-accent/10", title: "Ranking Rewards", desc: "Earn rewards based on your trading volume in bi-weekly periods (1st–15th and 16th–end of month)." },
                { icon: Users, color: "text-warning bg-warning/10", title: "Referral Rewards", desc: "Share your referral code with friends and earn an automatic bonus when they complete their first trade." },
                { icon: Gift, color: "text-accent bg-accent/10", title: "Invite Code", desc: "Enter a friend's code within 7 days of registration. After that, it can't be changed." },
                { icon: CheckCircle, color: "text-success bg-success/10", title: "Invite Limit", desc: bonusSettings.maxReferralsPerUser > 0 ? `You can earn referral bonuses for up to ${bonusSettings.maxReferralsPerUser} invited friends.` : "There's no limit on how many friends you can invite." },
              ].map((s) => (
                <div key={s.title} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-[13px] leading-tight">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 pt-2 border-t shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setShowInfo(false)}>Got it</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid referral code modal — inviter reached invite limit */}
      {showInvalidCode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowInvalidCode(false)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-3 animate-slide-up text-center" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-heading font-semibold">Invalid Referral Code</h3>
            <p className="text-sm text-muted-foreground">
              This referral code is no longer valid — the inviter has already reached their invite limit
              {bonusSettings.maxReferralsPerUser > 0 ? ` of ${bonusSettings.maxReferralsPerUser} invites` : ""}.
              Please try a different code.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowInvalidCode(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => { setInviteCode(""); setShowInvalidCode(false); }}
              >
                Try Another Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}