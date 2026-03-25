import { ReactNode, useState, useEffect } from "react";
import { Home, MessageCircle, Users, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BeginnerGuide from "./BeginnerGuide";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/customer" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/customer/chat" },
  { id: "contacts", label: "Contacts", icon: Users, path: "/customer/contacts" },
  { id: "me", label: "Me", icon: User, path: "/customer/me" },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || "home";

  const [showGuide, setShowGuide] = useState(() => {
    return !localStorage.getItem("beginner_guide_done");
  });

  const handleGuideComplete = () => {
    setShowGuide(false);
    localStorage.setItem("beginner_guide_done", "1");
  };

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
      {showGuide && <BeginnerGuide onComplete={handleGuideComplete} />}
    </div>
  );
}