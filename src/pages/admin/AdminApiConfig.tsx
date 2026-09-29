import AdminLayout from "@/components/admin/AdminLayout";
import { Lock } from "lucide-react";
import WhatsAppGatewayCard from "@/components/admin/WhatsAppGatewayCard";
import WarmupAntiBanCard from "@/components/admin/WarmupAntiBanCard";
import InactivityFollowUpCard from "@/components/admin/InactivityFollowUpCard";
import { useAdminRole } from "@/contexts/AdminRoleContext";

export default function AdminApiConfig() {
  const { role } = useAdminRole();
  const canView = role === "super_admin";

  if (!canView) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
            <Lock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Settings are available to Super Admins only.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Super Admin only · Gateway health and anti-ban policy</p>
        </div>

        <WhatsAppGatewayCard />
        <WarmupAntiBanCard />
        <InactivityFollowUpCard />
      </div>
    </AdminLayout>
  );
}
