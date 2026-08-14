import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Users, Send, Smile, Paperclip } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { WhatsAppGroup, GroupMessage } from "@/data/mock";

/** Small pill showing whether a WhatsApp sender is a known customer. */
function ParticipantBadge({ alias }: { alias: string | null }) {
  if (alias) {
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold leading-none whitespace-nowrap">
        {alias}
      </span>
    );
  }
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium leading-none whitespace-nowrap">
      Not a customer
    </span>
  );
}

/** Two overlapping circles — group avatar. */
export function GroupAvatar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400`}
    >
      <Users className="w-4 h-4" />
    </div>
  );
}

export function GroupThread({
  group,
  messages,
  highlightId,
  systemMessages = [],
  actions,
}: {
  group: WhatsAppGroup;
  messages: GroupMessage[];
  highlightId: number | null;
  /** System notices (order created, transfer executed, ...) appended to the thread. */
  systemMessages?: { id: number; text: string; time: string }[];
  /** Action buttons rendered in the composer (Points +/-, Transfer). */
  actions?: ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<GroupMessage[]>(messages);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMessages(messages);
    setMessage("");
  }, [messages, group.id]);

  useEffect(() => {
    if (highlightId == null) return;
    const el = containerRef.current?.querySelector(`[data-msg-id="${highlightId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  const send = () => {
    if (!message.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "agent",
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setMessage("");
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 border-b bg-card shrink-0 h-12">
        <div className="flex items-center gap-3">
          <GroupAvatar />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold whitespace-nowrap">{group.groupName}</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium leading-none whitespace-nowrap">
                WhatsApp Group
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{group.participants.length} members</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {localMessages.map((msg) => {
          const isAgent = msg.sender === "agent";
          const p = group.participants.find((x) => x.id === msg.participantId);
          const highlighted = highlightId === msg.id;
          return (
            <div key={msg.id} data-msg-id={msg.id} className={isAgent ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`${isAgent ? "chat-bubble-self" : "chat-bubble-other"} ${
                  highlighted ? "ring-2 ring-accent ring-offset-2 ring-offset-background rounded-lg" : ""
                }`}
              >
                {!isAgent && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-primary">{p?.waName || "Unknown"}</span>
                    <ParticipantBadge alias={p?.alias ?? null} />
                  </div>
                )}
                <p>{msg.text}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{msg.time}</p>
              </div>
            </div>
          );
        })}
        {systemMessages.map((m) => (
          <div key={`sys-${m.id}`} className="flex justify-center">
            <div className="max-w-[80%] text-center text-[11px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
              {m.text} <span className="opacity-60 ml-1">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="border-t bg-card shrink-0">
        <div className="flex flex-col gap-2 px-4 py-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message the group..."
            className="w-full rounded-md border-0 bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            style={{ height: "7rem" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Attach image"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start" side="top">
                  <div className="grid grid-cols-8 gap-1">
                    {["😀", "😂", "😍", "👍", "🎉", "🔥", "✅", "❤️", "😊", "🙏", "💯", "😎", "👏", "💪", "⭐", "😢"].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          className="text-xl hover:bg-muted rounded p-1 transition-colors"
                          onClick={() => setMessage((prev) => prev + emoji)}
                        >
                          {emoji}
                        </button>
                      ),
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0"
              onClick={send}
            >
              <Send className="w-4 h-4 text-accent-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
