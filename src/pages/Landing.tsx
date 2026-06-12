import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, HeadphonesIcon, TrendingUp, Gift, Trophy, Calculator, Star, ArrowRight, CheckCircle2, Smartphone } from "lucide-react";

const features = [
  { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption, PIN-protected withdrawals, and verified agents on every trade." },
  { icon: Zap, title: "Instant Settlements", desc: "Get paid in Naira to your wallet within minutes of card verification." },
  { icon: HeadphonesIcon, title: "24/7 Live Support", desc: "Real humans on chat around the clock — never wait for help." },
  { icon: TrendingUp, title: "$50M+ Traded", desc: "Trusted by thousands of traders since 2019 with industry-best rates." },
];

const steps = [
  { n: "01", title: "Pick a card", desc: "Browse live rates for Amazon, iTunes, Steam, Google Play and more." },
  { n: "02", title: "Chat with an agent", desc: "Connect with a verified trader. Share your card details securely." },
  { n: "03", title: "Get paid instantly", desc: "Naira hits your wallet the moment your card is confirmed." },
];

const perks = [
  { icon: Gift, label: "Best Rates" },
  { icon: Star, label: "Rewards Program" },
  { icon: Trophy, label: "Trader Rankings" },
  { icon: Calculator, label: "Rate Calculator" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-sm">CC</span>
            </div>
            <span className="font-heading font-bold text-lg">CardChat</span>
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
            onClick={() => navigate("/customer/auth")}
          >
            Open App <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-border/50 rounded-full px-3 py-1 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium">Trusted by 50,000+ traders</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Trade gift cards at the <span className="text-accent">best rates</span> in Nigeria
          </h1>
          <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
            CardChat is the secure marketplace where verified agents pay you Naira for your gift cards — instantly, transparently, and around the clock.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 px-6"
              onClick={() => navigate("/customer/auth")}
            >
              <Smartphone className="w-5 h-5" /> Start Trading
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => navigate("/customer/auth")}>
              View Live Rates
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> No hidden fees</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Verified agents</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> Instant Naira payouts</span>
          </div>
        </div>
      </header>

      {/* Perks bar */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {perks.map((p) => (
            <div key={p.label} className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-sm">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Why traders choose CardChat</h2>
          <p className="text-muted-foreground mt-3">Built for speed, security, and the best rates you'll find anywhere.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f) => (
            <article key={f.title} className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-3">Three simple steps from gift card to cash.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s) => (
              <div key={s.n} className="bg-background border border-border/50 rounded-2xl p-6">
                <span className="text-accent font-heading font-bold text-2xl">{s.n}</span>
                <h3 className="font-heading font-semibold text-lg mt-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">Ready to trade?</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Join thousands getting the best Naira rates on their gift cards every day.
        </p>
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12 px-6 mt-6"
          onClick={() => navigate("/customer/auth")}
        >
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-heading font-bold text-[10px]">CC</span>
            </div>
            <span>© {new Date().getFullYear()} CardChat. All rights reserved.</span>
          </div>
          <span>Secure gift card trading · Made for Nigeria</span>
        </div>
      </footer>
    </div>
  );
}
