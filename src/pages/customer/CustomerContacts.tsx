import CustomerLayout from "@/components/customer/CustomerLayout";
import { customerContacts } from "@/data/mock";
import { Search, UserPlus, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CustomerContacts() {
  return (
    <CustomerLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold">Contacts</h1>
          <UserPlus className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by phone number..." className="pl-10 bg-muted border-0" />
        </div>

        {/* Invite Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Invite Friends</p>
            <p className="text-xs text-muted-foreground">Share your invite code and earn rewards</p>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8">Invite</Button>
        </div>

        {/* Support Contacts */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Agents</h2>
          <div className="space-y-1">
            {customerContacts.map(c => (
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

        {/* Phone search result */}
        <div className="border rounded-xl p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Search a phone number to find or invite friends</p>
          <p className="text-xs text-muted-foreground">If not registered, you can send an invite</p>
        </div>
      </div>
    </CustomerLayout>
  );
}
