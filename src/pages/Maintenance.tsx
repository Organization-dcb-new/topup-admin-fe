import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreateMaintenanceModal } from '@/components/Maintenance/CreateMaintenanceModal'
import { useGetMaintenances } from '@/hooks/useMaintenance'
import { maintenanceColumns } from '@/tables/table-maintenance'
import { AlertCircle, CheckCircle2, Construction, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function MaintenancePage() {
  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetMaintenances()
  const rows = data?.data ?? []

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success('Berhasil memuat pemeliharaan')
    }
    if (isError && isFetchedAfterMount) {
      toast.error('Gagal memuat pemeliharaan')
    }
  }, [isSuccess, isError, isFetchedAfterMount])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Construction className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Pemeliharaan</h1>
              <p className="text-sm text-muted-foreground">
                Kelola jadwal dan status pemeliharaan (mode aktif, waktu mulai & selesai).
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isLoading && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                Memuat…
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                Gagal memuat
              </p>
            )}
            {isSuccess && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span className="tabular-nums text-foreground">
                  {rows.length.toLocaleString('id-ID')} entri
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar pemeliharaan</h2>
              <p className="text-xs text-muted-foreground">
                Buat, ubah, atau hapus entri pemeliharaan dari server.
              </p>
            </div>
            <CreateMaintenanceModal />
          </div>

          <div className="p-3 sm:p-4">
            {isLoading && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Memuat data…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message="Gagal memuat daftar pemeliharaan. Periksa koneksi atau coba muat ulang halaman." />
            )}

            {isSuccess && (
              <div className="max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain">
                <DataTable
                  columns={maintenanceColumns}
                  data={rows}
                  emptyMessage="Belum ada entri pemeliharaan. Tambahkan lewat tombol di atas."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
