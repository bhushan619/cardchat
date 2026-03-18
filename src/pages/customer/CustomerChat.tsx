import { useState } from "react";
import CustomerLayout from "@/components/customer/CustomerLayout";
import CustomerChatView from "@/pages/customer/CustomerChatView";
import { MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const chatList = [
  { id: "1", name: "LightChat Support", lastMsg: "Cards verified ✅ Order created.", time: "10:38 AM", unread: 1, hasOrder: true },
  { id: "2", name: "Agent Mike", lastMsg: "How can I help you today?", time: "Yesterday", unread: 0, hasOrder: false },
];

export default function CustomerChat() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  if (selectedChat) {
    return <CustomerChatView onBack={() => setSelectedChat(null)} />;
  }

  return (
    <CustomerLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold">Chats</h1>
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-10 bg-muted border-0" />
        </div>
        <div className="space-y-1">
          {chatList.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-bold text-sm">{chat.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{chat.name}</p>
                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate pr-2">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center shrink-0">{chat.unread}</span>
                  )}
                </div>
                {chat.hasOrder && (
                  <span className="inline-block mt-1 text-[10px] text-warning font-medium bg-warning/10 px-2 py-0.5 rounded-full">📌 Active Order</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
