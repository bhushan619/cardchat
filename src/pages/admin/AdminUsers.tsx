import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminUsers as initialUsers } from "@/data/mock";
import { useRef } from "react";
import { Users, Plus, Search, MoreVertical, Shield, X, Lock, Eye, EyeOff, Check, Mail, Copy, ExternalLink, Send, Camera, Upload, Trash2, MessageCircle } from "lucide-react";
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
import TrtcGroupsModal from "@/components/admin/TrtcGroupsModal";
import { useAdminRole } from "@/contexts/AdminRoleContext";

type User = {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "team_lead" | "agent" | "finance";
  status: "active" | "offline" | "suspended";
  lastLogin: string;
  bio?: string;
  availability?: "online" | "away" | "offline";
  rating?: number;
  specialties?: string[];
  avatar?: string;
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
  const { role: currentAdminRole } = useAdminRole();
  const [users, setUsers] = useState<User[]>(initialUsers.map(u => ({ ...u, status: u.status as User["status"] })));
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [suspendUser, setSuspendUser] = useState<User | null>(null);
  const [groupsModalOpen, setGroupsModalOpen] = useState(false);

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
  const [formBio, setFormBio] = useState("");
  const [formAvailability, setFormAvailability] = useState<"online" | "away" | "offline">("online");
  const [formRating, setFormRating] = useState<string>("4.8");
  const [formSpecialties, setFormSpecialties] = useState<string>("iTunes, Amazon, Steam, Google Play");
  const [formAvatar, setFormAvatar] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openCreate = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("agent");
    setFormBio("");
    setFormAvailability("online");
    setFormRating("4.8");
    setFormSpecialties("iTunes, Amazon, Steam, Google Play");
    setFormAvatar("");
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormBio(u.bio ?? `Hi, I'm ${u.name}. I'm here to help you with your gift card trades.`);
    setFormAvailability(u.availability ?? (u.status === "active" ? "online" : "offline"));
    setFormRating(String(u.rating ?? 4.8));
    setFormSpecialties((u.specialties ?? ["iTunes", "Amazon", "Steam", "Google Play"]).join(", "));
    setFormAvatar(u.avatar ?? "");
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
    const profileFields = {
      bio: formBio.trim(),
      availability: formAvailability,
      rating: Math.max(0, Math.min(5, parseFloat(formRating) || 0)),
      specialties: formSpecialties.split(",").map(s => s.trim()).filter(Boolean),
      avatar: formAvatar || undefined,
    };
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id
        ? { ...u, name: formName, email: formEmail, role: formRole, ...profileFields }
        : u));
      setModalOpen(false);
      toast.success("User updated");
    } else {
      const newUser: User = {
        id: Date.now(),
        name: formName,
        email: formEmail,
        role: formRole,
        status: "active",
        lastLogin: "Pending password setup",
        ...profileFields,
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
          <div className="flex items-center gap-2">
            {currentAdminRole === "super_admin" && (
              <Button size="sm" variant="outline" className="gap-2" onClick={() => setGroupsModalOpen(true)}>
                <MessageCircle className="w-3.5 h-3.5" /> Manage TRTC Groups
              </Button>
            )}
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5" /> Add User
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="team_lead">Team Lead</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => {}}>
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
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
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                      )}
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
                        <DropdownMenuItem onClick={() => issueInvite(u, true)}>
                          <Send className="w-3.5 h-3.5 mr-2" />
                          Resend Password Email
                        </DropdownMenuItem>
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>{editingUser ? "Update user details, public profile and permissions" : "Create a new admin user"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {formAvatar ? (
                  <img src={formAvatar} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-border">
                    {(formName || "?").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("") || "?"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90"
                  aria-label="Upload avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Profile photo</p>
                <p className="text-[11px] text-muted-foreground mb-2">PNG or JPG, up to 2 MB</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => avatarInputRef.current?.click()}>
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </Button>
                  {formAvatar && (
                    <Button type="button" size="sm" variant="ghost" className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setFormAvatar("")}>
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { handleAvatarFile(e.target.files?.[0]); e.target.value = ""; }}
                />
              </div>
            </div>
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
              <Select value={formRole} onValueChange={v => setFormRole(v as User["role"])} disabled={!!editingUser}>
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

            {/* Public profile (visible to customers on agent profile page) */}
            <div className="pt-3 mt-3 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Public Profile (shown to customers)</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">About / Bio</label>
                  <textarea
                    value={formBio}
                    onChange={e => setFormBio(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Short bio shown on the agent's public profile"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Availability</label>
                    <Select value={formAvailability} onValueChange={v => setFormAvailability(v as "online" | "away" | "offline")}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Rating (0–5)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formRating}
                      onChange={e => setFormRating(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Specialties (comma-separated)</label>
                  <Input
                    value={formSpecialties}
                    onChange={e => setFormSpecialties(e.target.value)}
                    className="mt-1"
                    placeholder="iTunes, Amazon, Steam, Google Play"
                  />
                  {formSpecialties.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formSpecialties.split(",").map(s => s.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-border">
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

      {/* Simulated Password Setup Email */}
      <Dialog open={!!inviteModal} onOpenChange={() => setInviteModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              {inviteModal?.resent ? "Password Email Resent" : "Password Email Sent"}
            </DialogTitle>
            <DialogDescription>
              We sent a secure link to <span className="font-medium text-foreground">{inviteModal?.user.email}</span> so they can create their password.
            </DialogDescription>
          </DialogHeader>
          {inviteModal && (() => {
            const link = `${window.location.origin}/admin/set-password?token=${inviteModal.token}`;
            return (
              <div className="space-y-3 py-1">
                <div className="border rounded-xl p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <Mail className="w-3 h-3" /> Email Preview
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">From:</span> CardChat Admin &lt;noreply@cardchat.com&gt;</p>
                    <p><span className="text-muted-foreground">To:</span> {inviteModal.user.email}</p>
                    <p><span className="text-muted-foreground">Subject:</span> Set up your CardChat Admin password</p>
                  </div>
                  <div className="border-t pt-3 text-sm space-y-2">
                    <p>Hi {inviteModal.user.name},</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      You've been added to CardChat Admin as <span className="font-medium text-foreground capitalize">{roleLabels[inviteModal.user.role]?.label}</span>. Click the secure link below to create your password. The link is valid for 24 hours.
                    </p>
                    <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline break-all">
                      <ExternalLink className="w-3 h-3 shrink-0" /> {link}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied to clipboard");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </Button>
                  <Button
                    className="flex-1 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => window.open(link, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Link
                  </Button>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrtcGroupsModal open={groupsModalOpen} onOpenChange={setGroupsModalOpen} />
    </AdminLayout>
  );
}
