import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useGetReferralCodeById, useUpdateReferralCode } from '@/hooks/useReferral'
import { formatBackendDateTime, parseBackendDate } from '@/lib/backend-datetime'
import { ArrowLeft, Loader2, Percent, Calendar, RefreshCw, BarChart2, TrendingUp, CheckCircle, Clock, Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { DataTable } from '@/components/Layout/table-data'
import { useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Payment } from '@/types/transaction'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import i18n from '@/i18n'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

export default function ReferralDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, isSuccess, refetch } = useGetReferralCodeById(id)
  const { mutate: updateMutate } = useUpdateReferralCode()

  const referral = data?.data

  const handleToggleStatus = useCallback(() => {
    if (!referral) return
    updateMutate({
      id: referral.id,
      payload: { is_active: !referral.is_active },
    })
  }, [referral, updateMutate])

  // Calculate statistics from transactions
  const stats = useMemo(() => {
    const transactions = referral?.transactions ?? []
    const totalCount = transactions.length
    const paidTransactions = transactions.filter((t) => t.status === 'PAID')
    const paidCount = paidTransactions.length
    const totalVolume = paidTransactions.reduce((acc, curr) => acc + curr.amount, 0)
    const successRate = totalCount > 0 ? Math.min(Math.round((paidCount / totalCount) * 100), 100) : 0

    return {
      totalCount,
      paidCount,
      totalVolume,
      successRate,
    }
  }, [referral])

  const columns = useMemo<ColumnDef<Payment>[]>(() => {
    return [
      {
        accessorKey: 'payment_number',
        header: t('referralPage.detail.table.paymentNo'),
        cell: ({ row }) => (
          <Link
            to={`/transactions/${row.original.id}`}
            className='font-mono text-xs font-semibold text-primary hover:underline'
          >
            {row.original.payment_number}
          </Link>
        ),
      },
      {
        accessorKey: 'order_id',
        header: t('referralPage.detail.table.orderId'),
        cell: ({ row }) => (
          <span className='font-mono text-xs text-slate-500 truncate block max-w-[120px]' title={row.original.order_id}>
            {row.original.order_id}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <span className='block text-right'>{t('referralPage.detail.table.amount')}</span>,
        cell: ({ row }) => (
          <span className='block text-right font-bold tabular-nums text-slate-900'>
            {formatIdr(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'payment_channel',
        header: t('referralPage.detail.table.channel'),
        cell: ({ row }) => (
          <span className='text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200'>
            {row.original.payment_channel}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('referralPage.detail.table.status'),
        cell: ({ row }) => {
          const status = row.original.status
          const isPaid = status === 'PAID'
          const isProcessing = status === 'PROCESSING'
          const isPending = status === 'PENDING'
          const isFailed = status === 'FAILED'
          const isExpired = status === 'EXPIRED'

          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs transition-all duration-200',
                isPaid && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                isProcessing && 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                isPending && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                (isFailed || isExpired) && 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  isPaid && 'bg-emerald-500',
                  isProcessing && 'bg-blue-500 animate-pulse',
                  isPending && 'bg-amber-500 animate-pulse',
                  (isFailed || isExpired) && 'bg-rose-500'
                )}
              />
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: t('referralPage.detail.table.date'),
        cell: ({ row }) => {
          const date = parseBackendDate(row.original.created_at)
          return (
            <span className='whitespace-nowrap text-xs tabular-nums text-slate-500'>
              {date ? format(date, 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale() }) : '—'}
            </span>
          )
        },
      },
    ]
  }, [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Navigation & Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <Button type='button' variant='outline' size='icon' asChild className='h-9 w-9 shrink-0 border-slate-200'>
              <Link to='/referral-codes' aria-label={t('referralPage.detail.backBtn')}>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <div className='min-w-0 gap-3 flex'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Percent className='h-5 w-5' />
              </div>
              <div className='min-w-0 space-y-1'>
                <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                  {t('referralPage.detail.title')}
                </h1>
                <p className='text-sm text-muted-foreground'>{t('referralPage.detail.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 self-end sm:self-center'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void refetch()}
              className='h-9 border-slate-200 flex items-center gap-1.5'
            >
              <RefreshCw className='h-3.5 w-3.5' />
              {t('common.refresh') || 'Refresh'}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className='flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12'>
            <Loader2 className='h-11 w-11 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>{t('providerPage.loadingShort') || 'Loading…'}</p>
          </div>
        )}

        {!id && <ErrorComponent message='Missing referral code ID' />}
        {isError && <ErrorComponent message={t('referralPage.toastError')} />}

        {isSuccess && referral && (
          <>
            {/* Quick Metrics */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all duration-200'>
                <div className='flex items-center justify-between'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Total Uses</p>
                  <BarChart2 className='h-4 w-4 text-slate-400' />
                </div>
                <p className='mt-2 text-xl font-extrabold text-slate-900 tabular-nums'>{stats.totalCount}</p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all duration-200'>
                <div className='flex items-center justify-between'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Successful Uses</p>
                  <CheckCircle className='h-4 w-4 text-emerald-500' />
                </div>
                <p className='mt-2 text-xl font-extrabold text-slate-900 tabular-nums'>{stats.paidCount}</p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all duration-200'>
                <div className='flex items-center justify-between'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Sales Volume</p>
                  <TrendingUp className='h-4 w-4 text-emerald-500' />
                </div>
                <p className='mt-2 text-xl font-extrabold text-emerald-600 tabular-nums'>{formatIdr(stats.totalVolume)}</p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all duration-200'>
                <div className='flex items-center justify-between'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>{t('referralPage.detail.totalEarnings')}</p>
                  <Coins className='h-4 w-4 text-amber-500' />
                </div>
                <p className='mt-2 text-xl font-extrabold text-amber-600 tabular-nums'>{formatIdr(referral.total_earnings ?? 0)}</p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all duration-200'>
                <div className='flex items-center justify-between'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Conversion Rate</p>
                  <Clock className='h-4 w-4 text-slate-400' />
                </div>
                <p className='mt-2 text-xl font-extrabold text-slate-900 tabular-nums'>{stats.successRate}%</p>
              </div>
            </div>

            {/* Detailed metadata */}
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Info Card */}
              <div className='lg:col-span-1 space-y-6'>
                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4'>
                  <h2 className='text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3'>
                    {t('referralPage.detail.cardTitle')}
                  </h2>

                  <div className='space-y-3.5 text-sm'>
                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide'>
                        {t('referralPage.detail.name')}
                      </span>
                      <span className='font-medium text-slate-900'>{referral.name}</span>
                    </div>

                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1'>
                        {t('referralPage.detail.code')}
                      </span>
                      <code className='rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border border-slate-200'>
                        {referral.code}
                      </code>
                    </div>

                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide'>
                        {t('referralPage.detail.percent')}
                      </span>
                      <span className='font-bold text-slate-700'>{referral.percent}%</span>
                    </div>

                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide'>
                        {t('referralPage.detail.totalEarnings')}
                      </span>
                      <span className='font-bold text-amber-600'>{formatIdr(referral.total_earnings ?? 0)}</span>
                    </div>

                    <div className='flex items-center justify-between border-t border-b border-slate-50 py-3'>
                      <div>
                        <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide'>
                          {t('referralPage.detail.status')}
                        </span>
                        <span className='text-xs text-slate-500'>
                          {referral.is_active ? t('referralPage.statusActive') : t('referralPage.statusInactive')}
                        </span>
                      </div>
                      <Switch checked={referral.is_active} onCheckedChange={handleToggleStatus} />
                    </div>

                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {t('referralPage.detail.createdAt')}
                      </span>
                      <span className='text-xs text-slate-600'>{formatBackendDateTime(referral.created_at)}</span>
                    </div>

                    <div>
                      <span className='block text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {t('referralPage.detail.updatedAt')}
                      </span>
                      <span className='text-xs text-slate-600'>{formatBackendDateTime(referral.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className='lg:col-span-2'>
                <div className='rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden'>
                  <div className='border-b border-slate-100 px-5 py-4'>
                    <h2 className='text-sm font-bold text-slate-900 uppercase tracking-wider'>
                      {t('referralPage.detail.txTitle')}
                    </h2>
                    <p className='text-xs text-slate-400 mt-0.5'>
                      {t('referralPage.detail.txSubtitle')}
                    </p>
                  </div>

                  <div className='p-4'>
                    <div className='max-h-[30rem] overflow-y-auto overscroll-contain'>
                      <DataTable
                        columns={columns}
                        data={referral.transactions ?? []}
                        emptyMessage={t('referralPage.detail.txEmpty')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
