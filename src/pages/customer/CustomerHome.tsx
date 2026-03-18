import CustomerLayout from "@/components/customer/CustomerLayout";
import { cardRates, promoBanners } from "@/data/mock";
import { Search, ArrowRight, Gift, TrendingUp, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CustomerHome() {
  const [search, setSearch] = useState("");
  const filteredRates = cardRates.filter(r => r.cardType.toLowerCase().includes(search.toLowerCase()));

  return (
    <CustomerLayout>
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold">LightChat</h1>
            <p className="text-xs text-muted-foreground">Buy & Sell Gift Cards</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Star className="w-4 h-4 text-warning" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cards, rates..."
            className="pl-10 bg-muted border-0"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Promo Banners */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {promoBanners.map(b => (
            <div
              key={b.id}
              className={`shrink-0 w-64 rounded-xl p-4 ${
                b.color === "accent" ? "bg-accent text-accent-foreground" :
                b.color === "primary" ? "bg-primary text-primary-foreground" :
                "bg-warning text-warning-foreground"
              }`}
            >
              <h3 className="font-heading font-bold text-base">{b.title}</h3>
              <p className="text-sm opacity-90 mt-1">{b.subtitle}</p>
              <button className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80 hover:opacity-100">
                Learn more <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Services */}
        <div>
          <h2 className="font-heading font-semibold text-sm mb-3">Services</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Gift, label: "Sell Cards", desc: "Best rates" },
              { icon: TrendingUp, label: "Live Rates", desc: "Real-time" },
              { icon: Star, label: "Rewards", desc: "Coming soon" },
            ].map(s => (
              <div key={s.label} className="bg-card border rounded-xl p-3 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                  <s.icon className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xs font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Card Prices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-sm">Live Card Prices</h2>
            <span className="text-[10px] text-muted-foreground">Auto-refreshes every 60s</span>
          </div>
          <div className="space-y-2">
            {filteredRates.map(rate => (
              <div key={rate.id} className="bg-card border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{rate.cardType}</p>
                  <p className="text-xs text-muted-foreground">{rate.currency} · {rate.lastUpdated}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">₦{rate.buyRate}</p>
                  <p className="text-[10px] text-muted-foreground">per $1</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite CTA */}
        <div className="bg-primary rounded-xl p-4 text-primary-foreground">
          <h3 className="font-heading font-bold">Invite Friends</h3>
          <p className="text-sm opacity-80 mt-1">Get ₦500 for every friend who registers</p>
          <button className="mt-3 bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg">
            Share Invite Code
          </button>
        </div>
      </div>
    </CustomerLayout>
  );
}
