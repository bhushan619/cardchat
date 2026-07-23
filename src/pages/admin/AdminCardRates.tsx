import AdminLayout from "@/components/admin/AdminLayout";
import { cardRates, systemPriceControl } from "@/data/mock";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Send, Coins, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type SortKey = "cardType" | "currency" | "sellRate" | "denomination";
type SortDir = "asc" | "desc";

const popularCards = ["iTunes US", "Steam US", "Razer Gold"];

export default function AdminCardRates() {
  const { role } = useAdminRole();
  const [cardTypeFilter, setCardTypeFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [applied, setApplied] = useState({ cardType: "all", currency: "all" });
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pricePushOpen, setPricePushOpen] = useState(false);

  const canPush = role === "super_admin" || role === "team_lead";

  const ratesWithFormula = useMemo(
    () => cardRates.map(r => ({ ...r, buyRate: Math.round(r.sellRate * (systemPriceControl / 100)) })),
    []
  );

  const cardTypeOptions = useMemo(
    () => Array.from(new Set(ratesWithFormula.map(r => r.cardType))).sort(),
    [ratesWithFormula]
  );
  const currencyOptions = useMemo(
    () => Array.from(new Set(ratesWithFormula.map(r => r.currency))).sort(),
    [ratesWithFormula]
  );

  const filtered = ratesWithFormula
    .filter(r => applied.cardType === "all" || r.cardType === applied.cardType)
    .filter(r => applied.currency === "all" || r.currency === applied.currency)
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

  const popularRates = ratesWithFormula.filter(r => popularCards.some(p => r.cardType.includes(p.split(" ")[0])));

  const handleSearch = () => setApplied({ cardType: cardTypeFilter, currency: currencyFilter });
  const handleClear = () => {
    setCardTypeFilter("all");
    setCurrencyFilter("all");
    setApplied({ cardType: "all", currency: "all" });
  };
  const isDirty = cardTypeFilter !== "all" || currencyFilter !== "all" || applied.cardType !== "all" || applied.currency !== "all";

  const handlePricePush = () => {
    toast.success("Price notification pushed to all customers!");
    setPricePushOpen(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">Card Rates</h1>
            <p className="text-sm text-muted-foreground">
              Live rates from merchant API · Auto-refreshes every 60s · {ratesWithFormula.length} listings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canPush && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setPricePushOpen(true)}>
                <Send className="w-3.5 h-3.5" /> Price Push
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All card types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All card types</SelectItem>
              {cardTypeOptions.map(ct => (
                <SelectItem key={ct} value={ct}>{ct}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All currencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All currencies</SelectItem>
              {currencyOptions.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSearch}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear} disabled={!isDirty}>
            Clear
          </Button>
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
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                formatFilter === f ? "bg-accent-foreground/20" : "bg-background"
              }`}>
                {f === "all"
                  ? ratesWithFormula.length
                  : ratesWithFormula.filter(r => r.cardFormat === f).length}
              </span>
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
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("denomination")}>
                  <span className="flex items-center gap-1 justify-end">Denomination <SortIcon col="denomination" /></span>
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Format</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("currency")}>
                  <span className="flex items-center gap-1">Currency <SortIcon col="currency" /></span>
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("sellRate")}>
                  <span className="flex items-center gap-1 justify-end">Points Price <SortIcon col="sellRate" /></span>
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No rates match your filters.
                  </td>
                </tr>
              ) : sorted.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.cardType}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {r.currency === "USD" ? "$" : r.currency === "GBP" ? "£" : r.currency === "EUR" ? "€" : ""}
                    {r.denomination}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.cardFormat === "E-Code" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {r.cardFormat}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.currency}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold rate-value">
                    <span className="inline-flex items-center gap-1 justify-end"><Coins className="w-3.5 h-3.5 text-accent" />{r.sellRate}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{r.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Push Modal */}
      <Dialog open={pricePushOpen} onOpenChange={setPricePushOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-accent" /> Push Card Prices
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will send a notification with the current popular card prices to all customers on the platform.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Popular Cards Preview</p>
            {popularRates.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {r.cardType} <span className="text-muted-foreground text-xs">({r.denomination} {r.currency} · {r.cardFormat})</span>
                </span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  Points price: <strong className="text-foreground inline-flex items-center gap-0.5"><Coins className="w-3 h-3" />{r.sellRate}</strong>
                </span>
              </div>
            ))}
          </div>
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <p className="text-xs text-warning-foreground">⚠ This will notify all active customers immediately.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setPricePushOpen(false)}>Cancel</Button>
            <Button className="flex-1 gap-1.5" onClick={handlePricePush}>
              <Send className="w-3.5 h-3.5" /> Push to All Customers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
