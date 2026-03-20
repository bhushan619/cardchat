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
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarred(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
                {items.map(c => {
                  const isHovered = hoveredId === c.id;
                  const isStarred = starred.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/admin/chat/${c.id}`)}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors relative ${
                        c.status === "pending" ? "bg-warning/5 border-l-2 border-l-warning" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {c.alias.slice(-2)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold">{c.alias}</span>
                            {isStarred && <Star className="w-3 h-3 text-warning inline ml-1 fill-warning" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(isHovered || isStarred) && (
                            <button
                              onClick={(e) => toggleStar(e, c.id)}
                              className="text-muted-foreground hover:text-warning transition-colors"
                            >
                              <Star className={`w-3.5 h-3.5 ${isStarred ? "text-warning fill-warning" : ""}`} />
                            </button>
                          )}
                          <span className="text-[10px] text-muted-foreground">{c.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{c.lastMessage}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-accent font-medium">{c.goodRate}% rate</span>
                          <span className="text-[10px] text-muted-foreground">· {c.totalValue}</span>
                        </div>
                        {c.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-semibold">{c.unread}</span>
                        )}
                      </div>
                      {c.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {c.tags.map(t => (
                            <span key={t} className="status-badge bg-primary/5 text-primary text-[10px]">{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Hover details */}
                      {isHovered && (
                        <div className="mt-2 pt-2 border-t border-dashed border-muted-foreground/20 grid grid-cols-3 gap-2 text-[10px] animate-slide-up">
                          <div>
                            <p className="text-muted-foreground">Good Rate</p>
                            <p className="font-semibold">{c.goodRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Value</p>
                            <p className="font-semibold">{c.totalValue}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="font-semibold">{c.totalValue}</p>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
