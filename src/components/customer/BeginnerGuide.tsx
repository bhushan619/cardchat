import { useState } from "react";
import { Search, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Connect with an Agent",
    desc: "Browse verified agents on the Contacts page. Look for the ✓ badge — it means they're platform-verified.",
  },
  {
    icon: MessageCircle,
    title: "Start a Chat",
    desc: "Tap on a provider to open a secure chat. Share your card details and get a real-time rate quote.",
  },
  {
    icon: Send,
    title: "Complete Your Trade",
    desc: "Submit your card, track the order live, and receive your payout directly to your bank account.",
  },
];

export default function BeginnerGuide({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const StepIcon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-md bg-card rounded-t-2xl p-6 space-y-5 animate-[slide-up_0.3s_ease-out]">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? "w-8 bg-accent" : "w-4 bg-muted-foreground/20"}`} />
            ))}
          </div>
          <button onClick={onComplete} className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all">
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="text-center space-y-3" key={step}>
          <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center mx-auto animate-[scale-in_0.3s_ease-out]">
            <StepIcon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Step {step + 1} of {steps.length}</p>
            <h3 className="font-heading text-lg font-bold">{current.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
        </div>

        {/* Action */}
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 active:scale-[0.97] transition-transform"
          onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
