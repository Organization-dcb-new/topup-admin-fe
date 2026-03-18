import { useState } from "react";
import { DashboardLayout } from "@/components/Layout/dashboard-layout";
import { DataTable } from "@/components/Layout/table-data";
import Pagination from "@/components/Layout/Pagination";
import { adminColumns } from "@/tables/table-admin";
import { UserCog, Loader2 } from "lucide-react"; // Tambahkan Loader2
import { useAdminData } from "@/hooks/useAdmin";
import { CreateAdminModal } from "@/components/Admin/Create";

export default function AdminManagementPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useAdminData(page, limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <UserCog className="w-6 h-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Admin Management
              </h1>
              <p className="text-xs text-slate-500">
                Total{" "}
                <span className="font-bold text-indigo-600">
                  {data?.meta?.total_data ?? 0}
                </span>{" "}
                administrators found.
              </p>
            </div>
          </div>

          <div className="md:ml-auto">
            <CreateAdminModal />
          </div>
        </div>

        {/* Section Tabel dengan Loading State */}
        <div className="relative min-h-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center absolute inset-0 bg-white/50 z-10 rounded-xl">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Fetching administrator data...
              </p>
            </div>
          ) : (
            <>
              <DataTable columns={adminColumns} data={data?.data ?? []} />

              <div className="mt-4">
                <Pagination
                  page={data?.meta?.page ?? 1}
                  totalPage={data?.meta?.total_page ?? 1}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
