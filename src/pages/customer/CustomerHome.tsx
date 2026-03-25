import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import { cardRates } from "@/data/mock";
import { Search, Gift, TrendingUp, MessageCircle, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function CustomerHome() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filteredRates = cardRates.filter(r => r.cardType.toLowerCase().includes(search.toLowerCase()));

  const coreActions = [
    { icon: Gift, label: "Sell Cards", desc: "Best rates", onClick: () => navigate("/customer/chat") },
    { icon: TrendingUp, label: "Live Rates", desc: "Real-time", onClick: () => {} },
    { icon: MessageCircle, label: "Chat", desc: "Support", onClick: () => navigate("/customer/chat") },
    { icon: BookOpen, label: "Guide", desc: "How-to", onClick: () => navigate("/customer/guide") },
  ];

  return (
    <CustomerLayout>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <span className="text-accent-foreground font-heading font-bold text-lg">LC</span>
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-lg font-bold">LightChat</h1>
            <p className="text-[10px] text-muted-foreground">Your trusted gift card trading platform</p>
          </div>
        </div>

        {/* Search */}
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cards, rates..."
              className="pl-10 bg-muted border-0"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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

            {/* Live Card Prices */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-semibold text-sm">Live Rates</h2>
                <span className="text-[10px] text-muted-foreground">Auto-refresh 60s</span>
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
            </div>

            {/* Quick Start CTA */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-center">
              <p className="text-sm font-heading font-bold mb-1">Ready to trade?</p>
              <p className="text-xs text-muted-foreground mb-3">Chat with a verified agent to sell your gift cards</p>
              <button
                onClick={() => navigate("/customer/chat")}
                className="bg-accent text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-xl"
              >
                Start Trading
              </button>
            </div>
          </>

      </div>

    </CustomerLayout>
  );
}
