import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations } from "@/data/mock";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Star, Tag } from "lucide-react";

const columns = [
  { id: "consulting", label: "Consulting", color: "text-accent" },
  { id: "trading", label: "Trading", color: "text-warning" },
  { id: "pending", label: "Pending Payment", color: "text-destructive" },
];

export default function AdminMessages() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="flex h-full">
        {columns.map(col => {
          const items = conversations.filter(c => c.status === col.id);
          return (
            <div key={col.id} className="flex-1 border-r last:border-r-0 flex flex-col min-w-0">
              <div className="column-header flex items-center justify-between">
                <span className={col.color}>{col.label}</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {items.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/admin/chat/${c.id}`)}
                    className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                      c.status === "pending" ? "bg-warning/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.alias.slice(-2)}
                        </div>
                        <span className="text-sm font-semibold">{c.alias}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">{c.lastMessage}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-accent font-medium">{c.goodRate}% rate</span>
                        <span className="text-[10px] text-muted-foreground">· {c.totalValue}</span>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center">{c.unread}</span>
                      )}
                    </div>
                    {c.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {c.tags.map(t => (
                          <span key={t} className="status-badge bg-primary/5 text-primary text-[10px]">{t}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
