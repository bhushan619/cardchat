import { useRef, useEffect, useState } from "react";
import { Trophy, ArrowLeft, Medal, Info, ChevronRight, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  rankingList,
  currentUserAlias,
  getCurrentTier,
  getNextTier,
  rankingTiers,
  getCurrentBiWeeklyPeriod,
  type RankingUser,
} from "@/data/rankingMock";

function getMedalIcon(rank: number) {
  if (rank === 1) return <Medal className="w-5 h-5 text-[hsl(45,93%,47%)]" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-[hsl(0,0%,66%)]" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-[hsl(30,60%,50%)]" />;
  return null;
}

function formatVolume(v: number) {
  return v.toLocaleString();
}

export default function CustomerRanking() {
  const navigate = useNavigate();
  const userRowRef = useRef<HTMLTableRowElement>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const currentPeriod = getCurrentBiWeeklyPeriod(new Date(2026, 2, 10)); // Mock: March 2026

  const me = rankingList.find((u) => u.alias === currentUserAlias)!;
  const currentTier = getCurrentTier(me.volume);
  const nextTier = getNextTier(me.volume);
  const remaining = nextTier ? nextTier.threshold - me.volume : 0;
  const progressPercent = nextTier
    ? Math.round((me.volume / nextTier.threshold) * 100)
    : 100;

  // Build display list
  const inTop20 = me.rank <= 20;
  let displayList: (RankingUser | "separator")[];

  if (inTop20) {
    displayList = rankingList.filter((u) => u.rank <= 20);
  } else {
    const top10 = rankingList.filter((u) => u.rank <= 10);
    const nearMe = rankingList.filter(
      (u) => u.rank >= me.rank - 2 && u.rank <= me.rank + 2
    );
    displayList = [...top10, "separator", ...nearMe];
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      userRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/customer")}
            className="text-sm text-accent flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-heading font-bold text-base leading-tight">
              Trading Volume Ranking
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {currentPeriod.label}
            </p>
          </div>
        </div>
        <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-3.5 h-3.5" /> Rules
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Ranking Rules</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Rankings are based on your total trading volume within the current <span className="font-semibold text-foreground">bi-weekly period</span>.</p>
              <p className="text-xs">Each month is split into two periods: the 1st to mid-month, and mid-month to the 1st of the next month. The exact split depends on the number of days in the month.</p>
              <p className="font-medium text-foreground">Reward Tiers:</p>
              <div className="space-y-1.5">
                {rankingTiers.map((t) => (
                  <div key={t.threshold} className="flex justify-between text-xs">
                    <span>≥ {formatVolume(t.threshold)} volume</span>
                    <span className="font-semibold text-accent">₦{formatVolume(t.reward)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs">Rankings reset at the start of every bi-weekly period. Rewards are credited within 48 hours after the period ends.</p>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Personal Achievement Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-accent/10 via-card to-accent/5 shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    My Rank
                  </p>
                  <p className="text-5xl font-black text-foreground leading-none">
                    #{me.rank}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Current Reward
                    </p>
                    <p className="text-xl font-bold text-accent">
                      ₦{formatVolume(me.reward)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Trading Volume
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {formatVolume(me.volume)}
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    To Next Tier
                  </p>
                  {nextTier ? (
                    <p className="text-lg font-bold text-warning">
                      {formatVolume(remaining)}
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-accent">Max ✓</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Progress & CTA */}
          <Card className="border shadow-sm">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress to next tier</span>
                <span className="font-bold text-foreground">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-muted" />
              {nextTier ? (
                <p className="text-sm text-foreground">
                  <Flame className="inline w-4 h-4 text-warning mr-1 -mt-0.5" />
                  Trade <span className="font-bold text-warning">{formatVolume(remaining)}</span> more
                  to unlock{" "}
                  <span className="font-bold text-accent">₦{formatVolume(nextTier.reward)}</span>{" "}
                  reward — almost there!
                </p>
              ) : (
                <p className="text-sm text-accent font-semibold">
                  🎉 You've reached the highest tier!
                </p>
              )}
              <Button
                className="w-full font-semibold gap-2"
                onClick={() => navigate("/customer/contacts")}
              >
                Increase Trading Volume <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Ranking List */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> Leaderboard
            </h3>

            <div className="rounded-xl border overflow-hidden bg-card">
              <div className="grid grid-cols-[3rem_1fr_5.5rem_4rem] text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-2.5 bg-muted/50 border-b">
                <span>Rank</span>
                <span>Nickname</span>
                <span className="text-right">Volume</span>
                <span className="text-right">Reward</span>
              </div>

              <div>
                {(displayList as (RankingUser | "separator")[]).map((item, idx) => {
                  if (item === "separator") {
                    return (
                      <div
                        key="sep"
                        className="flex items-center justify-center py-2 text-xs text-muted-foreground"
                      >
                        <span className="px-3 bg-muted rounded-full">• • •</span>
                      </div>
                    );
                  }

                  const isMe = item.alias === currentUserAlias;
                  const isTop3 = item.rank <= 3;

                  return (
                    <div
                      key={item.alias}
                      ref={isMe ? (userRowRef as any) : undefined}
                      className={`grid grid-cols-[3rem_1fr_5.5rem_4rem] items-center px-3 py-2.5 border-b last:border-b-0 transition-colors ${
                        isMe
                          ? "bg-accent/10 border-l-2 border-l-accent"
                          : ""
                      } ${isTop3 && !isMe ? "bg-warning/5" : ""}`}
                    >
                      <span className="flex items-center gap-1">
                        {getMedalIcon(item.rank) || (
                          <span
                            className={`text-sm ${
                              isMe ? "font-black text-accent" : "font-semibold text-muted-foreground"
                            }`}
                          >
                            {item.rank}
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          isMe ? "font-bold text-foreground" : "text-foreground"
                        }`}
                      >
                        {item.alias}
                        {isMe && (
                          <span className="ml-1.5 text-[10px] font-bold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                            Me
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs text-right tabular-nums ${
                          isMe ? "font-bold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {formatVolume(item.volume)}
                      </span>
                      <span
                        className={`text-xs text-right font-semibold ${
                          isMe ? "text-accent" : "text-foreground"
                        }`}
                      >
                        ₦{formatVolume(item.reward)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}
