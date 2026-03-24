import { ReactNode, useState } from "react";
import { Home, MessageCircle, Users, User, BookOpen, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/customer" },
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/customer/chat" },
  { id: "contacts", label: "Contacts", icon: Users, path: "/customer/contacts" },
  { id: "me", label: "Me", icon: User, path: "/customer/me" },
  { id: "guide", label: "Guide", icon: BookOpen, path: "/customer/guide" },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || "home";

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Theme toggle */}
      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
      <nav className="flex items-center justify-around border-t bg-card py-2 px-2 shrink-0">
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
    </div>
  );
}
