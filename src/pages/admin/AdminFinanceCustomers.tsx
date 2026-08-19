import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations, customerWallets } from "@/data/mock";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChannelBadge from "@/components/admin/ChannelBadge";
import PointsAmount from "@/components/admin/PointsAmount";
import { Search, Download, Wallet, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Row = {
  alias: string;
  channel: "trtc" | "whatsapp";
  balance: number;
};

const channelByAlias = new Map(conversations.map((c) => [c.alias, c.channel]));

const rows: Row[] = customerWallets.map((w) => ({
  alias: w.alias,
  channel: (channelByAlias.get(w.alias) ?? "trtc") as Row["channel"],
  balance: Math.round(w.balance),
}));

export default function AdminFinanceCustomers() {
  const { role } = useAdminRole();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [minBalance, setMinBalance] = useState("");

  const filtered = useMemo(() => {
    const min = Number(minBalance) || 0;
    return rows.filter(
      (r) =>
        r.alias.toLowerCase().includes(search.trim().toLowerCase()) &&
        (channelFilter === "all" || r.channel === channelFilter) &&
        r.balance >= min
    );
  }, [search, channelFilter, minBalance]);

  const total = filtered.reduce((s, r) => s + r.balance, 0);

  const exportCsv = () => {
    const headers = ["Alias", "Channel", "Wallet Amount (Points)"];
    const body = filtered.map((r) => [r.alias, r.channel === "whatsapp" ? "WhatsApp" : "In-app", r.balance]);
    const csv = [headers, ...body]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-customers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} records exported.` });
  };

  if (role !== "finance") {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="max-w-md mx-auto mt-20 text-center border rounded-xl bg-card p-8">
            <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Finance access only</h1>
            <p className="text-sm text-muted-foreground">
              This page is restricted to the Finance role. Switch role to Finance to view customer wallet balances.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" /> Customers (Finance)
            </h1>
            <p className="text-sm text-muted-foreground">Customer wallet balances by channel</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filtered.length} records
            </Badge>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by alias..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="trtc">In-App (TRTC)</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={0}
            placeholder="Min wallet amount"
            className="w-48"
            value={minBalance}
            onChange={(e) => setMinBalance(e.target.value)}
          />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Alias</TableHead>
                <TableHead className="text-xs font-semibold text-center">Channel</TableHead>
                <TableHead className="text-xs font-semibold text-right">Wallet Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.alias} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm font-medium">{r.alias}</TableCell>
                  <TableCell className="text-center">
                    <ChannelBadge channel={r.channel} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <PointsAmount value={r.balance} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-10">
                    No customers match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {filtered.length > 0 && (
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total wallet amount</span>
              <PointsAmount value={total} className="font-semibold" />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
