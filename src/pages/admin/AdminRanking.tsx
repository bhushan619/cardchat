import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { rankingTiers, rankingList } from "@/data/rankingMock";
import { Trophy, Medal, Award, Search, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const medalIcons: Record<number, JSX.Element> = {
  1: <Trophy className="w-4 h-4 text-yellow-500" />,
  2: <Medal className="w-4 h-4 text-gray-400" />,
  3: <Award className="w-4 h-4 text-amber-600" />,
};

export default function AdminRanking() {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2"); // March (0-indexed)

  const filteredList = useMemo(() => {
    if (!search.trim()) return rankingList;
    return rankingList.filter((u) => u.alias.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const periodStart = startOfMonth(new Date(2026, Number(selectedMonth)));
  const periodEnd = endOfMonth(new Date(2026, Number(selectedMonth)));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Trading Volume Ranking</h1>
            <p className="text-sm text-muted-foreground">
              {format(periodStart, "MMM dd")} – {format(periodEnd, "MMM dd, yyyy")}
            </p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={String(i)} className="text-xs">{m} 2026</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reward Tiers */}
          <div className="bg-card border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Reward Tiers</h2>
            <div className="space-y-2">
              {rankingTiers.map((t) => (
                <div key={t.threshold} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">≥ {t.threshold.toLocaleString()}</span>
                  <span className="font-semibold text-accent">₦{t.reward.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Leaderboard ({filteredList.length} users)</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search alias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-2 pl-3 w-16">Rank</th>
                    <th className="text-left py-2">Alias</th>
                    <th className="text-right py-2">Volume</th>
                    <th className="text-right py-2 pr-3">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((u) => (
                    <tr key={u.rank} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 pl-3">
                        <span className="flex items-center gap-1.5">
                          {medalIcons[u.rank] || <span className="text-muted-foreground">{u.rank}</span>}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-xs">{u.alias}</td>
                      <td className="py-2.5 text-right">{u.volume.toLocaleString()}</td>
                      <td className="py-2.5 text-right pr-3 font-semibold text-accent">₦{u.reward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
