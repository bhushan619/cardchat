import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { BarChart3, Users, MessageSquare, TrendingUp, Clock } from "lucide-react";

const agents = [
  { name: "Mike Agent", chats: 12, orders: 8, settled: 6, pending: 2, avgTime: "8 min" },
  { name: "Tunde Agent", chats: 9, orders: 5, settled: 4, pending: 1, avgTime: "12 min" },
  { name: "Joy Agent", chats: 6, orders: 3, settled: 3, pending: 0, avgTime: "10 min" },
];

const escalations = [
  { agent: "Mike Agent", customer: "B5N1QW", participants: ["Sarah Lead"], duration: "12 min ago" },
  { agent: "Tunde Agent", customer: "K9M2BL", participants: ["Sarah Lead", "Admin One"], duration: "34 min ago" },
];


export default function AdminTeam() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="font-heading text-xl font-bold mb-1">Team Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Team Lead view · Agent performance overview</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: MessageSquare, label: "Active Chats", value: "27", change: "+5" },
            { icon: Users, label: "Online Agents", value: "3/4", change: "" },
            { icon: TrendingUp, label: "Orders Today", value: "16", change: "+3" },
            { icon: Clock, label: "Avg Response", value: "4 min", change: "-1 min" },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-heading font-bold">{s.value}</p>
              {s.change && <p className="text-xs text-accent mt-1">{s.change}</p>}
            </div>
          ))}
        </div>

        {/* Agent Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-heading font-semibold text-sm">Agent Performance</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Agent</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Active Chats</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Orders</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Settled</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Pending</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.name} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-center">{a.chats}</td>
                  <td className="px-4 py-3 text-sm text-center">{a.orders}</td>
                  <td className="px-4 py-3 text-sm text-center text-accent">{a.settled}</td>
                  <td className="px-4 py-3 text-sm text-center text-warning">{a.pending}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">{a.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active Escalations */}
        <div className="mt-6 bg-card border rounded-xl p-4">
          <h2 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" /> Active Escalations
          </h2>
          {escalations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active escalations</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Agent</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Participants</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((e) => (
                  <tr key={e.customer} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{e.agent}</td>
                    <td className="px-4 py-3 text-sm font-mono">{e.customer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.participants.join(", ")}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.duration}</td>
                    <td className="px-4 py-3">
                      <span className="status-badge bg-success/10 text-success text-[10px]">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/admin" className="text-xs text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
