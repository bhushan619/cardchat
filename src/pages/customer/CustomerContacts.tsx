import CustomerLayout from "@/components/customer/CustomerLayout";
import { customerContacts } from "@/data/mock";
import { Search, MessageCircle, Zap, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AgentStatus = "online" | "busy" | "saturated";

const statusConfig: Record<AgentStatus, { label: string; color: string; dotClass: string; icon: React.ElementType; description: string }> = {
  online: {
    label: "Instant Reply",
    color: "bg-success/15 text-success border-success/30",
    dotClass: "bg-success",
    icon: Zap,
    description: "Available now",
  },
  busy: {
    label: "Potential Delay",
    color: "bg-warning/15 text-warning border-warning/30",
    dotClass: "bg-warning",
    icon: Clock,
    description: "May take a moment",
  },
  saturated: {
    label: "Heavily Occupied",
    color: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
    dotClass: "bg-muted-foreground",
    icon: AlertCircle,
    description: "Long wait expected",
  },
};

// Map mock statuses to the new 3-tier system
function getAgentStatus(agent: typeof customerContacts[number]): AgentStatus {
  if (agent.status === "online") return "online";
  if (agent.status === "away") return "busy";
  return "saturated";
}

// Sort: online first, busy second, saturated last
const statusOrder: Record<AgentStatus, number> = { online: 0, busy: 1, saturated: 2 };

export default function CustomerContacts() {
  const [filter, setFilter] = useState("");
  const [saturatedAgent, setSaturatedAgent] = useState<typeof customerContacts[number] | null>(null);
  const navigate = useNavigate();

  const filtered = customerContacts
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => statusOrder[getAgentStatus(a)] - statusOrder[getAgentStatus(b)]);

  const availableAgents = filtered.filter(c => getAgentStatus(c) === "online");

  const handleAgentClick = (agent: typeof customerContacts[number]) => {
    const status = getAgentStatus(agent);
    if (status === "saturated") {
      setSaturatedAgent(agent);
    } else {
      navigate(`/customer/agent/${agent.id}`);
    }
  };

  const handleProceedAnyway = () => {
    if (saturatedAgent) {
      navigate(`/customer/agent/${saturatedAgent.id}`);
      setSaturatedAgent(null);
    }
  };

  const handleTryAvailable = () => {
    setSaturatedAgent(null);
    // Scroll to top where available agents are
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CustomerLayout>
      <div className="p-4 space-y-4">
        <h1 className="font-heading text-xl font-bold">Agents</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by agent name..."
            className="pl-10 bg-muted border-0"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-2">
          {(["online", "busy", "saturated"] as AgentStatus[]).map(s => {
            const cfg = statusConfig[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Agents</h2>
          <div className="space-y-1">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No agents match your search</p>
            )}
            {filtered.map(c => {
              const status = getAgentStatus(c);
              const cfg = statusConfig[status];
              const Icon = cfg.icon;
              const isSaturated = status === "saturated";

              return (
                <div
                  key={c.id}
                  onClick={() => handleAgentClick(c)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                    isSaturated ? "opacity-60 hover:opacity-80 hover:bg-muted/50" : "hover:bg-muted"
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSaturated ? "bg-muted" : "bg-primary/10"
                    }`}>
                      <span className={`font-bold text-sm ${isSaturated ? "text-muted-foreground" : "text-primary"}`}>
                        {c.name[0]}
                      </span>
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${cfg.dotClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: "inherit" }} />
                      <span className="text-xs text-muted-foreground">{cfg.description}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${cfg.color} shrink-0`}>
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saturated agent pop-up notice */}
      <Dialog open={!!saturatedAgent} onOpenChange={open => !open && setSaturatedAgent(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              Agent Heavily Occupied
            </DialogTitle>
            <DialogDescription>
              <strong>{saturatedAgent?.name}</strong> is currently handling many conversations
              and response times may be significantly longer.
              {availableAgents.length > 0 && (
                <span className="block mt-2">
                  For faster service, try one of the <strong>{availableAgents.length} available</strong> agent{availableAgents.length > 1 ? "s" : ""} marked with <span className="text-success font-medium">"Instant Reply"</span>.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {availableAgents.length > 0 && (
              <Button onClick={handleTryAvailable} className="w-full">
                Try an Available Agent
              </Button>
            )}
            <Button variant="outline" onClick={handleProceedAnyway} className="w-full">
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
