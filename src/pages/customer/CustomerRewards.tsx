import { useState } from "react";
import { ArrowLeft, Gift, Users, Copy, CheckCircle, Trophy, ArrowDownLeft, Info, X, XCircle } from "lucide-react";
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <NotificationPermissionBar />
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <button onClick={() => navigate("/customer")} className="text-sm text-accent flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="font-heading font-semibold flex-1">Rewards</h2>
        <button onClick={() => setShowInfo(true)} className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-4.5 h-4.5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <p className="text-[10px] text-muted-foreground">Must be submitted within 7 days of registration</p>
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
            ))}
          </div>
        </div>
      </div>

      {/* How it works info modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowInfo(false)}>
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">How Rewards Work</h3>
              <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-semibold text-foreground">Ranking Rewards</span> — Earn rewards based on your trading volume in bi-weekly periods (1st–15th and 16th–end of month). Rankings are generated after all orders in the period are settled, and rewards are distributed by the admin team.</p>
              <p><span className="font-semibold text-foreground">Referral Rewards</span> — Share your referral code with friends. Earn an automatic bonus when they sign up and complete their first trade.</p>
              <p><span className="font-semibold text-foreground">Invite Code</span> — Enter a friend's code within 7 days of registration. After that, it can't be changed.</p>
              <p><span className="font-semibold text-foreground">Invite Limit</span> — {bonusSettings.maxReferralsPerUser > 0 ? `You can earn referral bonuses for up to ${bonusSettings.maxReferralsPerUser} invited friends.` : "There's no limit on how many friends you can invite."}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowInfo(false)}>Got it</Button>
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