import { api } from '@/api/axios'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import PaymentDetail from '@/components/Transaction/TransactionDetail'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

const detailPageCardClass =
  'overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'

function DetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className='min-w-0 -mx-4 -mt-4 flex w-full flex-col bg-muted/30 md:-mx-6 md:-mt-6'>
        <div className='w-full min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8'>{children}</div>
      </div>
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
    <header className='border-b border-border/70 px-4 py-5 sm:px-6 md:px-8'>
      <div className='flex min-w-0 items-start gap-3'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='mt-0.5 shrink-0 rounded-full'
          aria-label={backAriaLabel}
          asChild
        >
          <Link to={backTo}>
            <ArrowLeft className='h-5 w-5' aria-hidden />
          </Link>
        </Button>
        <div className='flex min-w-0 gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Receipt className='h-5 w-5' aria-hidden />
          </div>
          <div className='min-w-0 space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-foreground'>{title}</h1>
            <p className='text-sm text-muted-foreground'>{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
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
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <DetailPageHeader
            title={t('transactionDetailPage.title')}
            subtitle={t('transactionDetailPage.missingIdSubtitle')}
            backAriaLabel={t('transactionDetailPage.backAria')}
          />
          <section className='px-4 py-10 sm:px-6 md:px-8'>
            <div className='space-y-6'>
              <ErrorComponent message={t('transactionDetailPage.missingIdMessage')} />
              <div className='flex flex-wrap gap-3'>
                <Button variant='outline' asChild>
                  <Link to='/transactions'>{t('transactionDetailPage.backButton')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DetailPageShell>
    )
  }

  if (isLoading) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <DetailPageHeader
            title={t('transactionDetailPage.title')}
            subtitle={t('transactionDetailPage.loadingSubtitle')}
            backAriaLabel={t('transactionDetailPage.backAria')}
          />
          <div
            className='flex min-h-[min(60vh,28rem)] flex-col items-center justify-center gap-4 bg-muted/20 px-4 py-16 sm:px-6 md:px-8'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <Loader2 className='h-11 w-11 shrink-0 animate-spin text-primary' aria-hidden />
            <div className='text-center'>
              <p className='text-sm font-medium text-foreground'>{t('transactionDetailPage.loadingTitle')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('transactionDetailPage.pleaseWait')}</p>
            </div>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isError) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <DetailPageHeader
            title={t('transactionDetailPage.title')}
            subtitle={t('transactionDetailPage.errorSubtitle')}
            backAriaLabel={t('transactionDetailPage.backAria')}
          />
          <section className='px-4 py-10 sm:px-6 md:px-8'>
            <div className='space-y-6'>
              <ErrorComponent message={t('transactionDetailPage.errorMessage')} />
              <div className='flex flex-wrap gap-3'>
                <Button variant='outline' asChild>
                  <Link to='/transactions'>{t('transactionDetailPage.backButton')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DetailPageShell>
    )
  }

  if (isSuccess && !data) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <DetailPageHeader
            title={t('transactionDetailPage.title')}
            subtitle={t('transactionDetailPage.notFoundSubtitle')}
            backAriaLabel={t('transactionDetailPage.backAria')}
          />
          <section className='px-4 py-10 sm:px-6 md:px-8'>
            <div className='space-y-6'>
              <ErrorComponent message={t('transactionDetailPage.notFoundMessage')} />
              <div className='flex flex-wrap gap-3'>
                <Button variant='outline' asChild>
                  <Link to='/transactions'>{t('transactionDetailPage.backButton')}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </DetailPageShell>
    )
  }

  return <PaymentDetail data={data!} isLoading={false} />
}
