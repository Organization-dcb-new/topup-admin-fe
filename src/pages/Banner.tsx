import { CreateBannerModal } from '@/components/Banner/CreateBannerModal'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { useGetBanners } from '@/hooks/useBanner'
import { bannerColumns } from '@/tables/table-banner'
import { ImageIcon } from 'lucide-react'

export default function BannerPage() {
  const { data } = useGetBanners()

  const rows = data?.data ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Banner</h1>
              <p className="text-sm text-muted-foreground">
                Tambah banner dari toolbar di bawah. Untuk mengubah gambar atau link redirect, dan
                menghapus banner, gunakan tombol di kolom Aksi pada setiap baris.
              </p>
            </div>
          </div>
          <p className="text-sm font-medium tabular-nums text-muted-foreground sm:text-right">
            Total {rows.length} banner
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">Daftar banner</h2>
              <p className="text-xs text-muted-foreground">
                Buat baru di sini ubah &amp; hapus lewat kolom Aksi.
              </p>
            </div>
            <CreateBannerModal />
          </div>
          <div className="p-3 sm:p-4">
            <DataTable columns={bannerColumns} data={rows} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
