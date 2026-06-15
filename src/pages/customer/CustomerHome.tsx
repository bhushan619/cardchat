import Logo from "@/components/Logo";
import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { cardRates, walletBalance, tradingBalance, rewardsBalance } from "@/data/mock";
import { Search, Gift, Trophy, Calculator, Star, ArrowRight, X, Eye, EyeOff, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Unique card types and currencies from rates data
const uniqueCardTypes = [...new Set(cardRates.map(r => r.cardType))];
const uniqueCurrencies = [...new Set(cardRates.map(r => r.currency))];
const denominations = [25, 50, 100, 200, 500];

export default function CustomerHome() {
  const [cardTypeSearch, setCardTypeSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcCardType, setCalcCardType] = useState("");
  const [calcCurrency, setCalcCurrency] = useState("");
  const [calcDenom, setCalcDenom] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(false);

  // Filter rates by both searches
  const filteredRates = cardRates.filter(r => {
    const matchCard = !cardTypeSearch || r.cardType.toLowerCase().includes(cardTypeSearch.toLowerCase());
    const matchCurrency = !currencySearch || r.currency.toLowerCase().includes(currencySearch.toLowerCase());
    return matchCard && matchCurrency;
  });

  // Calculator logic
  const calcRate = cardRates.find(
    r => r.cardType === calcCardType && r.currency === calcCurrency
  );
  const calcResult = calcRate && calcDenom ? Number(calcDenom) * calcRate.buyRate : null;

  const coreActions = [
    { icon: Gift, label: "Sell Cards", desc: "Best rates", onClick: () => navigate("/customer/contacts") },
    { icon: Star, label: "Rewards", desc: "Earn more", onClick: () => navigate("/customer/rewards") },
    { icon: Trophy, label: "Ranking", desc: "Leaderboard", onClick: () => navigate("/customer/ranking") },
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
          {coreActions.map(a => (
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

        {/* Wallet Section */}
        <div className="bg-gradient-to-br from-accent to-accent/80 rounded-2xl p-4 text-accent-foreground">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 opacity-70" />
              <p className="text-xs opacity-80">Wallet Balance</p>
            </div>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="opacity-70 hover:opacity-100 transition-opacity">
              {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-2xl font-heading font-bold">
            {balanceVisible ? `₦${walletBalance.toLocaleString()}` : "₦ ••••••"}
          </p>
          {balanceVisible && (
            <p className="text-[11px] opacity-80 mt-0.5">
              ({tradingBalance.toLocaleString()} Trading + {rewardsBalance.toLocaleString()} Rewards)
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate("/customer/me", { state: { openWallet: true } })}
              className="text-[11px] bg-accent-foreground/20 hover:bg-accent-foreground/30 text-accent-foreground px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              View Details
            </button>
          </div>
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
                onChange={e => setCardTypeSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Currency"
                className="pl-8 bg-muted border-0 text-xs h-9"
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredRates.slice(0, 5).map(rate => (
              <div key={rate.id} className="bg-card border border-border/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">{rate.cardType}</p>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">
                      {rate.cardFormat}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{rate.currency} · {rate.lastUpdated}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">₦{rate.buyRate}</p>
                  <p className="text-[9px] text-muted-foreground">per $1</p>
                </div>
              </div>
            ))}
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowCalculator(false)}>
            <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-lg">Rate Calculator</h3>
                <button onClick={() => setShowCalculator(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Card Type</label>
                <Select value={calcCardType} onValueChange={v => { setCalcCardType(v); setCalcCurrency(""); setCalcDenom(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select card type" /></SelectTrigger>
                  <SelectContent>
                    {uniqueCardTypes.map(ct => (
                      <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Currency</label>
                <Select value={calcCurrency} onValueChange={v => { setCalcCurrency(v); setCalcDenom(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select currency" /></SelectTrigger>
                  <SelectContent>
                    {uniqueCurrencies.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Denomination ($)</label>
                <Select value={calcDenom} onValueChange={setCalcDenom}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select denomination" /></SelectTrigger>
                  <SelectContent>
                    {denominations.map(d => (
                      <SelectItem key={d} value={String(d)}>${d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Result */}
              <div className={`rounded-xl p-4 text-center transition-all ${calcResult ? "bg-accent/10 border border-accent/30" : "bg-muted/50"}`}>
                {calcResult ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">You will receive</p>
                    <p className="text-3xl font-heading font-bold text-accent">₦{calcResult.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Rate: ₦{calcRate?.buyRate}/{calcCurrency === "GBP" ? "£" : "$"}1 · ${calcDenom} face value
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Fill in the fields above to see your estimated payout</p>
                )}
              </div>

              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => { setShowCalculator(false); navigate("/customer/contacts"); }}
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
