import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Headset,
  Zap,
  ChevronRight,
  Star,
  CreditCard,
  BadgeCheck,
  Clock,
  ArrowRight,
  Send,
  Handshake,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

/* ---------- Screen 1: Brand Credibility ---------- */
const CredibilityVisual = () => (
  <div className="w-full max-w-xs space-y-5">
    <div className="flex justify-center">
      <Logo className="w-20 h-20 animate-[scale-in_0.3s_ease-out]" />
    </div>
    <div className="flex justify-center gap-2 flex-wrap">
      {["Since 2019", "$50M+ Traded", "200,000+ Successful Transactions"].map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-[11px] font-semibold"
        >
          <BadgeCheck className="w-3.5 h-3.5" /> {b}
        </span>
      ))}
    </div>
    <div className="rounded-xl border bg-card p-4 text-left">
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
        ))}
      </div>
      <p className="text-xs leading-relaxed text-foreground">
        "CardChat changed how I sell my gift cards. Fast payment, real support, and I've never had
        an issue in two years of trading."
      </p>
      <p className="mt-2 text-[10px] text-muted-foreground">— Verified customer review, Google Play</p>
    </div>
  </div>
);

/* ---------- Screen 2: Security ---------- */
const SecurityVisual = () => (
  <div className="w-full max-w-xs space-y-5">
    <div className="flex items-center justify-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <CreditCard className="w-7 h-7 text-foreground" />
      </div>
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-accent/15 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
          <ShieldCheck className="w-9 h-9 text-accent" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-background border flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-accent" />
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center gap-1.5">
      {["Submitted", "Secured", "Completed"].map((step, i) => (
        <div key={step} className="flex items-center gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              i === 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {step}
          </span>
          {i < 2 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
        </div>
      ))}
    </div>
  </div>
);

/* ---------- Screen 3: Human Support ---------- */
const SupportVisual = () => (
  <div className="w-full max-w-xs space-y-5">
    <div className="flex items-center justify-center gap-3">
      <div className="w-20 h-20 rounded-2xl bg-accent/15 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
        <Headset className="w-9 h-9 text-accent" />
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
        <Clock className="w-3.5 h-3.5" /> 24/7
      </span>
    </div>
    <p className="text-sm font-medium text-foreground">Chat with a real person, anytime.</p>
  </div>
);

/* ---------- Screen 4: Fast Transactions ---------- */
const FastVisual = () => (
  <div className="w-full max-w-xs space-y-5">
    <div className="flex justify-center">
      <div className="w-20 h-20 rounded-2xl bg-warning/15 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
        <Zap className="w-9 h-9 text-warning" />
      </div>
    </div>
    <div className="space-y-2">
      {[
        { icon: Send, label: "Submit Your Card" },
        { icon: Handshake, label: "Confirm Your Trade" },
        { icon: Banknote, label: "Receive Payment" },
      ].map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent text-[11px] font-bold">
            {i + 1}
          </span>
          <s.icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const slides = [
  {
    title: "Trusted by Tens of Thousands. Ready for You.",
    desc: "Join tens of thousands of users buying into a better way to sell gift cards with CardChat.",
    Visual: CredibilityVisual,
    labels: [],
  },
  {
    title: "Secure Transactions. Complete Visibility.",
    desc: "Track your transaction from start to finish, with your information protected by strict encryption throughout the process.",
    Visual: SecurityVisual,
    labels: ["Encrypted Information", "Real-Time Tracking"],
  },
  {
    title: "Real People. One Tap Away. 24/7.",
    desc: "Get help whenever you need it. Chat directly with our support team, day or night—from signing up to completing your trade.",
    Visual: SupportVisual,
    labels: ["24/7 Human Support", "One-Tap Chat"],
  },
  {
    title: "Sell with Ease. Get Paid Fast.",
    desc: "Turn your gift cards into cash in a few simple steps, with fast payment straight to your bank account.",
    Visual: FastVisual,
    labels: ["Simple Process", "Fast Payment"],
  },
];

export default function OnboardingSlides({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background border-x">
      {/* Skip — available on all four screens */}
      <div className="flex justify-end p-4">
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6 overflow-y-auto py-2">
        <slide.Visual key={`v-${current}`} />
        <div>
          <h2 className="font-heading text-2xl font-bold mb-3 animate-[fade-in_0.3s_ease-out]" key={`t-${current}`}>
            {slide.title}
          </h2>
          <p
            className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto animate-[fade-in_0.3s_ease-out_0.1s_both]"
            key={`d-${current}`}
          >
            {slide.desc}
          </p>
          {slide.labels.length > 0 && (
            <div className="mt-4 flex justify-center gap-2 flex-wrap" key={`l-${current}`}>
              {slide.labels.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-accent/30 text-accent px-3 py-1 text-[10px] font-semibold"
                >
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dots + Button */}
      <div className="px-8 pb-10 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base active:scale-[0.97] transition-transform"
          onClick={() => (isLast ? onComplete() : setCurrent((c) => c + 1))}
        >
          {isLast ? "Get Started" : "Next"}
          {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
