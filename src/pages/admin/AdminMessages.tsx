import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { conversations } from "@/data/mock";
import { useNavigate } from "react-router-dom";

const columns = [
  { id: "consulting", label: "CONSULTING", color: "text-accent" },
  { id: "trading", label: "TRADING", color: "text-warning" },
  { id: "pending", label: "PENDING PAYMENT", color: "text-destructive" },
];

export default function AdminMessages() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="flex h-full">
        {columns.map(col => {
          const items = conversations.filter(c => c.status === col.id);
          return (
            <div key={col.id} className="flex-1 border-r border-border last:border-r-0 flex flex-col min-w-0">
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className={`text-xs font-bold tracking-wider ${col.color}`}>{col.label}</span>
                <span className="text-[11px] text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto">
                {items.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/admin/chat/${c.id}`)}
                    className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors"
                  >
                    {/* Top row: avatar + alias | time */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                          {c.alias.slice(-2)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{c.alias}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>

                    {/* Last message */}
                    <p className="text-xs text-muted-foreground truncate mb-2 pl-[38px]">{c.lastMessage}</p>

                    {/* Rate + value row */}
                    <div className="flex items-center justify-between pl-[38px]">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-accent font-medium">{c.goodRate}% rate</span>
                        <span className="text-[11px] text-muted-foreground">· {c.totalValue}</span>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                          {c.unread}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {c.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 pl-[38px]">
                        {c.tags.map(t => (
                          <span
                            key={t}
                            className="text-[10px] font-medium text-accent bg-accent/10 rounded px-1.5 py-0.5"
                          >
                            {t}
                          </span>
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
