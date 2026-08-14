import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AdminLang = "en" | "zh";

const STORAGE_KEY = "lang_admin";

interface AdminLangContextValue {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
}

const AdminLangContext = createContext<AdminLangContextValue | null>(null);

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("en");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "en" || v === "zh") setLangState(v);
    } catch {}
  }, []);

  const setLang = (l: AdminLang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  };

  return (
    <AdminLangContext.Provider value={{ lang, setLang }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang(): AdminLang {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useAdminLang must be used within AdminLangProvider");
  return ctx.lang;
}

export function useSetAdminLang(): (l: AdminLang) => void {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useSetAdminLang must be used within AdminLangProvider");
  return ctx.setLang;
}

// Shared admin translations (escalation / group chat)
const adminTranslations: Record<AdminLang, Record<string, string>> = {
  en: {
    Escalate: "Escalate",
    "Add to Chat": "Add to Chat",
    "has joined the chat": "has joined the chat",
    "has left the chat": "has left the chat",
    "Escalation ended": "Escalation ended",
    "Active Escalations": "Active Escalations",
    "No active escalations": "No active escalations",
  },
  zh: {
    Escalate: "升级",
    "Add to Chat": "添加到聊天",
    "has joined the chat": "已加入聊天",
    "has left the chat": "已离开聊天",
    "Escalation ended": "升级已结束",
    "Active Escalations": "活跃升级",
    "No active escalations": "没有活跃的升级",
  },
};

export function useAdminT() {
  const lang = useAdminLang();
  return (key: string) => adminTranslations[lang][key] ?? adminTranslations.en[key] ?? key;
}

