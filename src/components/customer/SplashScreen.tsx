import { useState, useEffect } from "react";
import { Shield, Zap, HeadphonesIcon, TrendingUp } from "lucide-react";

const features = [
  { icon: Shield, label: "Bank-Grade Security", delay: 800 },
  { icon: Zap, label: "Instant Settlements", delay: 1400 },
  { icon: HeadphonesIcon, label: "24/7 Live Support", delay: 2000 },
  { icon: TrendingUp, label: "$50M+ Traded Since 2019", delay: 2600 },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=features, 2=fadeout

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 4200);
    const t3 = setTimeout(onComplete, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 2 ? "opacity-0" : "opacity-100"}`}>
      {/* Ambient glow */}
      <div className="absolute w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse" />

      {/* Logo */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${phase >= 1 ? "-translate-y-6" : "translate-y-0"}`}>
        <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-4 shadow-lg shadow-accent/20 animate-[scale-in_0.6s_ease-out]">
          <span className="text-accent-foreground font-heading font-bold text-2xl">LC</span>
        </div>
        <h1 className="font-heading text-3xl font-bold animate-[fade-in_0.5s_ease-out_0.3s_both]">LightChat</h1>
        <p className="text-sm text-muted-foreground mt-1 animate-[fade-in_0.5s_ease-out_0.5s_both]">Trusted Gift Card Exchange</p>
      </div>

      {/* Feature pills */}
      {phase >= 1 && (
        <div className="relative z-10 mt-10 flex flex-col gap-3 items-center">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 bg-card/80 backdrop-blur border border-border/50 rounded-full px-4 py-2 animate-[fade-in_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 300}ms` }}
            >
              <f.icon className="w-4 h-4 text-accent shrink-0" />
              <span className="text-xs font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
