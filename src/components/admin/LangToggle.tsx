import { Languages } from "lucide-react";
import type { Lang } from "@/lib/pageTranslations";

export default function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-card text-xs overflow-hidden">
      <span className="px-2 text-muted-foreground border-r flex items-center h-8"><Languages className="w-3.5 h-3.5" /></span>
      <button
        onClick={() => onChange("en")}
        className={`h-8 px-3 font-medium transition-colors ${lang === "en" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
      >EN</button>
      <button
        onClick={() => onChange("zh")}
        className={`h-8 px-3 font-medium transition-colors ${lang === "zh" ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
      >中文</button>
    </div>
  );
}
