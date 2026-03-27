import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle, Hash } from "lucide-react";

type TeamMessage = {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
  channel: string;
};

const CHANNELS = [
  { id: "general", label: "General", icon: Hash },
  { id: "abnormal-orders", label: "Abnormal Orders", icon: AlertTriangle },
];

const roleColors: Record<string, string> = {
  "Super Admin": "text-accent",
  "Team Lead": "text-primary",
  Agent: "text-warning",
  Finance: "text-success",
};

const initialMessages: TeamMessage[] = [
  { id: "1", sender: "Admin One", role: "Super Admin", text: "Team, please flag any orders with mismatched card values today.", time: "9:00 AM", channel: "general" },
  { id: "2", sender: "Sarah Lead", role: "Team Lead", text: "Noted. I'll brief the agents.", time: "9:02 AM", channel: "general" },
  { id: "3", sender: "Mike Agent", role: "Agent", text: "Got it 👍", time: "9:05 AM", channel: "general" },
  { id: "4", sender: "Femi Finance", role: "Finance", text: "Order #ORD-20260318-003 has a payout mismatch. Card value shows $200 but rate calc gives ₦180,000 instead of ₦215,200. Please review.", time: "10:15 AM", channel: "abnormal-orders" },
  { id: "5", sender: "Sarah Lead", role: "Team Lead", text: "Looking into it now. The rate may have been updated mid-transaction.", time: "10:18 AM", channel: "abnormal-orders" },
  { id: "6", sender: "Admin One", role: "Super Admin", text: "Confirmed — rate was changed at 10:14 AM. We'll honor the original rate for this order.", time: "10:22 AM", channel: "abnormal-orders" },
];

const roleProfiles: Record<string, { name: string; label: string }> = {
  super_admin: { name: "Admin One", label: "Super Admin" },
  team_lead: { name: "Sarah Lead", label: "Team Lead" },
  agent: { name: "Mike Agent", label: "Agent" },
  finance: { name: "Femi Finance", label: "Finance" },
};

export default function AdminTeamChat() {
  const { role } = useAdminRole();
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<TeamMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const profile = roleProfiles[role];
  const channelMessages = messages.filter(m => m.channel === activeChannel);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length, activeChannel]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: TeamMessage = {
      id: Date.now().toString(),
      sender: profile.name,
      role: profile.label,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel: activeChannel,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  return (
    <AdminLayout>
      <div className="flex h-full">
        {/* Channel sidebar */}
        <div className="w-52 border-r bg-muted/30 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-heading font-bold text-sm">Team Chat</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Internal communication</p>
          </div>
          <div className="p-2 space-y-1 flex-1">
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel === ch.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <ch.icon className="w-4 h-4 shrink-0" />
                {ch.label}
              </button>
            ))}
          </div>
          <div className="p-3 border-t">
            <p className="text-[10px] text-muted-foreground">Online: 4 members</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="h-12 border-b flex items-center px-4 gap-2 bg-card shrink-0">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {CHANNELS.find(c => c.id === activeChannel)?.label}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {channelMessages.length} messages
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {channelMessages.map(msg => {
              const isMe = msg.sender === profile.name;
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className={`text-xs font-bold ${roleColors[msg.role] || "text-foreground"}`}>
                      {msg.sender[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${isMe ? "text-accent" : "text-foreground"}`}>
                        {msg.sender}
                      </span>
                      <span className={`text-[10px] font-medium ${roleColors[msg.role] || "text-muted-foreground"}`}>
                        {msg.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 bg-card shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Message #${CHANNELS.find(c => c.id === activeChannel)?.label.toLowerCase() ?? ""}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1 bg-muted border-0"
              />
              <Button size="sm" onClick={handleSend} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
