import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, CreditCard, Settings, Users,
  TrendingUp, Search, Bell, ChevronDown, Shield, Globe, DollarSign,
  BarChart3, Send, FileText, BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminRole } from "@/contexts/AdminRoleContext";

const navItems = [
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/admin" },
  { id: "card-rates", label: "Card Rates", icon: CreditCard, path: "/admin/card-rates" },
  { id: "orders", label: "Orders", icon: FileText, path: "/admin/orders" },
  { id: "naira-rate", label: "Naira Rate", icon: DollarSign, path: "/admin/naira-rate", role: "super_admin" },
  { id: "users", label: "User Management", icon: Users, path: "/admin/users", role: "super_admin" },
  { id: "team", label: "Team Dashboard", icon: BarChart3, path: "/admin/team", role: "team_lead" },
  { id: "api-config", label: "API Config", icon: Globe, path: "/admin/api-config", role: "super_admin" },
  { id: "broadcast", label: "SMS Broadcast", icon: Send, path: "/admin/broadcast", role: "super_admin" },
  { id: "guide", label: "User Guide", icon: BookOpen, path: "/admin/guide" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const { role, setRole } = useAdminRole();

  const visibleItems = navItems.filter(item => {
    if (!item.role) return true;
    if (role === "super_admin") return true;
    if (role === "team_lead") return item.role === "team_lead" || !item.role;
    return false; // agents see only non-role items
  });

  const roleProfiles: Record<string, { name: string; label: string }> = {
    super_admin: { name: "Admin One", label: "Super Admin" },
    team_lead: { name: "Sarah Lead", label: "Team Lead" },
    agent: { name: "Mike Agent", label: "Agent" },
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="font-heading text-lg font-bold text-sidebar-primary">LightChat</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path || (item.path === "/admin" && location.pathname.startsWith("/admin/chat"));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`admin-sidebar-item w-full text-left ${isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">View as</span>
          </div>
          <div className="flex gap-1">
            {(["super_admin", "team_lead", "agent"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                  role === r
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50"
                }`}
              >
                {roleProfiles[r].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold">
              {roleProfiles[role].name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{roleProfiles[role].name}</p>
              <p className="text-xs text-sidebar-foreground/50">{roleProfiles[role].label}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b flex items-center justify-between px-5 bg-card shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers, orders, transactions..."
              className="max-w-md border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-accent" />
              <span className="font-medium">{roleProfiles[role].label}</span>
            </div>
          </div>
        </header>

        {/* Search overlay */}
        {searchOpen && (
          <div className="absolute top-14 left-60 right-0 z-50 bg-card border-b shadow-lg p-4 animate-slide-up">
            <div className="max-w-2xl mx-auto space-y-3">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent Searches</p>
              {["User-A7X3", "ORD-20260318-001", "iTunes"].map(q => (
                <button key={q} className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
                  <Search className="w-3 h-3" /> {q}
                </button>
              ))}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Quick Results</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <span className="status-badge bg-accent/10 text-accent">Customer</span>
                    <span className="text-sm">User-A7X3</span>
                    <span className="text-xs text-muted-foreground ml-auto">VIP · ₦450,000</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <span className="status-badge bg-primary/10 text-primary">Order</span>
                    <span className="text-sm">ORD-20260318-001</span>
                    <span className="text-xs text-muted-foreground ml-auto">Settled · iTunes US</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
