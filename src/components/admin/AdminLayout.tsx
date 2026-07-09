import { ReactNode, useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, CreditCard, Settings, Users,
  TrendingUp, Search, Bell, ChevronDown, Shield, Globe, DollarSign,
  BarChart3, Send, FileText, BookOpen, LogOut, ShieldAlert, ShieldCheck,
  Sun, Moon, Wallet, Gift, ArrowDownToLine, Coins, Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { conversations, orders, cardRates, systemNairaRate, systemPriceControl } from "@/data/mock";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/admin", roles: ["super_admin", "team_lead", "agent"], badge: 5 },
  { id: "team-chat", label: "Team Chat", icon: MessageSquare, path: "/admin/team-chat", badge: 3 },
  { id: "customers", label: "Customers", icon: Users, path: "/admin/customers", roles: ["super_admin", "team_lead", "agent"] },
  { id: "card-rates", label: "Card Rates", icon: CreditCard, path: "/admin/card-rates", roles: ["super_admin", "team_lead", "agent"] },
  { id: "orders", label: "Orders", icon: FileText, path: "/admin/orders" },
  { id: "wallets", label: "Platform Wallet", icon: Wallet, path: "/admin/wallets", roles: ["super_admin", "finance"] },
  { id: "withdrawals", label: "Withdrawals", icon: ArrowDownToLine, path: "/admin/withdrawals", roles: ["super_admin", "team_lead", "finance"] },
  { id: "transfers", label: "Transfers", icon: Send, path: "/admin/transfers", roles: ["super_admin", "team_lead", "finance"] },
  { id: "naira-rate", label: "Points Rate", icon: Coins, path: "/admin/naira-rate", roles: ["super_admin", "team_lead", "finance"] },
  { id: "users", label: "User Management", icon: Users, path: "/admin/users", roles: ["super_admin"] },
  { id: "team", label: "Team Dashboard", icon: BarChart3, path: "/admin/team", roles: ["super_admin", "team_lead"] },
  { id: "ip-restrictions", label: "IP & Country", icon: ShieldCheck, path: "/admin/ip-restrictions", roles: ["super_admin"] },
  { id: "sensitive-words", label: "Sensitive Words", icon: ShieldAlert, path: "/admin/sensitive-words", roles: ["super_admin"] },
  { id: "api-config", label: "API Config", icon: Globe, path: "/admin/api-config", roles: ["super_admin"] },
  { id: "broadcast", label: "SMS Broadcast", icon: Send, path: "/admin/broadcast", roles: ["super_admin"] },
  { id: "ranking", label: "Volume Ranking", icon: TrendingUp, path: "/admin/ranking", roles: ["super_admin", "team_lead", "agent"] },
  { id: "rewards", label: "Rewards", icon: Gift, path: "/admin/rewards", roles: ["super_admin", "team_lead", "agent"] },
  { id: "customer-guide", label: "Customer Guide", icon: BookOpen, path: "/admin/customer-guide", roles: ["super_admin", "team_lead"] },
  { id: "guide", label: "Admin Guide", icon: BookOpen, path: "/admin/guide", roles: ["super_admin", "team_lead"] },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { role, setRole } = useAdminRole();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    let valid = false;
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        valid =
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.email === "string" &&
          ["super_admin", "team_lead", "agent", "finance"].includes(parsed.role);
      } catch {
        valid = false;
      }
    }
    if (!valid) {
      sessionStorage.removeItem("adminAuth");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin/login", { replace: true });
  };

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const roleProfiles: Record<string, { name: string; label: string }> = {
    super_admin: { name: "Admin One", label: "Super Admin" },
    team_lead: { name: "Sarah Lead", label: "Team Lead" },
    agent: { name: "Mike Agent", label: "Agent" },
    finance: { name: "Femi Finance", label: "Finance" },
  };

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return null;
    const q = searchQuery.toLowerCase();
    const customers = conversations.filter(c => c.alias.toLowerCase().includes(q));
    const matchedOrders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    const rates = cardRates.filter(r => r.cardType.toLowerCase().includes(q) || r.currency.toLowerCase().includes(q));
    const total = customers.length + matchedOrders.length + rates.length;
    return { customers, orders: matchedOrders, rates, total };
  }, [searchQuery]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="font-heading text-lg font-bold text-sidebar-primary">CardChat</h1>
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
                <span className="flex-1">{item.label}</span>
                {(item as any).badge && (
                  <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center shrink-0">
                    {(item as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">View as</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["super_admin", "team_lead", "agent", "finance"] as const).map(r => (
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
            <button
              onClick={() => navigate("/admin/profile")}
              className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold hover:ring-2 hover:ring-sidebar-primary/50 transition-all"
              title="My Profile"
            >
              {roleProfiles[role].name[0]}
            </button>
            <div className="flex-1 min-w-0">
              <button onClick={() => navigate("/admin/profile")} className="block text-left hover:text-sidebar-primary transition-colors">
                <p className="text-sm font-medium truncate">{roleProfiles[role].name}</p>
                <p className="text-xs text-sidebar-foreground/50">{roleProfiles[role].label}</p>
              </button>
            </div>
            <button onClick={handleLogout} className="text-sidebar-foreground/50 hover:text-destructive transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
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
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => { setSearchOpen(false); }, 200)}
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Current Points Rate & Price Control */}
            {(role === "agent" || role === "super_admin" || role === "team_lead") && (
              <div className="flex items-center gap-3 border-r pr-4 mr-1">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] text-muted-foreground">Points Rate</span>
                  <span className="text-xs font-bold text-foreground">{systemNairaRate.toLocaleString()}</span>
                </div>
                {/* Price Control hidden for Agent role */}
                {role !== "agent" && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] text-muted-foreground">Price Control</span>
                    <span className="text-xs font-bold text-foreground">{systemPriceControl.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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
              {!searchResults ? (
                <>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent Searches</p>
                  {["A7X3KP", "ORD-20260318-001", "iTunes"].map(q => (
                    <button key={q} onClick={() => setSearchQuery(q)} className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
                      <Search className="w-3 h-3" /> {q}
                    </button>
                  ))}
                </>
              ) : searchResults.total === 0 ? (
                <div className="text-center py-6">
                  <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <>
                  {searchResults.customers.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                        Customers ({searchResults.customers.length})
                      </p>
                      <div className="space-y-1">
                        {searchResults.customers.map(c => (
                          <button
                            key={c.id}
                            onMouseDown={() => navigate(`/admin/chat/${c.id}`)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer text-left"
                          >
                            <span className="status-badge bg-accent/10 text-accent text-[10px]">Customer</span>
                            <span className="text-sm font-medium">{c.alias}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{c.tags.join(", ")} · {c.totalValue}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                        Orders ({searchResults.orders.length})
                      </p>
                      <div className="space-y-1">
                        {searchResults.orders.map(o => (
                          <button
                            key={o.id}
                            onMouseDown={() => navigate("/admin/orders")}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer text-left"
                          >
                            <span className="status-badge bg-primary/10 text-primary text-[10px]">Order</span>
                            <span className="text-sm font-medium">{o.id}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{o.status.replace("_", " ")} · {o.cardType}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.rates.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                        Card Rates ({searchResults.rates.length})
                      </p>
                      <div className="space-y-1">
                        {searchResults.rates.map(r => (
                          <button
                            key={r.id}
                            onMouseDown={() => navigate("/admin/card-rates")}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer text-left"
                          >
                            <span className="status-badge bg-warning/10 text-warning text-[10px]">Rate</span>
                            <span className="text-sm font-medium">{r.cardType}</span>
                            <span className="text-xs text-muted-foreground ml-auto inline-flex items-center gap-1">{r.cardFormat} · <Coins className="w-3 h-3" />{r.sellRate}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
