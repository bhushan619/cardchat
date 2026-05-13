import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminUsers as initialUsers } from "@/data/mock";
import { Users, Plus, Search, MoreVertical, Shield, X, Lock, Eye, EyeOff, Check, Mail, Copy, ExternalLink, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type User = {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "team_lead" | "agent" | "finance";
  status: "active" | "offline" | "suspended";
  lastLogin: string;
};

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-accent/10 text-accent" },
  team_lead: { label: "Team Lead", color: "bg-warning/10 text-warning" },
  agent: { label: "Agent", color: "bg-primary/10 text-primary" },
  finance: { label: "Finance", color: "bg-success/10 text-success" },
};

const PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "View All Chats", "Manage Customers", "Manage Card Rates", "Process Orders",
    "Platform Wallet", "Set Naira Rate", "Manage Users", "Team Dashboard",
    "IP & Country Restrictions", "Sensitive Words", "API Config", "SMS Broadcast",
    "Volume Ranking", "Rewards", "Customer Guide", "Admin Guide", "Team Chat",
    "Manage Transaction PINs",
  ],
  team_lead: [
    "View Team Chats", "Manage Customers", "Manage Card Rates", "Process Orders",
    "Set Naira Rate", "Team Dashboard", "Volume Ranking", "Rewards",
    "Customer Guide", "Admin Guide", "Team Chat",
  ],
  agent: [
    "View Assigned Chats", "View Customers", "View Card Rates", "Process Orders",
    "Volume Ranking", "Rewards", "Customer Guide", "Admin Guide", "Team Chat",
  ],
  finance: [
    "View Orders (Read-only)", "Platform Wallet", "Set Naira Rate",
    "Team Chat",
  ],
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers.map(u => ({ ...u, status: u.status as User["status"] })));
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [suspendUser, setSuspendUser] = useState<User | null>(null);

  // Password invite (simulated email)
  const [inviteModal, setInviteModal] = useState<{ user: User; token: string; resent?: boolean } | null>(null);

  // PIN management
  const [pinUser, setPinUser] = useState<User | null>(null);
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPinNew, setShowPinNew] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<User["role"]>("agent");

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("agent");
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setModalOpen(true);
  };

  const issueInvite = (user: User, resent = false) => {
    const token = `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const list = (() => {
      try { return JSON.parse(sessionStorage.getItem("cc_password_invites") || "[]"); }
      catch { return []; }
    })();
    // Invalidate any prior invites for this user
    const filtered = list.filter((i: { userId: number }) => i.userId !== user.id);
    filtered.push({
      token, userId: user.id, name: user.name, email: user.email, role: user.role, createdAt: Date.now(),
    });
    sessionStorage.setItem("cc_password_invites", JSON.stringify(filtered));
    setInviteModal({ user, token, resent });
    toast.success(resent
      ? `Password setup email resent to ${user.email}`
      : `Password setup email sent to ${user.email}`);
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: formName, email: formEmail, role: formRole } : u));
      setModalOpen(false);
    } else {
      const newUser: User = {
        id: Date.now(),
        name: formName,
        email: formEmail,
        role: formRole,
        status: "active",
        lastLogin: "Pending password setup",
      };
      setUsers(prev => [...prev, newUser]);
      setModalOpen(false);
      // Trigger the email-based password setup flow
      setTimeout(() => issueInvite(newUser, false), 150);
    }
  };

  const handleSuspend = () => {
    if (!suspendUser) return;
    setUsers(prev => prev.map(u => u.id === suspendUser.id
      ? { ...u, status: u.status === "suspended" ? "active" as const : "suspended" as const }
      : u
    ));
    setSuspendUser(null);
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  const openPinModal = (u: User) => {
    setPinUser(u);
    setPinNew("");
    setPinConfirm("");
    setShowPinNew(false);
    setShowPinConfirm(false);
  };

  const handleSavePin = () => {
    if (!pinUser) return;
    if (pinNew.length !== 6 || !/^\d{6}$/.test(pinNew)) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }
    if (pinNew !== pinConfirm) {
      toast.error("PINs do not match");
      return;
    }
    localStorage.setItem(`adminPin_${pinUser.role}`, pinNew);
    toast.success(`Transaction PIN ${localStorage.getItem(`adminPin_${pinUser.role}`) ? "updated" : "created"} for ${pinUser.name}`);
    setPinUser(null);
  };

  const getUserPinStatus = (u: User | null) => !!u && !!localStorage.getItem(`adminPin_${u.role}`);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
          </div>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" /> Add User
          </Button>
        </div>

        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Email</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Role</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">PIN</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Last Login</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-badge ${roleLabels[u.role]?.color || ""}`}>
                      {roleLabels[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getUserPinStatus(u) ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Set
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.status === "suspended" ? (
                      <span className="status-badge bg-destructive/10 text-destructive">Suspended</span>
                    ) : (
                      <span className={`w-2 h-2 rounded-full inline-block ${u.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(u)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPinModal(u)}>
                          <Lock className="w-3.5 h-3.5 mr-2" />
                          {getUserPinStatus(u) ? "Update PIN" : "Create PIN"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSuspendUser(u)}>
                          {u.status === "suspended" ? "Reactivate" : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteUser(u)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>{editingUser ? "Update user details and permissions" : "Create a new admin user"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} className="mt-1" placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="mt-1" placeholder="email@example.com" type="email" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={formRole} onValueChange={v => setFormRole(v as User["role"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Permissions</label>
              <div className="mt-1.5 space-y-1.5">
                {PERMISSIONS[formRole]?.map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave} disabled={!formName || !formEmail}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Management Modal */}
      <Dialog open={!!pinUser} onOpenChange={() => setPinUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              {getUserPinStatus(pinUser) ? "Update" : "Create"} Transaction PIN
            </DialogTitle>
            <DialogDescription>
              {getUserPinStatus(pinUser) ? "Set a new" : "Create a"} 6-digit transaction PIN for {pinUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {pinUser?.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{pinUser?.name}</p>
                <p className="text-[10px] text-muted-foreground">{roleLabels[pinUser?.role || "agent"]?.label}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">New PIN</label>
              <div className="relative">
                <Input
                  type={showPinNew ? "text" : "password"}
                  maxLength={6}
                  placeholder="••••••"
                  value={pinNew}
                  onChange={e => setPinNew(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPinNew(!showPinNew)}
                >
                  {showPinNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Confirm PIN</label>
              <div className="relative">
                <Input
                  type={showPinConfirm ? "text" : "password"}
                  maxLength={6}
                  placeholder="••••••"
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPinConfirm(!showPinConfirm)}
                >
                  {showPinConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinUser(null)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSavePin} disabled={pinNew.length !== 6}>
              {getUserPinStatus(pinUser) ? "Update PIN" : "Create PIN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation */}
      <Dialog open={!!suspendUser} onOpenChange={() => setSuspendUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{suspendUser?.status === "suspended" ? "Reactivate" : "Suspend"} User</DialogTitle>
            <DialogDescription>
              {suspendUser?.status === "suspended"
                ? `Reactivate ${suspendUser?.name}? They will regain access.`
                : `Suspend ${suspendUser?.name}? They will lose access immediately.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendUser(null)}>Cancel</Button>
            <Button className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={handleSuspend}>
              {suspendUser?.status === "suspended" ? "Reactivate" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Delete {deleteUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
