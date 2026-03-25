import { useState, useEffect } from "react";

const steps = [
  {
    tabId: "home",
    title: "This is Home",
    desc: "You can check live gift card rates, start a trade, and access quick actions all from here.",
  },
  {
    tabId: "contacts",
    title: "This is Contacts",
    desc: "You can browse verified agents, see who's online, and start a new conversation to begin trading.",
  },
  {
    tabId: "chat",
    title: "This is Chat",
    desc: "You can view all your conversations, send card photos, and track your orders in real time.",
  },
];

export default function BeginnerGuide({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; bottom: number } | null>(null);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    // Find the tab button in the bottom nav
    const allTabs = document.querySelectorAll<HTMLButtonElement>(".tab-bar-item");
    const tabLabels = ["home", "chat", "contacts", "me"];
    const targetIndex = tabLabels.indexOf(current.tabId);
    const tabEl = allTabs[targetIndex];

    if (tabEl) {
      const rect = tabEl.getBoundingClientRect();
      const parentRect = tabEl.closest("nav")?.getBoundingClientRect();
      const navHeight = parentRect ? parentRect.height : 56;
      setTooltipPos({
        left: rect.left + rect.width / 2,
        bottom: navHeight + 12,
      });
    }
  }, [step, current.tabId]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px]" />

      {/* Highlight the active tab */}
      <HighlightTab tabId={current.tabId} />

      {/* Floating tooltip */}
      {tooltipPos && (
        <div
          className="absolute z-[60] w-72 animate-[scale-in_0.2s_ease-out]"
          style={{
            left: `${tooltipPos.left}px`,
            bottom: `${tooltipPos.bottom}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-card border border-border rounded-xl p-4 shadow-lg space-y-2.5">
            {/* Step indicator */}
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
                onClick={onComplete}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => (isLast ? onComplete() : setStep((s) => s + 1))}
                className="text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                {isLast ? "Got it!" : "Next →"}
              </button>
            </div>
          </div>

          {/* Arrow pointing down to the tab */}
          <div className="flex justify-center -mt-[1px]">
            <div className="w-3 h-3 bg-card border-b border-r border-border rotate-45 -translate-y-1.5" />
          </div>
        </div>
      )}
    </div>
  );
}

function HighlightTab({ tabId }: { tabId: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const tabLabels = ["home", "chat", "contacts", "me"];
    const targetIndex = tabLabels.indexOf(tabId);
    const allTabs = document.querySelectorAll<HTMLButtonElement>(".tab-bar-item");
    const tabEl = allTabs[targetIndex];
    if (tabEl) {
      setRect(tabEl.getBoundingClientRect());
    }
  }, [tabId]);

  if (!rect) return null;

  return (
    <div
      className="absolute z-[55] rounded-xl ring-2 ring-accent/60 bg-card/90 shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
      style={{
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  );
}
