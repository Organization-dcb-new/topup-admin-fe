import { useAuthUser } from "@/lib/auth";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role } = useAuthUser();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
