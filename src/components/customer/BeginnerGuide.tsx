import { useState, useEffect } from "react";

const steps = [
  {
    tabId: "home",
    path: "/customer",
    title: "This is Home",
    desc: "You can check live gift card rates, start a trade, and access quick actions all from here.",
  },
  {
    tabId: "contacts",
    path: "/customer/contacts",
    title: "This is Contacts",
    desc: "You can browse verified agents, see who's online, and start a new conversation to begin trading.",
  },
  {
    tabId: "chat",
    path: "/customer/chat",
    title: "This is Chat",
    desc: "You can view all your conversations, send card photos, and track your orders in real time.",
  },
];

export { steps as guideSteps };

interface BeginnerGuideProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

export default function BeginnerGuide({ step, onNext, onSkip }: BeginnerGuideProps) {
  const [tooltipBottom, setTooltipBottom] = useState(80);
  const [navHeight, setNavHeight] = useState(72);
  const current = steps[step] || steps[0];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      const nav = document.querySelector("nav");
      if (nav) {
        const navRect = nav.getBoundingClientRect();
        setNavHeight(navRect.height);
        setTooltipBottom(navRect.height + 12);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-40 bg-foreground/15 pointer-events-none"
        style={{ bottom: `${navHeight}px` }}
      />

      <HighlightTab tabId={current.tabId} />

      <div
        className="fixed left-3 right-3 z-[70] pointer-events-auto"
        style={{
          bottom: `${Math.max(tooltipBottom, navHeight + 10)}px`,
          maxWidth: "320px",
          margin: "0 auto",
        }}
      >
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg space-y-2.5">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= step ? "w-6 bg-accent" : "w-3 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold">{current.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{current.desc}</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onSkip}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onNext}
              className="text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              {isLast ? "Got it!" : "Next →"}
            </button>
          </div>
        </div>

        <div className="flex justify-center -mt-[1px]">
          <div className="w-3 h-3 bg-card border-b border-r border-border rotate-45 -translate-y-1.5" />
        </div>
      </div>
    </>
  );
}

function HighlightTab({ tabId }: { tabId: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const tabLabels = ["home", "chat", "contacts", "me"];
      const targetIndex = tabLabels.indexOf(tabId);
      const allTabs = document.querySelectorAll<HTMLButtonElement>(".tab-bar-item");
      const tabEl = allTabs[targetIndex];
      if (tabEl) {
        setRect(tabEl.getBoundingClientRect());
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [tabId]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-[55] rounded-xl border-2 border-accent bg-transparent pointer-events-none shadow-[0_0_16px_hsl(var(--accent)/0.45)]"
      style={{
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  );
}
