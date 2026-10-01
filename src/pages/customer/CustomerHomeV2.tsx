import Logo from "@/components/Logo";
import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import {
  cardRates,
  expandDenominations,
} from "@/data/mock";
import {
  Search,
  Gift,
  Trophy,
  Calculator,
  Star,
  ArrowRight,
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  Crown,
  Flame,
} from "lucide-react";
import { isVip, CURRENT_CUSTOMER_ALIAS } from "@/lib/vipCustomers";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  currentUserAlias,
  getNextTier,
  getRankedUsers,
  getCurrentBiWeeklyPeriod,
} from "@/data/rankingMock";

// Unique card types and currencies from rates data
const uniqueCardTypes = [...new Set(cardRates.map((r) => r.cardType))];
const uniqueCurrencies = [...new Set(cardRates.map((r) => r.currency))];

export default function CustomerHomeV2() {
  const [cardTypeSearch, setCardTypeSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcCardType, setCalcCardType] = useState("");
  const [calcCurrency, setCalcCurrency] = useState("");
  const [calcDenom, setCalcDenom] = useState("");
  const [calcFormat, setCalcFormat] = useState<"Physical" | "E-Code">("E-Code");
  const [expandedRemarks, setExpandedRemarks] = useState<Set<number>>(new Set());
  const isVipCustomer = isVip(CURRENT_CUSTOMER_ALIAS);

  // Ranking data (live scenario — same source as the Ranking page)
  const period = getCurrentBiWeeklyPeriod(new Date(2026, 2, 10)); // Mock: March 2026
  const ranked = getRankedUsers();
  const me = ranked.find((u) => u.alias === currentUserAlias);
  const myVolume = me?.volume ?? 0;
  const myReward = me?.reward ?? 0;
  const nextTier = getNextTier(myVolume);
  const remaining = nextTier ? nextTier.threshold - myVolume : 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.round((myVolume / nextTier.threshold) * 100))
    : 100;

  const toggleRemark = (id: number) => {
    const next = new Set(expandedRemarks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRemarks(next);
  };

  // Filter rates by both searches
  const filteredRates = cardRates.filter((r) => {
    const matchCard = !cardTypeSearch || r.cardType.toLowerCase().includes(cardTypeSearch.toLowerCase());
    const matchCurrency = !currencySearch || r.currency.toLowerCase().includes(currencySearch.toLowerCase());
    return matchCard && matchCurrency;
  });

  // Calculator logic
  const calcRate = cardRates.find(
    (r) => r.cardType === calcCardType && r.currency === calcCurrency && r.cardFormat === calcFormat,
  );
  const calcResult = calcRate && calcDenom ? Number(calcDenom) * (isVipCustomer ? calcRate.vipBuyRate : calcRate.buyRate) : null;
  const calcDenominations = calcRate ? expandDenominations(calcRate.denominationSpec) : [];

  const coreActions = [
    { icon: Gift, label: "Sell Cards", desc: "Best rates", onClick: () => navigate("/customer/contacts") },
    { icon: Star, label: "Rewards", desc: "Earn more", onClick: () => navigate("/customer/rewards") },
    { icon: Wallet, label: "Wallet", desc: "Balance", onClick: () => navigate("/customer/me", { state: { openWallet: true } }) },
    { icon: Calculator, label: "Calculator", desc: "Rate calc", onClick: () => setShowCalculator(true) },
  ];

  return (
    <CustomerLayout>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Logo className="w-11 h-11 shrink-0" />
          <div className="flex-1">
            <h1 className="font-heading text-lg font-bold">CardChat</h1>
            <p className="text-[10px] text-muted-foreground">Your trusted gift card trading platform</p>
          </div>
        </div>

        {/* Core Actions — iOS Modular Grid */}
        <div className="grid grid-cols-4 gap-3">
          {coreActions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="bg-card border border-border/50 rounded-2xl p-3 text-center space-y-2 hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
                <a.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-medium">{a.label}</p>
                <p className="text-[9px] text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Trading Volume Ranking — compact hero */}
        <div className="bg-accent rounded-2xl p-4 text-accent-foreground space-y-3.5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-accent-foreground/20 p-1.5 rounded-lg">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="font-heading text-[13px] font-semibold tracking-tight">Trading Volume Ranking</span>
            </div>
            <span className="text-[10px] font-medium bg-accent-foreground/15 px-2 py-0.5 rounded-full whitespace-nowrap">
              {period.label}
            </span>
          </div>

          {me ? (
            <>
              {/* Stats row */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-heading text-4xl font-bold tracking-tight leading-none">Rank #{me.rank}</h2>
                  <p className="text-xs opacity-90 mt-1 tabular-nums">₦{myVolume.toLocaleString()} traded</p>
                </div>
                <div className="text-right">
                  <div className="font-heading text-xl font-bold tabular-nums leading-none">₦{myReward.toLocaleString()}</div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mt-1">Current reward</p>
                </div>
              </div>

              {/* Compact progress */}
              {nextTier ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="opacity-90">Progress to next tier</span>
                    <span className="tabular-nums">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-accent-foreground/25 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-foreground rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] gap-2">
                    <span className="flex items-center gap-1 opacity-90 min-w-0">
                      <Flame className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Trade ₦{remaining.toLocaleString()} more for ₦{nextTier.reward.toLocaleString()} reward
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums whitespace-nowrap">
                      ₦{nextTier.threshold.toLocaleString()} goal
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] font-medium bg-accent-foreground/15 rounded-xl p-2.5 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  You've unlocked the highest reward tier — keep trading to hold your rank!
                </p>
              )}

              {/* Actions — one primary + text link */}
              <div className="flex items-center gap-3 pt-0.5">
                <button
                  onClick={() => navigate("/customer/contacts")}
                  className="flex-1 bg-accent-foreground text-accent font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
                >
                  Trade Now
                </button>
                <button
                  onClick={() => navigate("/customer/ranking")}
                  className="flex-none flex items-center gap-1 text-sm font-semibold px-1 active:scale-95 transition-transform"
                >
                  Leaderboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-heading text-xl font-bold">You're not ranked yet</p>
              <p className="text-xs opacity-90 leading-relaxed -mt-1.5">
                Make your first trade this period to enter the leaderboard and start earning ranking rewards.
              </p>
              <div className="flex items-center gap-3 pt-0.5">
                <button
                  onClick={() => navigate("/customer/contacts")}
                  className="flex-1 bg-accent-foreground text-accent font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
                >
                  Trade Now
                </button>
                <button
                  onClick={() => navigate("/customer/ranking")}
                  className="flex-none flex items-center gap-1 text-sm font-semibold px-1 active:scale-95 transition-transform"
                >
                  Leaderboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search Filters + Live Rates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-sm">Live Rates</h2>
            <span className="text-[10px] text-muted-foreground">Auto-refresh 60s</span>
          </div>

          {/* Dual Search */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Card Type"
                className="pl-8 bg-muted border-0 text-xs h-9"
                value={cardTypeSearch}
                onChange={(e) => setCardTypeSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Currency"
                className="pl-8 bg-muted border-0 text-xs h-9"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredRates.slice(0, 5).map((rate) => {
              return (
                <div
                  key={rate.id}
                  className="bg-card border border-border/50 rounded-xl p-3 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium truncate">{rate.cardType}</p>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                          {rate.cardFormat}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {rate.currency} · {rate.lastUpdated}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const spec = rate.denominationSpec;
                          if (spec.kind === "list") {
                            return (
                              <p className="text-[10px] text-muted-foreground tabular-nums">
                                {spec.values.map((d) => `${d}`).join(", ")}
                              </p>
                            );
                          }
                          if (spec.kind === "range") {
                            return (
                              <p className="text-[10px] text-muted-foreground tabular-nums">
                                {spec.min} –{spec.max}
                              </p>
                            );
                          }
                          if (spec.kind === "multiples") {
                            return (
                              <p className="text-[10px] text-muted-foreground tabular-nums">
                                {" "}
                                {spec.min ?? spec.of}
                                {spec.max ? `– ${spec.max}` : "+"}
                              </p>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground italic">
                              Any denomination
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        {isVipCustomer && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-amber-950">
                            <Crown className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                        <p className="text-sm font-semibold text-accent tabular-nums">
                          ₦{isVipCustomer ? rate.vipBuyRate : rate.buyRate}
                        </p>
                      </div>
                      {isVipCustomer && (
                        <p className="text-[9px] text-muted-foreground line-through tabular-nums">₦{rate.buyRate}</p>
                      )}

                      {(() => {
                        // Deterministic pseudo-change per rate id: range -1.5% .. +1.5%
                        const seed = (rate.id * 9301 + 49297) % 233280;
                        const pct = (seed / 233280) * 3 - 1.5;
                        const up = pct >= 0;
                        const Icon = up ? TrendingUp : TrendingDown;
                        return (
                          <div
                            className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium ${up ? "text-success" : "text-destructive"}`}
                          >
                            <span className="tabular-nums">
                              {up ? "+" : ""}
                              {pct.toFixed(1)}%
                            </span>
                            <span
                              className={`inline-flex items-center justify-center w-4 h-4 rounded ${up ? "bg-success/15" : "bg-destructive/15"}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {rate.remarks && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p
                        className={`text-[10px] text-muted-foreground leading-relaxed ${
                          expandedRemarks.has(rate.id) ? "" : "line-clamp-2"
                        }`}
                      >
                        <span className="font-medium text-foreground/70">Note:</span> {rate.remarks}
                      </p>
                      {rate.remarks.length > 90 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRemark(rate.id);
                          }}
                          className="text-[10px] text-accent font-medium mt-1"
                        >
                          {expandedRemarks.has(rate.id) ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredRates.length > 5 && (
            <button className="w-full mt-2 text-xs text-accent font-medium flex items-center justify-center gap-1 py-2">
              View all rates <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {filteredRates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No rates match your search</p>
          )}
        </div>

        {/* Rate Calculator Floating Modal */}
        {showCalculator && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => setShowCalculator(false)}
          >
            <div
              className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg">Rate Calculator</h3>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Card Type</label>
                <Select
                  value={calcCardType}
                  onValueChange={(v) => {
                    setCalcCardType(v);
                    setCalcCurrency("");
                    setCalcDenom("");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCardTypes.map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {ct}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Card Format</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(["Physical", "E-Code"] as const).map((f) => (
                    <label
                      key={f}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                        calcFormat === f ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="calc-card-format"
                        value={f}
                        checked={calcFormat === f}
                        onChange={() => setCalcFormat(f)}
                        className="accent-accent"
                      />
                      <span className="text-sm font-medium">{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Currency</label>
                <Select
                  value={calcCurrency}
                  onValueChange={(v) => {
                    setCalcCurrency(v);
                    setCalcDenom("");
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCurrencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Denomination</label>
                <Select value={calcDenom} onValueChange={setCalcDenom}>
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={calcRate ? "Select denomination" : "Select card type, format & currency first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {calcDenominations.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        ${d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Result */}
              <div
                className={`rounded-xl p-4 text-center transition-all ${calcResult ? "bg-accent/10 border border-accent/30" : "bg-muted/50"}`}
              >
                {calcResult ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">You will receive</p>
                    <p className="text-3xl font-heading font-bold text-accent">₦{calcResult.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Fill in the fields above to see your estimated payout</p>
                )}
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  setShowCalculator(false);
                  navigate("/customer/contacts");
                }}
              >
                Start Trading
              </Button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
