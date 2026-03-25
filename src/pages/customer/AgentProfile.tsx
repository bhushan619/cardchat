import { useParams, useNavigate } from "react-router-dom";
import { customerContacts } from "@/data/mock";
import { ArrowLeft, MessageCircle, Phone, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AgentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = customerContacts.find(c => String(c.id) === id);

  if (!agent) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x items-center justify-center gap-4">
        <p className="text-muted-foreground">Agent not found</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const isOnline = agent.status === "online";

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Header with gradient backdrop */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background pt-12 pb-8 px-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-card flex items-center justify-center shadow-lg">
              <span className="text-primary font-bold text-3xl">{agent.name[0]}</span>
            </div>
            <span
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-card ${
                isOnline ? "bg-success" : "bg-warning"
              }`}
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.lastSeen}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 py-4 px-4">
        <Button
          onClick={() => navigate("/customer/chat")}
          className="flex-1 gap-2 rounded-xl h-12"
        >
          <MessageCircle className="w-5 h-5" />
          Message
        </Button>
        <button className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <Separator />

      {/* Info sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* About */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About</h2>
          <p className="text-sm text-foreground">
            {agent.name === "LightChat Support"
              ? "Official LightChat support channel. Available 24/7 for all your gift card trading needs."
              : `Hi, I'm ${agent.name}. I'm here to help you with your gift card trades.`}
          </p>
        </section>

        {/* Details */}
        <section className="space-y-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden divide-y divide-border">
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-foreground">
                  {agent.name === "LightChat Support" ? "Official Support" : "Support Agent"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className="text-sm font-medium text-foreground">
                  {isOnline ? "Available now" : agent.lastSeen}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-sm font-medium text-foreground">4.8 / 5.0</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {["iTunes", "Amazon", "Steam", "Google Play"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
