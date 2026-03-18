import AdminLayout from "@/components/admin/AdminLayout";
import { orders } from "@/data/mock";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  trading: "bg-warning/10 text-warning",
  settled: "bg-accent/10 text-accent",
  pending_payment: "bg-destructive/10 text-destructive",
};

export default function AdminOrders() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">All orders across agents</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by order ID, customer..." className="pl-10" />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
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
              {orders.map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
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
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{o.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
