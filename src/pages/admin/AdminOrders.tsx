import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { orders, cardlightResultLabels, type CardlightResult } from "@/data/mock";
import { FileText, Search, ChevronDown, ChevronUp, Download, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending_sale: "bg-warning/10 text-warning",
  pending: "bg-primary/10 text-primary",
  in_trade: "bg-accent/10 text-accent",
  negotiation: "bg-warning/10 text-warning",
  order_cancelled: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};

const cardlightResultColors: Record<CardlightResult, string> = {
  approved: "bg-success/10 text-success",
  declined: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
  partial: "bg-accent/10 text-accent",
};

const mockOrderDetails: Record<string, {
  cardFormat: string;
  agent: string;
  timeline: { event: string; time: string }[];
  
}> = {
  "ORD-20260318-001": {
    cardFormat: "Physical",
    agent: "Mike Agent",
    timeline: [
      { event: "Order created", time: "10:37 AM" },
      { event: "Cards verified", time: "10:38 AM" },
      { event: "Settled", time: "10:40 AM" },
      { event: "Payment sent", time: "10:42 AM" },
    ],
    
  },
  "ORD-20260318-002": {
    cardFormat: "E-Code",
    agent: "Tunde Agent",
    timeline: [
      { event: "Order created", time: "09:15 AM" },
      { event: "Cards submitted", time: "09:20 AM" },
    ],
  },
  "ORD-20260318-003": {
    cardFormat: "Physical",
    agent: "Mike Agent",
    timeline: [
      { event: "Order created", time: "08:45 AM" },
      { event: "Cards verified", time: "08:50 AM" },
      { event: "Settled", time: "09:00 AM" },
    ],
  },
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Card", "Amount", "Rate", "Status", "Created"];
    const rows = filtered.map(o => [o.id, o.customer, `${o.cardType} ${o.denomination}`, `$${o.amount}`, `₦${o.nairaRate}`, o.status, o.created]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">CardLight Result</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const isExpanded = expandedId === o.id;
                const details = mockOrderDetails[o.id];
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
                      <td className="px-4 py-3 text-sm">{o.customer}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{o.cardType} {o.denomination}</td>
                      <td className="px-4 py-3 text-sm text-right">${o.amount}</td>
                      <td className="px-4 py-3 text-sm text-right">₦{o.nairaRate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`status-badge ${statusColors[o.status] || ""}`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`status-badge ${cardlightResultColors[o.cardlightResult] || ""}`}>
                          {cardlightResultLabels[o.cardlightResult]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-muted-foreground">{o.created}</td>
                    </tr>
                    {isExpanded && details && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={9} className="px-6 py-4 bg-muted/20">
                          <div className="grid grid-cols-3 gap-6 animate-slide-up">
                            {/* Card details */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
                              <div className="space-y-1.5">
                                {[
                                  ["Type", o.cardType],
                                  ["Format", details.cardFormat],
                                  ["Denomination", o.denomination],
                                  ["Unit Price", `₦${o.unitPrice}`],
                                  ["Rate", `₦${o.nairaRate}`],
                                ].map(([k, v]) => (
                                  <div key={k} className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">{k}</span>
                                    <span className="font-medium">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Assignment */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignment</p>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Customer</span>
                                  <span className="font-medium">{o.customer}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Agent</span>
                                  <span className="font-medium">{details.agent}</span>
                                </div>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
                              <div className="space-y-2 pl-3 border-l-2 border-accent/20">
                                {details.timeline.map((step, i) => (
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
