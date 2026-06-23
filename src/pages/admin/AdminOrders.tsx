import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { orders } from "@/data/mock";
import { Search, ChevronDown, ChevronUp, Download, Copy, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  pending_sale: "bg-warning/10 text-warning",
  pending: "bg-primary/10 text-primary",
  in_trade: "bg-accent/10 text-accent",
  order_cancelled: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};

interface OrderDetail {
  cardFormat: string;
  agent: string;
  timeline: { event: string; time: string }[];
  creationTime: string;
  cardFaceValue: number;
  cardCode: string;
  cardImage?: string;
  orderReceivingTime: string;
  orderFaceValue: number;
  orderUnitPrice: number;
  orderAmount: number;
  nairaRate: number;
  settlementCoin: string;
  settleFaceValue: number;
  settleRate: number;
  settlementAmount: number;
  buyerNickname: string;
  cardStatus: string;
  checked: string;
  createTime: string;
}

const mockOrderDetails: Record<string, OrderDetail> = {
  "ORD-20260318-001": {
    cardFormat: "Physical",
    agent: "Mike Agent",
    timeline: [
      { event: "Order created", time: "10:37 AM" },
      { event: "Cards verified", time: "10:38 AM" },
      { event: "Settled", time: "10:40 AM" },
      { event: "Payment sent", time: "10:42 AM" },
    ],
    creationTime: "10:37 AM",
    cardFaceValue: 200,
    cardCode: "ORD-20260318-001",
    orderReceivingTime: "10:37 AM",
    orderFaceValue: 200,
    orderUnitPrice: 680,
    orderAmount: 136000,
    nairaRate: 289,
    settlementCoin: "USD",
    settleFaceValue: 200,
    settleRate: 680,
    settlementAmount: 136000,
    buyerNickname: "Liu Yang",
    cardStatus: "Verified",
    checked: "Yes",
    createTime: "10:37 AM",
  },
  "ORD-20260318-002": {
    cardFormat: "E-Code",
    agent: "Tunde Agent",
    timeline: [
      { event: "Order created", time: "09:15 AM" },
      { event: "Cards submitted", time: "09:20 AM" },
    ],
    creationTime: "09:15 AM",
    cardFaceValue: 150,
    cardCode: "ORD-20260318-002",
    orderReceivingTime: "09:15 AM",
    orderFaceValue: 150,
    orderUnitPrice: 620,
    orderAmount: 93000,
    nairaRate: 289,
    settlementCoin: "USD",
    settleFaceValue: 150,
    settleRate: 620,
    settlementAmount: 93000,
    buyerNickname: "Zhang Wei",
    cardStatus: "Pending",
    checked: "No",
    createTime: "09:15 AM",
  },
  "ORD-20260318-003": {
    cardFormat: "Physical",
    agent: "Mike Agent",
    timeline: [
      { event: "Order created", time: "08:45 AM" },
      { event: "Cards verified", time: "08:50 AM" },
      { event: "Settled", time: "09:00 AM" },
    ],
    creationTime: "08:45 AM",
    cardFaceValue: 200,
    cardCode: "ORD-20260318-003",
    orderReceivingTime: "08:45 AM",
    orderFaceValue: 200,
    orderUnitPrice: 600,
    orderAmount: 120000,
    nairaRate: 289,
    settlementCoin: "USD",
    settleFaceValue: 200,
    settleRate: 600,
    settlementAmount: 120000,
    buyerNickname: "Wang Fang",
    cardStatus: "Invalid",
    checked: "No",
    createTime: "08:45 AM",
  },
};

function CopyableValue({ value }: { value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };
  return (
    <span className="inline-flex items-center gap-1 font-medium">
      {value}
      <button onClick={handleCopy} className="text-muted-foreground hover:text-primary transition-colors">
        <Copy className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cardTypeFilter, setCardTypeFilter] = useState<string>("all");

  const uniqueCardTypes = Array.from(new Set(orders.map((o) => o.cardType)));

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesType = cardTypeFilter === "all" || o.cardType === cardTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportCSV = () => {
    const headers = [
      "Alias",
      "Card Type",
      "Card Rate (CNY)",
      "Card Rate (NGN)",
      "Naira Rate (₦)",
      "Amount",
      "Status",
      "Created",
    ];
    const rows = filtered.map((o) => [
      o.customer,
      o.cardType,
      `¥${o.unitPrice}`,
      `₦${o.nairaRate ? (Number(o.unitPrice) / Number(o.nairaRate)).toFixed(4) : "—"}`,
      `₦${o.nairaRate}`,
      `$${o.amount}`,
      o.status,
      o.created,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
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

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending_sale">Pending Sale</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_trade">In Trade</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="order_cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Card type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All card types</SelectItem>
              {uniqueCardTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DateTimePicker value={dateFrom} onChange={setDateFrom} placeholder="From date & time" />
            <span>to</span>
            <DateTimePicker value={dateTo} onChange={setDateTo} placeholder="To date & time" />
          </div>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2"></th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Alias</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Card Code</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Card Rate (CNY)</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Card Rate (NGN)</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Naira Rate</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
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
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{o.customer}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div>{o.cardType}</div>
                        <div className="text-[10px] text-muted-foreground">{o.id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">₦{o.unitPrice}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ¥{o.nairaRate ? (Number(o.unitPrice) / Number(o.nairaRate)).toFixed(4) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">₦{o.nairaRate}</td>
                      <td className="px-4 py-3 text-sm text-right">${o.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`status-badge ${statusColors[o.status] || ""}`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-muted-foreground">{o.created}</td>
                    </tr>
                    {isExpanded && details && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={9} className="px-6 py-5 bg-muted/20">
                          <div className="animate-slide-up space-y-5">
                            {/* Order Details Title */}
                            <h3 className="text-sm font-bold">Order Details</h3>

                            {/* Two-column grid */}
                            <div className="grid grid-cols-2 gap-8">
                              {/* Product Information */}
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-center">Product Information</p>
                                <div className="space-y-2.5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Creation time</span>
                                    <span className="font-medium">{details.creationTime}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Card type</span>
                                    <span className="font-medium">{o.cardType}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Card face value</span>
                                    <span className="font-medium">{details.cardFaceValue}</span>
                                  </div>
                                  <div className="flex justify-between text-sm items-center">
                                    <span className="text-muted-foreground">Card code</span>
                                    <CopyableValue value={details.cardCode} />
                                  </div>
                                  <div className="flex justify-between text-sm items-start">
                                    <span className="text-muted-foreground pt-1">Card image</span>
                                    <div className="w-16 h-12 bg-muted rounded border flex items-center justify-center">
                                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order Information */}
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-center">Order Information</p>
                                <div className="space-y-2.5">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order receiving time</span>
                                    <span className="font-medium">{details.orderReceivingTime}</span>
                                  </div>
                                  <div className="flex justify-between text-sm items-center">
                                    <span className="text-muted-foreground">Order id</span>
                                    <CopyableValue value={o.id} />
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order face value</span>
                                    <span className="font-medium">{details.orderFaceValue}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order unit price</span>
                                    <span className="font-medium">₦{details.orderUnitPrice.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order amount</span>
                                    <span className="font-medium">₦{details.orderAmount.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Naira rate</span>
                                    <span className="font-medium">₦{details.nairaRate}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Settlement coin</span>
                                    <span className="font-medium">{details.settlementCoin}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Settle face value</span>
                                    <span className="font-medium">{details.settleFaceValue}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Settle rate</span>
                                    <span className="font-medium">{details.settleRate}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Settlement amount</span>
                                    <span className="font-medium">
                                      {details.settlementCoin} {details.settlementAmount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Buyer Details */}
                            <div className="space-y-3">
                              <p className="text-sm font-bold">Buyer Details</p>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 max-w-2xl">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Buyer Nickname</span>
                                  <span className="font-medium">{details.buyerNickname}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Card Status</span>
                                  <span className="font-medium">{details.cardStatus}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Checked</span>
                                  <span className="font-medium">{details.checked}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Create Time</span>
                                  <span className="font-medium">{details.createTime}</span>
                                </div>
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
