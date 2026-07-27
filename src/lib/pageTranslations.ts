// Lightweight per-page EN/中文 translation helper.
// No i18n library — a page defines its own translations object and uses t(key).

import { useEffect, useState } from "react";

export type Lang = "en" | "zh";

export function usePageLang(storageKey: string): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "en" || v === "zh") setLangState(v);
    } catch {}
  }, [storageKey]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(storageKey, l); } catch {}
  };
  return [lang, setLang];
}

export function makeT<K extends string>(dict: Record<"en" | "zh", Record<K, string>>, lang: Lang) {
  return (key: K): string => dict[lang][key] ?? dict.en[key] ?? String(key);
}
