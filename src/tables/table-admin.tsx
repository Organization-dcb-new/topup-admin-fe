import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUser } from "@/types/admin";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { UpdateAdminRole } from "@/components/Admin/Update";
import { DeleteAdminButton } from "@/components/Admin/Delete";

export const adminColumns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row?.original?.username}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row?.original?.email}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row?.original?.role;
      return (
        <div className="flex items-center gap-2">
          {role === "dev" && (
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          )}
          {role === "admin" && (
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          )}
          {role === "noc" && <Shield className="w-4 h-4 text-slate-500" />}
          <span className="uppercase text-xs font-bold tracking-wider">
            {role}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "two_factor_enabled",
    header: "2FA Status",
    cell: ({ row }) => {
      const enabled = row?.original?.two_factor_enabled;
      return (
        <div
          className={`text-xs font-bold ${enabled ? "text-emerald-600" : "text-slate-400"}`}
        >
          {enabled ? "ENABLED" : "DISABLED"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UpdateAdminRole
          id={row?.original?.id}
          currentRole={row?.original?.role}
        />
        <DeleteAdminButton
          id={row?.original?.id}
          email={row?.original?.email}
        />
      </div>
    ),
  },
];
