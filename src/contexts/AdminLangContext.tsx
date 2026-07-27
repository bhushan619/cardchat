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
