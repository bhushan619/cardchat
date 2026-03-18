import { createContext, useContext, useState, ReactNode } from "react";

type Role = "super_admin" | "team_lead" | "agent";

const AdminRoleContext = createContext<{
  role: Role;
  setRole: (r: Role) => void;
}>({ role: "super_admin", setRole: () => {} });

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("super_admin");
  return (
    <AdminRoleContext.Provider value={{ role, setRole }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export const useAdminRole = () => useContext(AdminRoleContext);
