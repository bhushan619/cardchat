// Lightweight per-page EN/中文 translation helper.
// No i18n library — a page defines its own translations object and uses t(key).

export type Lang = "en" | "zh";


export function makeT<K extends string>(dict: Record<"en" | "zh", Record<K, string>>, lang: Lang) {
  return (key: K): string => dict[lang][key] ?? dict.en[key] ?? String(key);
}
