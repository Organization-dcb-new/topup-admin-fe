import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  CheckCircle,
  Coins,
  Loader2,
  Percent,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { ReferralStatCard } from '@/components/Referral/ReferralStatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermission } from '@/hooks/usePermission'
import { useGetReferralCodeById, useUpdateReferralCode } from '@/hooks/useReferral'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
import { getReferralTransactionColumns } from '@/tables/table-referral-transactions'

/** Transaksi dikirim utuh oleh backend, jadi dipotong di klien agar tabel tetap ringan. */
const TX_PAGE_SIZE = 25

export default function ReferralDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const { can } = usePermission()
  const { data, isPending, isError, isSuccess, refetch } = useGetReferralCodeById(id)
  const { mutate: updateMutate, isPending: isToggling } = useUpdateReferralCode()
  const [shown, setShown] = useState(TX_PAGE_SIZE)

  const referral = data?.data
  const canUpdate = can(PERM.REFERRAL_UPDATE)

  const handleToggleStatus = useCallback(() => {
    if (!referral) return
    updateMutate({ id: referral.id, payload: { is_active: !referral.is_active } })
  }, [referral, updateMutate])

  const stats = useMemo(() => {
    const transactions = referral?.transactions ?? []
    const totalCount = transactions.length
    const paid = transactions.filter((tx) => tx.status === 'PAID')
    const totalVolume = paid.reduce((acc, curr) => acc + curr.amount, 0)
    return {
      totalCount,
      paidCount: paid.length,
      totalVolume,
      paidShare: totalCount > 0 ? Math.round((paid.length / totalCount) * 100) : 0,
    }
  }, [referral])

  const columns = useMemo(() => getReferralTransactionColumns(t), [t])
  const transactions = referral?.transactions ?? []
  const visibleTransactions = useMemo(
    () => transactions.slice(0, shown),
    [transactions, shown],
  )

  const metrics = referral
    ? [
        {
          key: 'totalUses',
          label: t('referralDetail.totalUses'),
          icon: BarChart2,
          value: String(stats.totalCount),
        },
        {
          key: 'successfulUses',
          label: t('referralDetail.successfulUses'),
          icon: CheckCircle,
          value: String(stats.paidCount),
        },
        {
          key: 'salesVolume',
          label: t('referralDetail.salesVolume'),
          icon: TrendingUp,
          value: formatCompactCurrency(stats.totalVolume),
          title: formatCurrency(stats.totalVolume),
          valueClass: 'text-emerald-600',
        },
        {
          key: 'totalEarnings',
          label: t('referralPage.detail.totalEarnings'),
          icon: Coins,
          value: formatCompactCurrency(referral.total_earnings ?? 0),
          title: formatCurrency(referral.total_earnings ?? 0),
          valueClass: 'text-amber-600',
        },
        {
          key: 'paidShare',
          label: t('referralDetail.conversionRate'),
          icon: Percent,
          value: `${stats.paidShare}%`,
          title: t('referralDetail.conversionHint'),
        },
      ]
    : []

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <Button type='button' variant='outline' size='icon' asChild className='h-9 w-9 shrink-0'>
              <Link to='/referral-codes' aria-label={t('referralPage.detail.backBtn')}>
                <ArrowLeft className='h-4 w-4' aria-hidden />
              </Link>
            </Button>
            <div className='flex min-w-0 gap-3'>
              <span
                className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
                aria-hidden
              >
                <Percent className='h-5 w-5' />
              </span>
              <div className='min-w-0 space-y-1'>
                {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
                <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                  {t('referralPage.detail.title')}
                </h2>
                <p className='text-sm text-muted-foreground'>{t('referralPage.detail.subtitle')}</p>
              </div>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void refetch()}
            className='flex h-9 items-center gap-1.5 self-end sm:self-center'
          >
            <RefreshCw className='h-3.5 w-3.5' aria-hidden />
            {t('common.refresh')}
          </Button>
        </header>

        {!id && <ErrorComponent message={t('referralDetail.missingId')} />}

        {id && isPending && (
          <div aria-busy='true'>
            <span className='sr-only'>{t('referralPage.loadingBody')}</span>
            <TableSkeleton rows={6} />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center gap-3 py-6'>
            <ErrorComponent message={t('referralDetail.loadError')} />
            <Button variant='outline' onClick={() => void refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        )}

        {isSuccess && referral && (
          <>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
              {metrics.map((metric) => (
                <ReferralStatCard
                  key={metric.key}
                  label={metric.label}
                  value={metric.value}
                  icon={metric.icon}
                  title={metric.title}
                  valueClass={metric.valueClass}
                />
              ))}
            </div>

            <div className='grid gap-6 lg:grid-cols-3'>
              <section className='space-y-6 lg:col-span-1'>
                <div className='space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs'>
                  <h3 className='border-b border-border pb-3 text-sm font-bold uppercase tracking-wider text-foreground'>
                    {t('referralPage.detail.cardTitle')}
                  </h3>

                  <dl className='space-y-3.5 text-sm'>
                    <div>
                      <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {t('referralPage.detail.name')}
                      </dt>
                      <dd className='font-medium text-foreground'>{referral.name}</dd>
                    </div>

                    <div>
                      <dt className='mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {t('referralPage.detail.code')}
                      </dt>
                      <dd>
                        <code className='rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-foreground'>
                          {referral.code}
                        </code>
                      </dd>
                    </div>

                    <div>
                      <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {t('referralPage.detail.percent')}
                      </dt>
                      <dd className='font-bold tabular-nums text-foreground'>{referral.percent}%</dd>
                    </div>

                    <div>
                      <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {t('referralPage.detail.totalEarnings')}
                      </dt>
                      <dd className='font-bold tabular-nums text-amber-600 dark:text-amber-400'>
                        {formatCurrency(referral.total_earnings ?? 0)}
                      </dd>
                    </div>

                    <div className='flex items-center justify-between gap-3 border-y border-border py-3'>
                      <div className='min-w-0'>
                        <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          {t('referralPage.detail.status')}
                        </dt>
                        <dd className='flex items-center gap-1 text-xs text-muted-foreground'>
                          {isToggling && <Loader2 className='h-3 w-3 animate-spin' aria-hidden />}
                          {referral.is_active
                            ? t('referralPage.statusActive')
                            : t('referralPage.statusInactive')}
                        </dd>
                      </div>
                      {canUpdate ? (
                        <Switch
                          checked={referral.is_active}
                          disabled={isToggling}
                          onCheckedChange={handleToggleStatus}
                          aria-label={t('referralPage.toggleStatusAria', { code: referral.code })}
                        />
                      ) : (
                        <Badge
                          variant='outline'
                          className={
                            referral.is_active
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
                              : 'border-border text-muted-foreground'
                          }
                        >
                          {referral.is_active
                            ? t('referralPage.statusActive')
                            : t('referralPage.statusInactive')}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <dt className='flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        <Calendar className='h-3 w-3' aria-hidden />
                        {t('referralPage.detail.createdAt')}
                      </dt>
                      <dd className='text-xs text-foreground'>
                        {formatBackendDateTime(referral.created_at)}
                      </dd>
                    </div>

                    <div>
                      <dt className='flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        <Calendar className='h-3 w-3' aria-hidden />
                        {t('referralPage.detail.updatedAt')}
                      </dt>
                      <dd className='text-xs text-foreground'>
                        {formatBackendDateTime(referral.updated_at)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className='lg:col-span-2'>
                <div className='overflow-hidden rounded-xl border border-border bg-card shadow-xs'>
                  <div className='border-b border-border px-5 py-4'>
                    <h3 className='text-sm font-bold uppercase tracking-wider text-foreground'>
                      {t('referralPage.detail.txTitle')}
                    </h3>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {t('referralPage.detail.txSubtitle')}
                    </p>
                  </div>

                  <div className='p-4'>
                    <DataTable
                      columns={columns}
                      data={visibleTransactions}
                      getRowId={(row) => row.id}
                      caption={t('referralDetail.txTableCaption')}
                      stickyHeader
                      emptyMessage={<EmptyState message={t('referralPage.detail.txEmpty')} />}
                    />

                    {transactions.length > 0 && (
                      <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
                        <p className='text-xs text-muted-foreground'>
                          {t('referralDetail.showingTx', {
                            shown: visibleTransactions.length,
                            count: transactions.length,
                          })}
                        </p>
                        {visibleTransactions.length < transactions.length && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setShown((prev) => prev + TX_PAGE_SIZE)}
                          >
                            {t('referralDetail.showMoreTx')}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
