import AdminLayout from "@/components/admin/AdminLayout";
import { cardRates } from "@/data/mock";
import { Search, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type SortKey = "cardType" | "currency" | "buyRate" | "sellRate";
type SortDir = "asc" | "desc";

export default function AdminCardRates() {
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = cardRates
    .filter(r => r.cardType.toLowerCase().includes(search.toLowerCase()) || r.currency.toLowerCase().includes(search.toLowerCase()))
    .filter(r => formatFilter === "all" || r.cardFormat === formatFilter);

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      })
    : filtered;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">Card Rates</h1>
            <p className="text-sm text-muted-foreground">Live rates from merchant API · Auto-refreshes every 60s</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        <div className="relative max-w-sm mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by card type or currency..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Format filter chips */}
        <div className="flex items-center gap-2 mb-4">
          {["all", "Physical", "E-Code"].map(f => (
            <button
              key={f}
              onClick={() => setFormatFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                formatFilter === f
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All Formats" : f}
              {f !== "all" && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  formatFilter === f ? "bg-accent-foreground/20" : "bg-background"
                }`}>
                  {cardRates.filter(r => r.cardFormat === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("cardType")}>
                  <span className="flex items-center gap-1">Card Type <SortIcon col="cardType" /></span>
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Format</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("currency")}>
                  <span className="flex items-center gap-1">Currency <SortIcon col="currency" /></span>
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("buyRate")}>
                  <span className="flex items-center gap-1 justify-end">Buy Rate (₦) <SortIcon col="buyRate" /></span>
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("sellRate")}>
                  <span className="flex items-center gap-1 justify-end">Sell Rate (₦) <SortIcon col="sellRate" /></span>
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.cardType}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.cardFormat === "E-Code" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {r.cardFormat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.currency}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-accent rate-value">₦{r.buyRate}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold rate-value">₦{r.sellRate}</td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{r.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
