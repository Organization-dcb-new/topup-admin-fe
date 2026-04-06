import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreateShowModal } from '@/components/Show/CreateShowModal'
import { useGetShows } from '@/hooks/useShow'
import { showColumns } from '@/tables/table-show'
import { AlertCircle, CheckCircle2, Clapperboard, Loader2 } from 'lucide-react'

export default function ShowPage() {
  const { data, isPending, isError, isSuccess } = useGetShows()
  const rows = data?.data ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clapperboard className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Show</h1>
              <p className="text-sm text-muted-foreground">
                Kelola show dan game yang tergabung di dalamnya. Tambah show baru dari toolbar di
                bawah, klik panah pada baris untuk melihat daftar game.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isPending && (
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
                <span className="tabular-nums text-foreground">Total {rows.length} show</span>
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar show</h2>
              <p className="text-xs text-muted-foreground">
                Buat show baru di sini, ubah, hapus, atau kelola game lewat kolom aksi.
              </p>
            </div>
            <CreateShowModal />
          </div>
          <div className="p-3 sm:p-4">
            {isPending && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2
                  className="h-11 w-11 animate-spin text-primary"
                  aria-hidden
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Memuat data show…</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
                </div>
              </div>
            )}
            {isError && (
              <ErrorComponent message="Gagal memuat daftar show. Periksa koneksi atau coba muat ulang halaman." />
            )}
            {isSuccess && (
              <DataTable
                emptyMessage="Belum ada show. Tambahkan lewat tombol Tambah show di atas."
                renderSubRow={(row) => (
                  <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
                    <p className="mb-2 text-sm font-semibold text-foreground">Game dalam show ini</p>
                    {row.games?.length ? (
                      <ul className="grid gap-2 text-sm sm:grid-cols-2 sm:gap-x-6">
                        {row.games.map((g) => (
                          <li key={g.id} className="flex items-center gap-2 text-muted-foreground">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden
                            />
                            <span className="text-foreground">{g.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Belum ada game pada show ini.</p>
                    )}
                  </div>
                )}
                columns={showColumns}
                data={rows}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
