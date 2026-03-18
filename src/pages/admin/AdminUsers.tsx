import AdminLayout from "@/components/admin/AdminLayout";
import { adminUsers } from "@/data/mock";
import { Users, Plus, Search, MoreVertical, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-accent/10 text-accent" },
  team_lead: { label: "Team Lead", color: "bg-warning/10 text-warning" },
  agent: { label: "Agent", color: "bg-primary/10 text-primary" },
};

export default function AdminUsers() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Plus className="w-3.5 h-3.5" /> Add User
          </Button>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Email</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Last Login</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-badge ${roleLabels[u.role]?.color || ""}`}>
                      {roleLabels[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block ${u.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-4 py-3 text-right">
                    <button><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
