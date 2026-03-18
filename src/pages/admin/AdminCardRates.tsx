import AdminLayout from "@/components/admin/AdminLayout";
import { cardRates } from "@/data/mock";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminCardRates() {
  const [search, setSearch] = useState("");
  const filtered = cardRates.filter(r => r.cardType.toLowerCase().includes(search.toLowerCase()));

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

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by card type or currency..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Card Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Currency</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Buy Rate (₦)</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Sell Rate (₦)</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{r.cardType}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{r.currency}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-accent">₦{r.buyRate}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">₦{r.sellRate}</td>
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
