import { useState } from "react";
import { Shield, Zap, HeadphonesIcon, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    desc: "Your cards and funds are protected with end-to-end encryption and verified agents. Every transaction is audited.",
    accent: "bg-accent/15 text-accent",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Settlements",
    desc: "Average payout in under 5 minutes. Real-time order tracking from card submission to bank transfer.",
    accent: "bg-warning/15 text-warning",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    desc: "Live chat with verified agents 24/7. No bots, no delays — real people who know the market.",
    accent: "bg-primary/15 text-primary",
  },
  {
    icon: TrendingUp,
    title: "$50M+ Traded",
    desc: "Trusted by thousands of users since 2019. Over 200,000 successful transactions and counting.",
    accent: "bg-success/15 text-success",
  },
];

export default function OnboardingSlides({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const SlideIcon = slide.icon;
  const isLast = current === slides.length - 1;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button onClick={onComplete} className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all">
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-20 h-20 rounded-2xl ${slide.accent} flex items-center justify-center mb-8 animate-[scale-in_0.3s_ease-out]`} key={current}>
          <SlideIcon className="w-9 h-9" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-3 animate-[fade-in_0.3s_ease-out]" key={`t-${current}`}>
          {slide.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs animate-[fade-in_0.3s_ease-out_0.1s_both]" key={`d-${current}`}>
          {slide.desc}
        </p>
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
          onClick={() => isLast ? onComplete() : setCurrent(c => c + 1)}
        >
          {isLast ? "Get Started" : "Next"}
          {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
