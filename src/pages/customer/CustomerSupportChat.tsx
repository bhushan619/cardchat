import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Headset, Send } from "lucide-react";
import Logo from "@/components/Logo";

interface ChatMessage {
  id: number;
  from: "support" | "customer";
  text: string;
  time: string;
}

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function CustomerSupportChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "support",
      text: "Hi there! You've reached CardChat sign-in support.",
      time: now(),
    },
    {
      id: 2,
      from: "support",
      text: email
        ? `We can see you're trying to sign in with ${email}. Tell us what's going wrong and we'll help you get back in.`
        : "Tell us what's going wrong with signing in and we'll help you get back in.",
      time: now(),
    },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "customer", text, time: now() },
    ]);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background border-x">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <button
          onClick={() => navigate("/customer/auth")}
          aria-label="Return to login"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 shrink-0">
            <Headset className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold text-sm leading-tight">Sign-in Support</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Online
            </p>
          </div>
        </div>
        <Logo className="h-7 w-7 shrink-0" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.from === "customer"
                  ? "bg-accent text-accent-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm"
              }`}
            >
              <p>{m.text}</p>
              <p
                className={`mt-1 text-[10px] ${
                  m.from === "customer" ? "text-accent-foreground/70" : "text-muted-foreground"
                }`}
              >
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Composer + return to login */}
      <div className="border-t px-4 py-3 space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="h-11"
          />
          <Button
            size="icon"
            className="h-11 w-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={send}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full h-11 bg-transparent border-border !text-foreground hover:!bg-accent/10 hover:!text-accent hover:!border-accent/40"
          onClick={() => navigate("/customer/auth")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Return to login
        </Button>
      </div>
    </div>
  );
}
