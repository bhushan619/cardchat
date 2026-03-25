import { ReactNode, useCallback, useEffect, useState } from "react";
import { Home, MessageCircle, Users, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BeginnerGuide, { guideSteps } from "./BeginnerGuide";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/customer" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/customer/chat" },
  { id: "contacts", label: "Contacts", icon: Users, path: "/customer/contacts" },
  { id: "me", label: "Me", icon: User, path: "/customer/me" },
];

const GUIDE_DONE_KEY = "beginner_guide_done";
const GUIDE_STEP_KEY = "beginner_guide_step";

const getInitialGuideStep = () => {
  const raw = Number(localStorage.getItem(GUIDE_STEP_KEY) ?? "0");
  if (!Number.isFinite(raw)) return 0;
  return Math.min(Math.max(raw, 0), guideSteps.length - 1);
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || "home";

  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem(GUIDE_DONE_KEY));
  const [guideStep, setGuideStep] = useState(getInitialGuideStep);

  useEffect(() => {
    if (!showGuide) return;
    const expectedPath = guideSteps[guideStep]?.path;
    if (expectedPath && location.pathname !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [guideStep, location.pathname, navigate, showGuide]);

  const handleGuideComplete = useCallback(() => {
    setShowGuide(false);
    setGuideStep(0);
    localStorage.setItem(GUIDE_DONE_KEY, "1");
    localStorage.removeItem(GUIDE_STEP_KEY);
    navigate("/customer", { replace: true });
  }, [navigate]);

  const handleGuideNext = useCallback(() => {
    if (guideStep >= guideSteps.length - 1) {
      handleGuideComplete();
      return;
    }

    const nextStep = guideStep + 1;
    setGuideStep(nextStep);
    localStorage.setItem(GUIDE_STEP_KEY, String(nextStep));
    navigate(guideSteps[nextStep].path, { replace: true });
  }, [guideStep, handleGuideComplete, navigate]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <nav className="relative z-50 flex items-center justify-around border-t bg-card py-2 px-2 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`tab-bar-item py-1.5 px-3 ${activeTab === tab.id ? "active" : ""}`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      {showGuide && (
        <BeginnerGuide
          step={guideStep}
          onNext={handleGuideNext}
          onSkip={handleGuideComplete}
        />
      )}
    </div>
  );
}
