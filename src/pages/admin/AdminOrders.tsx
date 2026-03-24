import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { orders, type OrderStatus } from "@/data/mock";
import { Search, ChevronDown, ChevronUp, Download, Calendar, CheckCircle2, Clock, AlertTriangle, Ban, Eye, Send as SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  created: { label: "Created", color: "bg-muted text-muted-foreground", icon: Clock },
  submitted: { label: "Submitted", color: "bg-primary/10 text-primary", icon: SendIcon },
  under_review: { label: "Under Review", color: "bg-warning/10 text-warning", icon: Eye },
  settled: { label: "Settled", color: "bg-success/10 text-success", icon: CheckCircle2 },
  disputed: { label: "Disputed", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: Ban },
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerAlias.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Card", "Amount", "Rate", "Status", "Created"];
    const rows = filtered.map(o => [o.id, o.customerAlias, `${o.cardType} ${o.denomination}`, `$${o.amount}`, `₦${o.nairaRate}`, o.status, o.created]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">All orders across agents</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by order ID, customer..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <Input type="date" className="h-8 w-32 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span>to</span>
              <Input type="date" className="h-8 w-32 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2"></th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Card</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Rate (₦)</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const isExpanded = expandedId === o.id;
                const stCfg = statusConfig[o.status];
                const StIcon = stCfg.icon;
                return (
                  <>
                    <tr
                      key={o.id}
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-2 text-center">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground mx-auto" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-accent">{o.id}</td>
                      <td className="px-4 py-3 text-sm">{o.customerAlias}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{o.cardType} {o.denomination}</td>
                      <td className="px-4 py-3 text-sm text-right">${o.amount}</td>
                      <td className="px-4 py-3 text-sm text-right">₦{o.nairaRate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${stCfg.color}`}>
                          <StIcon className="w-3 h-3" /> {stCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-muted-foreground">{o.created}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={8} className="px-6 py-4 bg-muted/20">
                          <div className="grid grid-cols-3 gap-6 animate-slide-up">
                            {/* Card details */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
                              <div className="space-y-1.5">
                                {o.cards.map((c, i) => (
                                  <div key={c.id} className="flex justify-between text-xs border-b pb-1 last:border-0">
                                    <span className="text-muted-foreground">Card #{i + 1}: {c.cardType} ({c.cardFormat})</span>
                                    <span className="font-medium">${c.denomination}</span>
                                  </div>
                                ))}
                              </div>
                              {o.adListing && (
                                <div className="flex justify-between text-xs mt-2">
                                  <span className="text-muted-foreground">AD Listing</span>
                                  <span className="font-medium">{o.adListing}</span>
                                </div>
                              )}
                            </div>

                            {/* Settlement/Dispute */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {o.settlement ? "Settlement" : o.dispute ? "Dispute" : "Info"}
                              </p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Customer</span>
                                  <span className="font-medium">{o.customerAlias}</span>
                                </div>
                                {o.settlement && (
                                  <>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Settlement (CNY)</span>
                                      <span className="font-medium">¥{o.settlement.amountCNY}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Converted (NGN)</span>
                                      <span className="font-medium text-success">₦{o.settlement.convertedNGN.toLocaleString()}</span>
                                    </div>
                                  </>
                                )}
                                {o.dispute && (
                                  <>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">Reason</span>
                                      <span className="font-medium text-destructive">{o.dispute.reason.replace("_", " ")}</span>
                                    </div>
                                    {o.dispute.buyerAmount && (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Buyer Amount</span>
                                        <span className="font-medium">${o.dispute.buyerAmount}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
                              <div className="space-y-2 pl-3 border-l-2 border-accent/20">
                                {o.timeline.map((step, i) => (
                                  <div key={i} className="relative pl-3">
                                    <div className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-accent border-2 border-accent" />
                                    <p className="text-xs font-medium">{step.event}</p>
                                    <p className="text-[10px] text-muted-foreground">{step.time}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
