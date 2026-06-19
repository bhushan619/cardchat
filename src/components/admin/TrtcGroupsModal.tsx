import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users, UserPlus, UserMinus, Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { adminUsers } from "@/data/mock";
import {
  TrtcGroup,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  onGroupsChanged,
} from "@/lib/trtcGroups";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const roleColor: Record<string, string> = {
  super_admin: "text-accent",
  team_lead: "text-warning",
  agent: "text-primary",
  finance: "text-success",
};

export default function TrtcGroupsModal({ open, onOpenChange }: Props) {
  const [groups, setGroups] = useState<TrtcGroup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<TrtcGroup | null>(null);

  const refresh = () => {
    const g = getGroups();
    setGroups(g);
    setActiveId(prev => (prev && g.some(x => x.id === prev) ? prev : g[0]?.id ?? null));
  };

  useEffect(() => { if (open) refresh(); }, [open]);
  useEffect(() => onGroupsChanged(refresh), []);

  const active = useMemo(() => groups.find(g => g.id === activeId) || null, [groups, activeId]);

  const filteredUsers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return adminUsers.filter(u =>
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [memberSearch]);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Group name is required"); return; }
    const g = createGroup(newName, newDesc, []);
    setNewName(""); setNewDesc(""); setCreating(false);
    setActiveId(g.id);
    toast.success(`Group "${g.name}" created`);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteGroup(confirmDelete.id);
    toast.success(`Group "${confirmDelete.name}" deleted`);
    setConfirmDelete(null);
  };

  const handleRename = (name: string) => {
    if (!active) return;
    updateGroup(active.id, { name });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" /> Manage TRTC Groups
            </DialogTitle>
            <DialogDescription>
              Create groups, assign members, and they will appear in the Team Chat page.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[220px_1fr] h-[520px]">
            {/* Group list */}
            <div className="border-r bg-muted/30 flex flex-col">
              <div className="p-3 border-b">
                <Button
                  size="sm"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
                  onClick={() => { setCreating(true); setNewName(""); setNewDesc(""); }}
                >
                  <Plus className="w-3.5 h-3.5" /> New Group
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { setActiveId(g.id); setCreating(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeId === g.id && !creating ? "bg-accent/10" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium truncate flex-1">{g.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-5 mt-0.5">{g.memberIds.length} members</p>
                  </button>
                ))}
                {groups.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-6 px-2">No groups yet. Create one to get started.</p>
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div className="flex flex-col min-h-0">
              {creating ? (
                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                  <h3 className="text-sm font-semibold">Create New Group</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Group name</label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Night Shift" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Description</label>
                    <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCreate}>
                      Create Group
                    </Button>
                  </div>
                </div>
              ) : active ? (
                <>
                  <div className="px-5 py-3 border-b space-y-2">
                    <Input
                      value={active.name}
                      onChange={e => handleRename(e.target.value)}
                      className="h-8 text-sm font-semibold border-transparent hover:border-input focus-visible:border-input"
                    />
                    <Input
                      value={active.description || ""}
                      onChange={e => updateGroup(active.id, { description: e.target.value })}
                      placeholder="Add a description..."
                      className="h-7 text-xs text-muted-foreground border-transparent hover:border-input focus-visible:border-input"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {active.memberIds.length} / {adminUsers.length} members
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                        onClick={() => setConfirmDelete(active)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Group
                      </Button>
                    </div>
                  </div>

                  <div className="px-5 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        value={memberSearch}
                        onChange={e => setMemberSearch(e.target.value)}
                        placeholder="Search users..."
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {filteredUsers.map(u => {
                      const inGroup = active.memberIds.includes(u.id);
                      return (
                        <div key={u.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                            {u.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{u.name}</p>
                            <p className={`text-[10px] ${roleColor[u.role] || "text-muted-foreground"}`}>
                              {u.role.replace("_", " ")}
                            </p>
                          </div>
                          {inGroup ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeMember(active.id, u.id)}
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Remove
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-accent hover:text-accent"
                              onClick={() => addMember(active.id, u.id)}
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Add
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Select a group or create a new one
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Delete "{confirmDelete?.name}"? Members will lose access to this chat group. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
