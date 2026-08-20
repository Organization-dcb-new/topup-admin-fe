import { api } from '@/api/axios'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import PaymentDetail from '@/components/Transaction/TransactionDetail'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

function DetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>{children}</div>
    </DashboardLayout>
  )
}

function DetailPageHeader({
  title,
  subtitle,
  backAriaLabel,
  backTo = '/transactions',
}: {
  title: string
  subtitle: string
  backAriaLabel: string
  backTo?: string
}) {
  return (
    <header className='nb-frame nb-frame-thick nb-sd flex items-start gap-3 bg-white p-4 sm:p-5'>
      <Link
        to={backTo}
        aria-label={backAriaLabel}
        className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-white'
      >
        <ArrowLeft className='h-5 w-5' strokeWidth={3} aria-hidden />
      </Link>
      <div className='flex min-w-0 gap-3'>
        <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#ff9d3d]'>
          <Receipt className='h-5 w-5' strokeWidth={2.5} aria-hidden />
        </span>
        <div className='min-w-0 space-y-1.5'>
          <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>{title}</h1>
          <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>{subtitle}</p>
        </div>
      </div>
    </header>
  )
}

/** Pesan galat + tombol kembali. Dipakai untuk ID kosong, gagal muat, dan
 *  data tidak ditemukan — ketiganya dulu menyalin markup yang sama. */
function DetailPageFallback({
  subtitle,
  message,
  t,
}: {
  subtitle: string
  message: string
  t: (key: string) => string
}) {
  return (
    <DetailPageShell>
      <DetailPageHeader
        title={t('transactionDetailPage.title')}
        subtitle={subtitle}
        backAriaLabel={t('transactionDetailPage.backAria')}
      />
      <div className='nb-frame nb-frame-thick nb-sd space-y-6 bg-white px-4 py-10 sm:px-6'>
        <ErrorComponent message={message} />
        <div className='flex flex-wrap justify-center gap-3'>
          <Link
            to='/transactions'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 items-center gap-2 bg-[#ffd84d] px-5 text-xs font-black uppercase tracking-[0.14em]'
          >
            <ArrowLeft className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('transactionDetailPage.backButton')}
          </Link>
        </div>
      </div>
    </DetailPageShell>
  )
}

export default function PaymentDetailPage() {
  const { t } = useTranslation('common')
  const { paymentId } = useParams<{ paymentId: string }>()

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['payment-detail', paymentId],
    queryFn: async () => {
      const res = await api.get(`/transactions/detail/${paymentId}`)
      return res.data.data
    },
    enabled: !!paymentId,
  })

  if (!paymentId) {
    return (
      <DetailPageFallback
        t={t}
        subtitle={t('transactionDetailPage.missingIdSubtitle')}
        message={t('transactionDetailPage.missingIdMessage')}
      />
    )
  }

  if (isLoading) {
    return (
      <DetailPageShell>
        <DetailPageHeader
          title={t('transactionDetailPage.title')}
          subtitle={t('transactionDetailPage.loadingSubtitle')}
          backAriaLabel={t('transactionDetailPage.backAria')}
        />
        <div
          className='nb-frame nb-frame-thick nb-sd flex min-h-[min(60vh,28rem)] flex-col items-center justify-center gap-4 bg-white px-4 py-16'
          role='status'
          aria-live='polite'
          aria-busy='true'
        >
          <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
            <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
          </span>
          <div className='text-center'>
            <p className='text-sm font-black uppercase tracking-tight'>
              {t('transactionDetailPage.loadingTitle')}
            </p>
            <p className='mt-1 text-xs font-bold text-[#111]/70'>
              {t('transactionDetailPage.pleaseWait')}
            </p>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isError) {
    return (
      <DetailPageFallback
        t={t}
        subtitle={t('transactionDetailPage.errorSubtitle')}
        message={t('transactionDetailPage.errorMessage')}
      />
    )
  }

  if (isSuccess && !data) {
    return (
      <DetailPageFallback
        t={t}
        subtitle={t('transactionDetailPage.notFoundSubtitle')}
        message={t('transactionDetailPage.notFoundMessage')}
      />
    )
  }

  return <PaymentDetail data={data!} isLoading={false} />
}
