import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, ArrowLeft, MessageCircle } from "lucide-react";

type TeamMessage = {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
};

type DMMessage = {
  id: string;
  sender: string;
  text: string;
  time: string;
};

const roleColors: Record<string, string> = {
  "Super Admin": "text-accent",
  "Team Lead": "text-primary",
  Agent: "text-warning",
  Finance: "text-success",
};

const statusColors: Record<string, string> = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-muted-foreground/40",
};

const teamMembers = [
  { name: "Admin One", role: "Super Admin", status: "online" },
  { name: "Sarah Lead", role: "Team Lead", status: "online" },
  { name: "Mike Agent", role: "Agent", status: "online" },
  { name: "Femi Finance", role: "Finance", status: "online" },
  { name: "John Agent", role: "Agent", status: "away" },
  { name: "Lisa Agent", role: "Agent", status: "offline" },
];

const initialMessages: TeamMessage[] = [
  { id: "1", sender: "Admin One", role: "Super Admin", text: "Team, please flag any orders with mismatched card values today.", time: "9:00 AM" },
  { id: "2", sender: "Sarah Lead", role: "Team Lead", text: "Noted. I'll brief the agents.", time: "9:02 AM" },
  { id: "3", sender: "Mike Agent", role: "Agent", text: "Got it 👍", time: "9:05 AM" },
  { id: "4", sender: "Femi Finance", role: "Finance", text: "Order #ORD-20260318-003 has a payout mismatch. Card value shows $200 but rate calc gives ₦180,000 instead of ₦215,200. Please review.", time: "10:15 AM" },
  { id: "5", sender: "Sarah Lead", role: "Team Lead", text: "Looking into it now. The rate may have been updated mid-transaction.", time: "10:18 AM" },
  { id: "6", sender: "Admin One", role: "Super Admin", text: "Confirmed — rate was changed at 10:14 AM. We'll honor the original rate for this order.", time: "10:22 AM" },
];

// Seed DM conversations
const initialDMs: Record<string, DMMessage[]> = {
  "Admin One": [
    { id: "dm1", sender: "Femi Finance", text: "Hi, can you check Order #ORD-20260318-003? The payout seems off.", time: "10:10 AM" },
    { id: "dm2", sender: "Admin One", text: "Sure, let me look into it.", time: "10:12 AM" },
  ],
  "Sarah Lead": [
    { id: "dm3", sender: "Sarah Lead", text: "Femi, I'll need the breakdown for today's reconciliation.", time: "11:00 AM" },
  ],
};

const roleProfiles: Record<string, { name: string; label: string }> = {
  super_admin: { name: "Admin One", label: "Super Admin" },
  team_lead: { name: "Sarah Lead", label: "Team Lead" },
  agent: { name: "Mike Agent", label: "Agent" },
  finance: { name: "Femi Finance", label: "Finance" },
};

export default function AdminTeamChat() {
  const { role } = useAdminRole();
  const [messages, setMessages] = useState<TeamMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [dmConversations, setDmConversations] = useState<Record<string, DMMessage[]>>(initialDMs);
  const [dmInput, setDmInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const dmBottomRef = useRef<HTMLDivElement>(null);

  const profile = roleProfiles[role];
  const onlineCount = teamMembers.filter(m => m.status === "online").length;

  // Filter out self from members list
  const otherMembers = teamMembers.filter(m => m.name !== profile.name);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    dmBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmTarget, dmConversations]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: TeamMessage = {
      id: Date.now().toString(),
      sender: profile.name,
      role: profile.label,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  const handleDmSend = () => {
    if (!dmInput.trim() || !dmTarget) return;
    const newMsg: DMMessage = {
      id: Date.now().toString(),
      sender: profile.name,
      text: dmInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setDmConversations(prev => ({
      ...prev,
      [dmTarget]: [...(prev[dmTarget] || []), newMsg],
    }));
    setDmInput("");
  };

  const dmMessages = dmTarget ? (dmConversations[dmTarget] || []) : [];
  const dmMember = dmTarget ? teamMembers.find(m => m.name === dmTarget) : null;

  return (
    <AdminLayout>
      <div className="flex h-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {dmTarget ? (
            <>
              {/* DM Header */}
              <div className="h-12 border-b flex items-center px-4 gap-3 bg-card shrink-0">
                <button onClick={() => { setDmTarget(null); setDmInput(""); }} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <span className={`text-[10px] font-bold ${roleColors[dmMember?.role || ""] || "text-foreground"}`}>
                      {dmTarget[0]}
                    </span>
                  </div>
                  {dmMember && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card ${statusColors[dmMember.status]}`} />
                  )}
                </div>
                <div>
                  <span className="font-medium text-sm">{dmTarget}</span>
                  <span className={`ml-2 text-[10px] font-medium ${roleColors[dmMember?.role || ""] || "text-muted-foreground"}`}>
                    {dmMember?.role}
                  </span>
                </div>
              </div>

              {/* DM Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {dmMessages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                )}
                {dmMessages.map(msg => {
                  const isMe = msg.sender === profile.name;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 ${
                        isMe ? "bg-accent text-accent-foreground" : "bg-muted"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? "text-accent-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={dmBottomRef} />
              </div>

              {/* DM Input */}
              <div className="border-t p-3 bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Message ${dmTarget}...`}
                    value={dmInput}
                    onChange={e => setDmInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleDmSend()}
                    className="flex-1 bg-muted border-0"
                  />
                  <Button size="sm" onClick={handleDmSend} disabled={!dmInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Group Header */}
              <div className="h-12 border-b flex items-center px-4 gap-2 bg-card shrink-0">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Team Chat</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {messages.length} messages
                </span>
              </div>

              {/* Group Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
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

              {/* Group Input */}
              <div className="border-t p-3 bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Message the team..."
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
            </>
          )}
        </div>

        {/* Members panel */}
        <div className="w-52 border-l bg-muted/30 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h3 className="font-heading font-bold text-sm">Members</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{onlineCount} online · {teamMembers.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {otherMembers
              .sort((a, b) => {
                const order = { online: 0, away: 1, offline: 2 };
                return (order[a.status as keyof typeof order] ?? 2) - (order[b.status as keyof typeof order] ?? 2);
              })
              .map(member => (
                <button
                  key={member.name}
                  onClick={() => { setDmTarget(member.name); setDmInput(""); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                    dmTarget === member.name
                      ? "bg-accent/10"
                      : member.status === "offline"
                        ? "opacity-50 hover:opacity-70"
                        : "hover:bg-muted"
                  }`}
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <span className={`text-[10px] font-bold ${roleColors[member.role] || "text-foreground"}`}>
                        {member.name[0]}
                      </span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-muted/30 ${statusColors[member.status]}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{member.name}</p>
                    <p className={`text-[10px] ${roleColors[member.role] || "text-muted-foreground"}`}>{member.role}</p>
                  </div>
                  <MessageCircle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                </button>
              ))}
          </div>
          {dmTarget && (
            <div className="p-2 border-t">
              <button
                onClick={() => { setDmTarget(null); setDmInput(""); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Back to Group
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
