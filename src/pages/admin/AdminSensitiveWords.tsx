import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ShieldAlert, Plus, Trash2, Edit, Upload, Search, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAdminRole } from "@/contexts/AdminRoleContext";

type Category = "profanity" | "competitor" | "pii";
type DetectionMode = "exact" | "partial";

interface SensitiveWord {
  id: string;
  word: string;
  category: Category;
  mode: DetectionMode;
}

const CATEGORY_LABELS: Record<Category, { label: string; color: string; bg: string }> = {
  profanity: { label: "Profanity", color: "text-destructive", bg: "bg-destructive/10" },
  competitor: { label: "Competitor", color: "text-warning", bg: "bg-warning/10" },
  pii: { label: "PII Pattern", color: "text-primary", bg: "bg-primary/10" },
};

const initialWords: SensitiveWord[] = [
  { id: "1", word: "CompetitorX", category: "competitor", mode: "exact" },
  { id: "2", word: "damn", category: "profanity", mode: "exact" },
  { id: "3", word: "credit card number", category: "pii", mode: "partial" },
  { id: "4", word: "TradeRival", category: "competitor", mode: "exact" },
  { id: "5", word: "SSN", category: "pii", mode: "exact" },
];

function maskWord(word: string): string {
  if (word.length <= 2) return "*".repeat(word.length);
  return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
}

export default function AdminSensitiveWords() {
  const { role } = useAdminRole();
  const [words, setWords] = useState<SensitiveWord[]>(initialWords);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [newWord, setNewWord] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("profanity");
  const [newMode, setNewMode] = useState<DetectionMode>("exact");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = role === "super_admin";

  const filtered = words.filter(w => {
    const matchSearch = w.word.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || w.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const addWord = () => {
    if (!newWord.trim()) return;
    setWords(prev => [...prev, { id: Date.now().toString(), word: newWord.trim(), category: newCategory, mode: newMode }]);
    setNewWord("");
    toast({ title: "Word added", description: `"${newWord}" added to sensitive words list.` });
  };

  const deleteWord = (id: string) => setWords(prev => prev.filter(w => w.id !== id));

  const startEdit = (w: SensitiveWord) => { setEditingId(w.id); setEditWord(w.word); };
  const saveEdit = (id: string) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, word: editWord } : w));
    setEditingId(null);
    toast({ title: "Word updated" });
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const imported: SensitiveWord[] = lines.slice(1).map((line, i) => {
        const [word, category, mode] = line.split(",").map(s => s.trim());
        return {
          id: `import-${Date.now()}-${i}`,
          word: word || "",
          category: (["profanity", "competitor", "pii"].includes(category) ? category : "profanity") as Category,
          mode: (mode === "partial" ? "partial" : "exact") as DetectionMode,
        };
      }).filter(w => w.word);
      setWords(prev => [...prev, ...imported]);
      toast({ title: "CSV imported", description: `${imported.length} words imported.` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const displayWord = (word: string) => isSuperAdmin ? word : maskWord(word);

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">Sensitive Words Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage word filters · {isSuperAdmin ? "Unmasked view (Super Admin)" : "Masked view"}
            </p>
          </div>
        </div>

        {/* Add word */}
        <div className="bg-card border rounded-xl p-4 mb-5 space-y-3">
          <h3 className="text-sm font-semibold">Add Sensitive Word</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground">Word / Pattern</label>
              <Input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="Enter word..." className="mt-1" />
            </div>
            <div className="w-36">
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as Category)} className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="profanity">Profanity</option>
                <option value="competitor">Competitor</option>
                <option value="pii">PII Pattern</option>
              </select>
            </div>
            <div className="w-28">
              <label className="text-xs text-muted-foreground">Detection</label>
              <select value={newMode} onChange={e => setNewMode(e.target.value as DetectionMode)} className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="exact">Exact</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <Button onClick={addWord} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
            <div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-1">
                <Upload className="w-3.5 h-3.5" /> Import CSV
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">CSV format: word,category,mode (header row expected)</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search words..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-1">
            {(["all", "profanity", "competitor", "pii"] as const).map(c => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${filterCategory === c ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {c === "all" ? "All" : CATEGORY_LABELS[c].label}
              </button>
            ))}
          </div>
        </div>

        {/* Words table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Word</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Detection</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const cat = CATEGORY_LABELS[w.category];
                return (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {editingId === w.id ? (
                        <div className="flex items-center gap-2">
                          <Input value={editWord} onChange={e => setEditWord(e.target.value)} className="h-8 text-sm w-48" />
                          <button onClick={() => saveEdit(w.id)} className="text-success"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium font-mono">{displayWord(w.word)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>{cat.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{w.mode}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(w)} className="text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteWord(w.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No words found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{words.length} total words · {words.filter(w => w.mode === "partial").length} partial match</p>
      </div>
    </AdminLayout>
  );
}
