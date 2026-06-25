import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Monitor, Maximize2, X, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminScreens = [
  { name: "Messages", path: "/admin", description: "Customer conversations & chat management" },
  { name: "Team Chat", path: "/admin/team-chat", description: "Internal team communication" },
  { name: "Customers", path: "/admin/customers", description: "Customer profiles & history" },
  { name: "Card Rates", path: "/admin/card-rates", description: "Gift card rate configuration" },
  { name: "Orders", path: "/admin/orders", description: "Order management & tracking" },
  { name: "Platform Wallet", path: "/admin/wallets", description: "Wallet balances & transactions" },
  { name: "Naira Rate", path: "/admin/naira-rate", description: "System-wide naira rate config" },
  { name: "User Management", path: "/admin/users", description: "Admin user accounts & roles" },
  { name: "Team Dashboard", path: "/admin/team", description: "Agent performance & metrics" },
  { name: "Volume Ranking", path: "/admin/ranking", description: "Customer trade volume leaderboard" },
  { name: "Rewards", path: "/admin/rewards", description: "Ranking rewards management" },
  { name: "IP & Country", path: "/admin/ip-restrictions", description: "IP whitelisting & country blocks" },
  { name: "Sensitive Words", path: "/admin/sensitive-words", description: "Chat content filtering" },
  { name: "API Config", path: "/admin/api-config", description: "Third-party API integrations" },
  { name: "SMS Broadcast", path: "/admin/broadcast", description: "Bulk SMS to customers" },
  { name: "Customer Guide", path: "/admin/customer-guide", description: "Customer-facing help content" },
  { name: "Admin Guide", path: "/admin/guide", description: "Internal admin documentation" },
  { name: "Profile", path: "/admin/profile", description: "Admin profile & settings" },
];

export default function AdminScreensGallery() {
  const navigate = useNavigate();
  const [selectedScreen, setSelectedScreen] = useState<typeof adminScreens[0] | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Require prior admin authentication; never auto-grant access from this page.
  useEffect(() => {
    if (!sessionStorage.getItem("adminAuth")) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Panel Screens</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {adminScreens.length} screens · Click to preview full-size
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-1.5"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1.5"
            >
              <List className="w-3.5 h-3.5" />
              List
            </Button>
          </div>
        </div>
      </header>

      {/* Grid View */}
      <div className="max-w-[1600px] mx-auto p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {adminScreens.map((screen) => (
              <div
                key={screen.path}
                className="group bg-card border rounded-xl overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedScreen(screen)}
              >
                {/* Preview iframe */}
                <div className="relative w-full aspect-[16/10] bg-muted overflow-hidden">
                  <iframe
                    src={screen.path}
                    className="absolute inset-0 w-[1920px] h-[1200px] origin-top-left pointer-events-none border-0"
                    style={{ transform: "scale(0.27)", transformOrigin: "top left" }}
                    title={screen.name}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-accent text-accent-foreground text-[10px] px-2 py-1 rounded-md font-medium flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> Preview
                    </span>
                  </div>
                </div>
                {/* Label */}
                <div className="p-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{screen.name}</p>
                      <p className="text-[11px] text-muted-foreground">{screen.description}</p>
                    </div>
                    <Monitor className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">{screen.path}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {adminScreens.map((screen) => (
              <div
                key={screen.path}
                className="group bg-card border rounded-xl p-4 flex items-center gap-4 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedScreen(screen)}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{screen.name}</p>
                  <p className="text-xs text-muted-foreground">{screen.description}</p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/60">{screen.path}</span>
                <Button variant="ghost" size="sm" className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" /> View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-size Preview Modal */}
      {selectedScreen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-5 py-3 bg-card border-b shrink-0">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-accent" />
              <span className="font-semibold text-sm">{selectedScreen.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{selectedScreen.path}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(selectedScreen.path, "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedScreen(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={selectedScreen.path}
              className="w-full h-full border-0"
              title={selectedScreen.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}
