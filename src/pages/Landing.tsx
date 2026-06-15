import Logo from "@/components/Logo";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, HeadphonesIcon, TrendingUp, Gift, Trophy, Calculator, Star, ArrowRight, CheckCircle2, Smartphone, Twitter, Instagram, Facebook, Linkedin, Youtube, Quote, Users, Target, Sparkles } from "lucide-react";

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

const values = [
  { icon: Users, title: "Community First", desc: "Built around a thriving community of Nigerian traders who set the bar for service." },
  { icon: Target, title: "Transparent Rates", desc: "Live rates updated every 60 seconds — no surprises, no hidden cuts." },
  { icon: Sparkles, title: "Built for Speed", desc: "Average payout time under 5 minutes, even at peak trading hours." },
];

const testimonials = [
  { name: "Chinedu O.", role: "Lagos · Verified Trader", quote: "Best rates I've found and the agents reply within seconds. I've been trading on CardChat for two years and never had an issue." },
  { name: "Aisha B.", role: "Abuja · Premium Member", quote: "The wallet system is a game changer. I cash out to my bank instantly whenever I need to. Couldn't ask for more." },
  { name: "Tunde A.", role: "Port Harcourt · Top Ranker", quote: "Customer support is unreal. 3am, 3pm — there's always someone on the other end ready to help. Real humans, not bots." },
];

const socials = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/landing" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="font-heading font-bold text-lg">CardChat</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
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

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest text-accent uppercase">About Us</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3">A safer way to trade gift cards in Nigeria</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              CardChat was founded in 2019 by a small team of traders who were tired of slow payouts, unfair rates, and shady middlemen. We set out to build the platform we wished existed — one where every trade is fast, fair, and protected.
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Today, we serve over 50,000 active traders across Nigeria with verified agents, live rates, and a wallet system that pays you the moment your card is confirmed.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div>
                <p className="font-heading text-2xl font-bold text-accent">$50M+</p>
                <p className="text-[11px] text-muted-foreground">Traded since 2019</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-accent">50K+</p>
                <p className="text-[11px] text-muted-foreground">Active traders</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-accent">4.9★</p>
                <p className="text-[11px] text-muted-foreground">User rating</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {values.map((v) => (
              <div key={v.title} className="bg-card border border-border/50 rounded-2xl p-5 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <v.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
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

      {/* Testimonials */}
      <section id="testimonials" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">Testimonials</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3">Loved by traders across Nigeria</h2>
          <p className="text-muted-foreground mt-3">Don't take our word for it — hear from people trading with us every day.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <article key={t.name} className="bg-card border border-border/50 rounded-2xl p-6">
              <Quote className="w-6 h-6 text-accent/40 mb-3" />
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-sm text-accent">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
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
      <footer className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <Logo className="w-9 h-9" />
                <span className="font-heading font-bold text-lg">CardChat</span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 max-w-sm">
                Nigeria's most trusted gift card exchange. Built for speed, security, and the best rates.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/delete-account" className="hover:text-foreground transition-colors">Delete Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} CardChat. All rights reserved.</span>
            <span>Secure gift card trading · Made for Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
