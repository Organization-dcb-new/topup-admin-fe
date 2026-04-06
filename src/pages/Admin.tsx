import { useState } from 'react'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import Pagination from '@/components/Layout/Pagination'
import { adminColumns } from '@/tables/table-admin'
import { UserCog, Loader2 } from 'lucide-react'
import { useAdminData } from '@/hooks/useAdmin'
import { CreateAdminModal } from '@/components/Admin/Create'

export default function AdminManagementPage() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useAdminData(page, limit)

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCog className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Kelola admin</h1>
              <p className="text-sm text-muted-foreground">
                Tambah akun admin dari toolbar di bawah. Ubah peran atau hapus lewat kolom Aksi pada
                setiap baris.
              </p>
            </div>
          </div>
          <p className="text-sm font-medium tabular-nums text-muted-foreground sm:text-right">
            Total {(data?.meta?.total_data ?? 0).toLocaleString('id-ID')} admin
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar administrator</h2>
              <p className="text-xs text-muted-foreground">
                Data dari server. Gunakan paginasi untuk melihat halaman lain.
              </p>
            </div>
            <CreateAdminModal />
          </div>
          <div className="p-3 sm:p-4">
            {isLoading ? (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Memuat data administrator…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
                </div>
              </div>
            ) : (
              <>
                <DataTable
                  columns={adminColumns}
                  data={data?.data ?? []}
                  emptyMessage="Belum ada administrator. Tambahkan lewat tombol di atas."
                />
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
      </div>
    </DashboardLayout>
  )
}
