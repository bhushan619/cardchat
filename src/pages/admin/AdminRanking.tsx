import { useState, useMemo } from "react";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";
import { rankingTiers, rankingList, getBiWeeklyPeriods } from "@/data/rankingMock";
import { Trophy, Medal, Award, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const medalIcons: Record<number, JSX.Element> = {
  1: <Trophy className="w-4 h-4 text-yellow-500" />,
  2: <Medal className="w-4 h-4 text-gray-400" />,
  3: <Award className="w-4 h-4 text-amber-600" />,
};

function getPeriodOptions() {
  const options: { value: string; label: string; start: Date; end: Date }[] = [];
  // Generate periods for 2026
  for (let month = 0; month < 12; month++) {
    const [p1, p2] = getBiWeeklyPeriods(2026, month);
    options.push({
      value: `${month}-h1`,
      label: p1.label,
      start: p1.start,
      end: p1.end,
    });
    options.push({
      value: `${month}-h2`,
      label: p2.label,
      start: p2.start,
      end: p2.end,
    });
  }
  return options;
}

const periodOptions = getPeriodOptions();

export default function AdminRanking() {
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("2-h1"); // Mar H1
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const activePeriod = periodOptions.find((p) => p.value === selectedPeriod);

  const filteredList = useMemo(() => {
    if (!search.trim()) return rankingList;
    return rankingList.filter((u) => u.alias.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleExport = () => {
    const headers = ["Rank", "Alias", "Volume", "Reward (Pts )"];
    const rows = filteredList.map((u) => [u.rank, u.alias, u.volume, u.reward]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ranking_${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">Trading Volume Ranking</h1>
            {activePeriod && (
              <p className="text-sm text-muted-foreground">
                {activePeriod.label}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedPeriod} onValueChange={(v) => {
              setSelectedPeriod(v);
              const p = periodOptions.find((o) => o.value === v);
              if (p) { setDateFrom(p.start); setDateTo(p.end); }
            }}>
              <SelectTrigger className="w-56 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {periodOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From:</span>
            <DateTimePicker value={dateFrom} onChange={setDateFrom} placeholder="Start date & time" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">To:</span>
            <DateTimePicker value={dateTo} onChange={setDateTo} placeholder="End date & time" />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reward Tiers */}
          <div className="bg-card border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Reward Tiers</h2>
            <div className="space-y-2">
              {rankingTiers.map((t) => (
                <div key={t.threshold} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">≥ {t.threshold.toLocaleString()}</span>
                  <span className="font-semibold text-accent">Pts {t.reward.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Leaderboard ({filteredList.length} users)</h2>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search alias..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Button size="sm" className="h-8 gap-1.5 text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
                  <Search className="w-3 h-3" /> Search
                </Button>
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
                      <td className="py-2.5 text-right pr-3 font-semibold text-accent">Pts {u.reward}</td>
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
