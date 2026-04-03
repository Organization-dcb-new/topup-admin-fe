import { api } from '@/api/axios'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import PaymentDetail from '@/components/Transaction/TransactionDetail'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Receipt } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function PaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>()

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['payment-detail', paymentId],
    queryFn: async () => {
      const res = await api.get(`/transactions/detail/${paymentId}`)
      return res.data.data
    },
    enabled: !!paymentId,
  })

  const fallbackShell = (children: React.ReactNode) => (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">{children}</div>
    </DashboardLayout>
  )

  if (!paymentId) {
    return fallbackShell(
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
        <ErrorComponent message="ID transaksi tidak ditemukan di URL." />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/transactions">Kembali ke daftar transaksi</Link>
          </Button>
        </div>
      </div>,
    )
  }

  if (isLoading) {
    return fallbackShell(
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Detail transaksi</h1>
              <p className="text-sm text-muted-foreground">Memuat data pembayaran…</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="p-3 sm:p-4">
            <div
              className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Memuat detail transaksi…</p>
                <p className="mt-1 text-xs text-muted-foreground">Mohon tunggu sebentar.</p>
              </div>
            </div>
          </div>
        </div>
      </>,
    )
  }

  if (isError) {
    return fallbackShell(
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
        <ErrorComponent message="Gagal memuat detail transaksi. Periksa koneksi atau coba muat ulang halaman." />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/transactions">Kembali ke daftar transaksi</Link>
          </Button>
        </div>
      </div>,
    )
  }

  if (isSuccess && !data) {
    return fallbackShell(
      <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-8">
        <ErrorComponent message="Data transaksi tidak ditemukan." />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/transactions">Kembali ke daftar transaksi</Link>
          </Button>
        </div>
      </div>,
    )
  }

  return <PaymentDetail data={data!} isLoading={false} />
}
