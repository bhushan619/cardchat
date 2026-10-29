import AdminLayout from "@/components/admin/AdminLayout";
import WhatsAppGatewayCard from "@/components/admin/WhatsAppGatewayCard";
import WarmupAntiBanCard from "@/components/admin/WarmupAntiBanCard";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Lock } from "lucide-react";

export default function AdminWaGatewayConfig() {
  const { role } = useAdminRole();

  return (
    <AdminLayout>
      {role !== "super_admin" ? (
        <div className="p-6 text-center">
          <Lock className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <h1 className="font-heading text-lg font-bold">Restricted</h1>
          <p className="text-sm text-muted-foreground">WA Gateway Config is available to Super Admins only.</p>
        </div>
      ) : (
        <div className="max-w-4xl space-y-6 p-6">
          <div>
            <h1 className="mb-1 font-heading text-xl font-bold">WhatsApp Gateway Config</h1>
            <p className="text-sm text-muted-foreground">Super Admin only · Gateway health and anti-ban policy</p>
          </div>
          <WhatsAppGatewayCard />
          <WarmupAntiBanCard />
        </div>
      )}
    </AdminLayout>
  );
}