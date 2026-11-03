import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileQuestion, RefreshCw, SearchX, TriangleAlert, type LucideIcon } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { TransactionCustomerPanel, TransactionItemPanel, TransactionReferencePanel } from '@/components/Transaction/TransactionInfoPanels'
import { TransactionPaymentPanel } from '@/components/Transaction/TransactionPaymentPanel'
import { TransactionSummary } from '@/components/Transaction/TransactionSummary'
import { isInFlight, isNotFoundError, isTransactionId, useTransactionDetail } from '@/hooks/useTransaction'
import { cn } from '@/lib/utils'
import type { TransactionRowState } from '@/types/transaction'

export default function TransactionDetailPage() {
  const { t } = useTranslation('common')
  const { paymentId } = useParams<{ paymentId: string }>()
  const location = useLocation()
  const { data, isLoading, isError, error, isFetching, refetch } = useTransactionDetail(paymentId)

  // Only trust what the list handed over for this very transaction.
  const passed = (location.state as { row?: TransactionRowState } | null)?.row
  const row = passed?.id === paymentId ? passed : undefined
  const valid = isTransactionId(paymentId)
  const live = isInFlight(data)

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <div className='flex items-center justify-between gap-3'>
          <Link
            to='/transactions'
            className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
          >
            <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
            {t('transactionDetailPage.back')}
          </Link>
          {data && (
            <div className='flex items-center gap-3'>
              {live && (
                <span className='hidden items-center gap-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-600 sm:inline-flex'>
                  <span className='size-1.5 rounded-full bg-amber-500 animate-hud-signal' aria-hidden />
                  {t('transactionDetailPage.live')}
                </span>
              )}
              <button
                type='button'
                onClick={() => void refetch()}
                disabled={isFetching}
                className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
                <span className='hidden sm:inline'>{t('transactionDetailPage.refresh')}</span>
              </button>
            </div>
          )}
        </div>

        {!valid ? (
          <DetailState icon={FileQuestion} title={t('transactionDetailPage.invalidTitle')} body={t('transactionDetailPage.invalidBody')} />
        ) : isLoading ? (
          <DetailSkeleton />
        ) : isError && isNotFoundError(error) ? (
          <DetailState icon={SearchX} title={t('transactionDetailPage.notFoundTitle')} body={t('transactionDetailPage.notFoundBody')} />
        ) : isError && !data ? (
          <DetailState
            icon={TriangleAlert}
            tone='error'
            title={t('transactionDetailPage.errorTitle')}
            body={t('transactionDetailPage.errorBody')}
            action={
              <button
                type='button'
                onClick={() => void refetch()}
                disabled={isFetching}
                className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
                {t('transactionDetailPage.retry')}
              </button>
            }
          />
        ) : data ? (
          <>
            <TransactionSummary detail={data} row={row} />
            <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]'>
              <div className='space-y-6'>
                <TransactionItemPanel detail={data} row={row} order={0} />
                <TransactionCustomerPanel detail={data} order={1} />
              </div>
              <div className='space-y-6'>
                <TransactionPaymentPanel detail={data} order={2} />
                <TransactionReferencePanel detail={data} order={3} />
              </div>
            </div>
          </>
        ) : (
          <DetailState icon={SearchX} title={t('transactionDetailPage.notFoundTitle')} body={t('transactionDetailPage.notFoundBody')} />
        )}
      </div>
    </DashboardLayout>
  )
}

interface DetailStateProps {
  icon: LucideIcon
  title: string
  body: string
  tone?: 'error'
  action?: ReactNode
}

function DetailState({ icon: Icon, title, body, tone, action }: DetailStateProps) {
  const { t } = useTranslation('common')
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-300'
    >
      <span
        className={cn(
          'mb-4 grid size-14 place-items-center text-white hud-clip-sm',
          tone === 'error' ? 'bg-linear-to-br from-rose-500 to-amber-500' : 'bg-linear-to-br from-brand-purple to-brand-cyan'
        )}
      >
        <Icon className='size-6' aria-hidden />
      </span>
      <h1 className='font-display text-xl font-bold text-slate-900'>{title}</h1>
      <p className='mt-1 max-w-sm text-sm text-slate-500'>{body}</p>
      <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
        {action}
        <Link
          to='/transactions'
          className='inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10'
        >
          {t('transactionDetailPage.back')}
        </Link>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  const { t } = useTranslation('common')
  return (
    <div className='space-y-6' role='status' aria-label={t('transactionDetailPage.loading')}>
      <div className='h-64 animate-pulse bg-slate-200/60 hud-clip sm:h-56' />
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]'>
        <div className='space-y-6'>
          <div className='h-80 animate-pulse bg-slate-200/60 hud-clip' />
          <div className='h-48 animate-pulse bg-slate-200/60 hud-clip' />
        </div>
        <div className='space-y-6'>
          <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' />
          <div className='h-64 animate-pulse bg-slate-200/60 hud-clip' />
        </div>
      </div>
    </div>
  )
}
