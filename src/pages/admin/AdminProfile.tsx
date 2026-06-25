import { useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, Check, Camera, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { hashPin, verifyPin } from "@/lib/securePin";

const roleProfiles: Record<string, { name: string; label: string; email: string; phone: string; defaultPassword: string }> = {
  super_admin: { name: "Admin One", label: "Super Admin", email: "admin@cardchat.com", phone: "+234 801 234 5678", defaultPassword: "admin123" },
  team_lead: { name: "Sarah Lead", label: "Team Lead", email: "lead@cardchat.com", phone: "+234 802 345 6789", defaultPassword: "lead123" },
  agent: { name: "Mike Agent", label: "Agent", email: "agent@cardchat.com", phone: "+234 803 456 7890", defaultPassword: "agent123" },
  finance: { name: "Femi Finance", label: "Finance", email: "femi@cardchat.com", phone: "+234 804 567 8901", defaultPassword: "finance123" },
};

export default function AdminProfile() {
  const { role } = useAdminRole();
  const profile = roleProfiles[role];

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  // Public profile
  const [avatar, setAvatar] = useState<string>("");
  const [bio, setBio] = useState(`Hi, I'm ${profile.name}. I'm here to help you with your gift card trades.`);
  const [availability, setAvailability] = useState<"online" | "away" | "offline">("online");
  const [rating, setRating] = useState<string>("4.8");
  const [specialties, setSpecialties] = useState<string>("iTunes, Amazon, Steam, Google Play");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  // PIN management
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem(`adminPin_${role}`));
  const [pinMode, setPinMode] = useState<"idle" | "create" | "update">("idle");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Change Password
  const [pwdMode, setPwdMode] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleChangePassword = () => {
    const stored = sessionStorage.getItem(`cc_password_${profile.email}`) || profile.defaultPassword;
    if (currentPwd !== stored) {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPwd === currentPwd) {
      toast.error("New password must be different from current password");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }
    sessionStorage.setItem(`cc_password_${profile.email}`, newPwd);
    setPwdMode(false);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast.success("Password changed successfully");
  };

  const handleCancelPwd = () => {
    setPwdMode(false);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    toast.success("Profile updated successfully");
  };

  const handleSavePin = async () => {
    if (pinMode === "update") {
      const storedHash = localStorage.getItem(`adminPin_${role}`);
      const ok = await verifyPin(currentPin, storedHash);
      if (!ok) {
        toast.error("Current PIN is incorrect");
        return;
      }
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    const hashed = await hashPin(newPin);
    localStorage.setItem(`adminPin_${role}`, hashed);
    setHasPin(true);
    setPinMode("idle");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    toast.success(pinMode === "create" ? "Transaction PIN created" : "Transaction PIN updated");
  };

  const handleCancelPin = () => {
    setPinMode("idle");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="font-heading text-xl font-bold flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-accent" /> My Profile
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Manage your profile details and security settings</p>

        {/* Profile Details */}
        <div className="bg-card border rounded-xl p-5 space-y-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Details</p>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold font-heading border border-border">
                  {(name || "?").split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("") || "?"}
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
                {avatar && (
                  <Button type="button" size="sm" variant="ghost" className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setAvatar("")}>
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name
            </label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
            </label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
            </label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" /> Role
            </label>
            <Select value={role} disabled>
              <SelectTrigger>
                <SelectValue placeholder={profile.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={role}>{profile.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public Profile */}
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Public Profile (shown to customers)</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">About / Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Short bio shown on your public profile"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Availability</label>
                  <Select value={availability} onValueChange={v => setAvailability(v as "online" | "away" | "offline")}>
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
                    value={rating}
                    onChange={e => setRating(e.target.value)}
                    className="mt-1"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Specialties (comma-separated)</label>
                <Input
                  value={specialties}
                  onChange={e => setSpecialties(e.target.value)}
                  className="mt-1"
                  placeholder="iTunes, Amazon, Steam, Google Play"
                />
                {specialties.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {specialties.split(",").map(s => s.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="w-full">Save Profile</Button>
        </div>


        {/* Change Password */}
        <div className="bg-card border rounded-xl p-5 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</p>
              <p className="text-xs text-muted-foreground mt-1">
                Change the password you use to sign in to the admin panel.
              </p>
            </div>
          </div>

          {!pwdMode ? (
            <Button variant="outline" className="gap-1.5" onClick={() => setPwdMode(true)}>
              <Lock className="w-3.5 h-3.5" /> Change Password
            </Button>
          ) : (
            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrentPwd(!showCurrentPwd)}>
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPwd(!showNewPwd)}>
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={handleCancelPwd}>Cancel</Button>
                <Button className="flex-1" onClick={handleChangePassword}>Update Password</Button>
              </div>
            </div>
          )}
        </div>


        {role === "super_admin" && (
          <>
            <Separator className="mb-6" />

            {/* Transaction PIN */}
            <div className="bg-card border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction PIN</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasPin ? "Your PIN is set. Use it to authorize fund adjustments." : "Create a 6-digit PIN to authorize fund adjustments."}
                  </p>
                </div>
                {hasPin && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              {pinMode === "idle" ? (
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setPinMode(hasPin ? "update" : "create")}
                >
                  <Lock className="w-3.5 h-3.5" />
                  {hasPin ? "Change PIN" : "Create PIN"}
                </Button>
              ) : (
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  {pinMode === "update" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Current PIN</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPin ? "text" : "password"}
                          maxLength={6}
                          placeholder="••••••"
                          value={currentPin}
                          onChange={e => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="pr-9"
                        />
                        <button
                          type="button"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPin(!showCurrentPin)}
                        >
                          {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">New PIN</label>
                    <div className="relative">
                      <Input
                        type={showNewPin ? "text" : "password"}
                        maxLength={6}
                        placeholder="••••••"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPin(!showNewPin)}
                      >
                        {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Confirm PIN</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPin ? "text" : "password"}
                        maxLength={6}
                        placeholder="••••••"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                      >
                        {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1" onClick={handleCancelPin}>Cancel</Button>
                    <Button className="flex-1" onClick={handleSavePin}>
                      {pinMode === "create" ? "Create PIN" : "Update PIN"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
