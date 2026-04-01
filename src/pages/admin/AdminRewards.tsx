import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Gift, Search, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type RewardRecord = {
  id: string;
  alias: string;
  type: "ranking" | "referral";
  amount: number;
  description: string;
  date: string;
  time: string;
};

const rewardRecords: RewardRecord[] = [
  { id: "RW-001", alias: "Z9W4MK", type: "ranking", amount: 500, description: "Monthly ranking reward — Rank #1", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-002", alias: "P3L7GX", type: "ranking", amount: 500, description: "Monthly ranking reward — Rank #2", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-003", alias: "T6N8QR", type: "ranking", amount: 500, description: "Monthly ranking reward — Rank #3", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-004", alias: "F1H5VB", type: "ranking", amount: 200, description: "Monthly ranking reward — Rank #4", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-005", alias: "A7X3KP", type: "ranking", amount: 50, description: "Monthly ranking reward — Rank #18", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-006", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited K9M2BL", date: "Mar 20, 2026", time: "02:15 PM" },
  { id: "RW-007", alias: "R4P8TN", type: "referral", amount: 500, description: "Referral bonus — invited B5N1QW", date: "Mar 18, 2026", time: "09:30 AM" },
  { id: "RW-008", alias: "C8J2YS", type: "ranking", amount: 200, description: "Monthly ranking reward — Rank #5", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-009", alias: "M4R9DL", type: "ranking", amount: 200, description: "Monthly ranking reward — Rank #6", date: "Mar 31, 2026", time: "12:00 AM" },
  { id: "RW-010", alias: "W8T4FJ", type: "referral", amount: 500, description: "Referral bonus — invited H2L6YD", date: "Mar 15, 2026", time: "11:00 AM" },
  { id: "RW-011", alias: "A7X3KP", type: "referral", amount: 500, description: "Referral bonus — invited D3F9RX", date: "Mar 10, 2026", time: "04:45 PM" },
  { id: "RW-012", alias: "B5E3UF", type: "ranking", amount: 120, description: "Monthly ranking reward — Rank #9", date: "Mar 31, 2026", time: "12:00 AM" },
];

export default function AdminRewards() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ranking" | "referral">("all");

  const filtered = rewardRecords.filter(r => {
    const matchSearch = !search || r.alias.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalRewards = rewardRecords.reduce((s, r) => s + r.amount, 0);
  const totalRanking = rewardRecords.filter(r => r.type === "ranking").reduce((s, r) => s + r.amount, 0);
  const totalReferral = rewardRecords.filter(r => r.type === "referral").reduce((s, r) => s + r.amount, 0);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-accent" /> Rewards Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Track all rewards distributed to customers
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-accent">₦{totalRewards.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-success">₦{totalRanking.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Ranking Rewards</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-heading font-bold text-warning">₦{totalReferral.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Referral Rewards</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search alias..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ranking">Ranking</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Alias</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-medium text-accent">{r.id}</TableCell>
                  <TableCell className="text-xs font-bold">{r.alias}</TableCell>
                  <TableCell>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      r.type === "ranking"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {r.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">{r.description}</TableCell>
                  <TableCell className="text-right text-sm font-bold text-success">
                    <span className="flex items-center justify-end gap-1">
                      <ArrowDownLeft className="w-3 h-3" />
                      ₦{r.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{r.date} · {r.time}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No rewards found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
