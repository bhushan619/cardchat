import CustomerLayout from "@/components/customer/CustomerLayout";
import { customerContacts } from "@/data/mock";
import { Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CustomerContacts() {
  const [filter, setFilter] = useState("");
  const filtered = customerContacts.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

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

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Agents</h2>
          <div className="space-y-1">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No agents match your search</p>
            )}
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{c.name[0]}</span>
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                    c.status === "online" ? "bg-success" : "bg-warning"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.lastSeen}</p>
                </div>
                <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
