import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAdminRole } from "@/contexts/AdminRoleContext";

const roleProfiles: Record<string, { name: string; label: string; email: string; phone: string }> = {
  super_admin: { name: "Admin One", label: "Super Admin", email: "admin@cardchat.com", phone: "+234 801 234 5678" },
  team_lead: { name: "Sarah Lead", label: "Team Lead", email: "sarah@cardchat.com", phone: "+234 802 345 6789" },
  agent: { name: "Mike Agent", label: "Agent", email: "mike@cardchat.com", phone: "+234 803 456 7890" },
  finance: { name: "Femi Finance", label: "Finance", email: "femi@cardchat.com", phone: "+234 804 567 8901" },
};

export default function AdminProfile() {
  const { role } = useAdminRole();
  const profile = roleProfiles[role];

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  // PIN management
  const [hasPin, setHasPin] = useState(() => !!localStorage.getItem(`adminPin_${role}`));
  const [pinMode, setPinMode] = useState<"idle" | "create" | "update">("idle");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    toast.success("Profile updated successfully");
  };

  const handleSavePin = () => {
    if (pinMode === "update") {
      const stored = localStorage.getItem(`adminPin_${role}`);
      if (currentPin !== stored) {
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
    localStorage.setItem(`adminPin_${role}`, newPin);
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

        {/* Avatar & Role */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold font-heading">
            {profile.name[0]}
          </div>
          <div>
            <p className="font-heading font-bold text-lg">{profile.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-accent" />
              {profile.label}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-card border rounded-xl p-5 space-y-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Details</p>
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
          <Button onClick={handleSaveProfile} className="w-full">Save Profile</Button>
        </div>

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
      </div>
    </AdminLayout>
  );
}
