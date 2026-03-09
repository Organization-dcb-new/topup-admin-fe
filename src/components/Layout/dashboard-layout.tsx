import { useEffect, useState } from "react";

import { useAuthUser } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { token, isMfaRequired } = useAuthUser();

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (isMfaRequired) {
      window.location.href = "/verify-otp";
      return;
    }
  }, [token, isMfaRequired]);

  if (!token || isMfaRequired) return null;
  return (
    <div className="flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 min-h-screen bg-gray-50 md:ml-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
