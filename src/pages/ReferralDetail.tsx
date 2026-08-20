import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { PaymentStatusTag } from '@/components/Transaction/TransactionCells'
import { Switch } from '@/components/ui/switch'
import { useGetReferralCodeById, useUpdateReferralCode } from '@/hooks/useReferral'
import { formatBackendDateTime, parseBackendDate } from '@/lib/backend-datetime'
import {
  nbAccent,
  nbBox,
  nbCode,
  nbHint,
  nbIconButton,
  nbLink,
  nbMutedLabel,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPanel,
  nbPanelHeader,
  nbSectionTitle,
  nbSwitch,
  nbTable,
  nbTag,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import i18n from '@/i18n'
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Loader2,
  Percent,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

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

/** Satu angka ringkasan pemakaian kode referral. */
function StatTile({
  label,
  value,
  icon: Icon,
  accent,
  valueClass,
}: {
  label: string
  value: string
  icon: LucideIcon
  accent: string
  valueClass?: string
}) {
  return (
    <div className={cn(nbBox, 'p-3')}>
      <div className='flex items-center justify-between gap-2'>
        <p className={cn('truncate', nbMutedLabel)}>{label}</p>
        <span
          className={cn(
            'nb-frame nb-frame-thin flex h-7 w-7 shrink-0 items-center justify-center',
            accent,
          )}
        >
          <Icon className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </span>
      </div>
      <p className='mt-2 text-xl font-black leading-tight tabular-nums'>
        <span className={cn('inline-block', valueClass)}>{value}</span>
      </p>
    </div>
  )
}

/** Satu baris label + nilai di kartu informasi. */
function InfoRow({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1'>
      <span className={cn('flex items-center gap-1', nbMutedLabel)}>
        {Icon && <Icon className='h-3 w-3' strokeWidth={3} aria-hidden />}
        {label}
      </span>
      <div className='text-sm font-black'>{children}</div>
    </div>
  )
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

  const stats = useMemo(() => {
    const transactions = referral?.transactions ?? []
    const totalCount = transactions.length
    const paidTransactions = transactions.filter((tx) => tx.status === 'PAID')
    const paidCount = paidTransactions.length
    const totalVolume = paidTransactions.reduce((acc, curr) => acc + curr.amount, 0)
    const successRate = totalCount > 0 ? Math.min(Math.round((paidCount / totalCount) * 100), 100) : 0

    return { totalCount, paidCount, totalVolume, successRate }
  }, [referral])

  const columns = useMemo<ColumnDef<Payment>[]>(() => {
    return [
      {
        accessorKey: 'payment_number',
        header: t('referralPage.detail.table.paymentNo'),
        cell: ({ row }) => (
          <Link to={`/transactions/${row.original.id}`} className={cn(nbLink, 'font-mono text-xs')}>
            {row.original.payment_number}
          </Link>
        ),
      },
      {
        accessorKey: 'order_id',
        header: t('referralPage.detail.table.orderId'),
        cell: ({ row }) => (
          <span
            className='block max-w-[120px] truncate font-mono text-xs font-bold text-[#111]/70'
            title={row.original.order_id}
          >
            {row.original.order_id}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <span className='block text-right'>{t('referralPage.detail.table.amount')}</span>,
        cell: ({ row }) => (
          <span className='block text-right font-black tabular-nums'>
            {formatIdr(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'payment_channel',
        header: t('referralPage.detail.table.channel'),
        cell: ({ row }) => <span className={nbCode}>{row.original.payment_channel}</span>,
      },
      {
        accessorKey: 'status',
        header: t('referralPage.detail.table.status'),
        cell: ({ row }) => <PaymentStatusTag status={row.original.status} t={t} />,
      },
      {
        accessorKey: 'created_at',
        header: t('referralPage.detail.table.date'),
        cell: ({ row }) => {
          const date = parseBackendDate(row.original.created_at)
          return (
            <span className='whitespace-nowrap text-xs font-bold tabular-nums text-[#111]/70'>
              {date ? format(date, 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale() }) : '—'}
            </span>
          )
        },
      },
    ]
  }, [t])

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
          )}
        >
          <div className='flex items-start gap-3'>
            <Link
              to='/referral-codes'
              aria-label={t('referralPage.detail.backBtn')}
              className={cn(nbIconButton, nbAccent.white, 'h-10 w-10')}
            >
              <ArrowLeft className='h-4 w-4' strokeWidth={3} aria-hidden />
            </Link>
            <div className='flex min-w-0 gap-3'>
              <span className={cn(nbPageIcon, nbAccent.pink)}>
                <Percent className='h-5 w-5' strokeWidth={2.5} aria-hidden />
              </span>
              <div className='min-w-0 space-y-1.5'>
                <h1 className={nbPageTitle}>{t('referralPage.detail.title')}</h1>
                <p className={nbPageSubtitle}>{t('referralPage.detail.subtitle')}</p>
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={() => void refetch()}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 bg-[#6fe3f5] px-4 text-xs font-black uppercase tracking-[0.14em]'
          >
            <RefreshCw className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
            {t('common.refresh')}
          </button>
        </div>

        {isLoading && (
          <div
            className={cn(
              nbPanel,
              'flex min-h-[20rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center',
                nbAccent.cyan,
              )}
            >
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <p className={nbSectionTitle}>{t('providerPage.loadingShort')}</p>
          </div>
        )}

        {!id && (
          <div className={nbPanel}>
            <ErrorComponent message='Missing referral code ID' />
          </div>
        )}
        {isError && (
          <div className={nbPanel}>
            <ErrorComponent message={t('referralPage.toastError')} />
          </div>
        )}

        {isSuccess && referral && (
          <>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
              <StatTile
                label={t('referralPage.detail.stats.totalUses')}
                value={String(stats.totalCount)}
                icon={BarChart2}
                accent={nbAccent.cyan}
              />
              <StatTile
                label={t('referralPage.detail.stats.successfulUses')}
                value={String(stats.paidCount)}
                icon={CheckCircle}
                accent={nbAccent.lime}
              />
              <StatTile
                label={t('referralPage.detail.stats.salesVolume')}
                value={formatIdr(stats.totalVolume)}
                icon={TrendingUp}
                accent={nbAccent.lime}
                valueClass='bg-[#c9f24d] px-1'
              />
              <StatTile
                label={t('referralPage.detail.totalEarnings')}
                value={formatIdr(referral.total_earnings ?? 0)}
                icon={Coins}
                accent={nbAccent.yellow}
                valueClass='bg-[#ffd84d] px-1'
              />
              <StatTile
                label={t('referralPage.detail.stats.conversionRate')}
                value={`${stats.successRate}%`}
                icon={Clock}
                accent={nbAccent.orange}
              />
            </div>

            <div className='grid gap-5 lg:grid-cols-3'>
              <div className={cn(nbPanel, 'lg:col-span-1')}>
                <div className={cn(nbPanelHeader, nbAccent.pink)}>
                  <h2 className={nbSectionTitle}>{t('referralPage.detail.cardTitle')}</h2>
                </div>

                <div className='space-y-4 p-4'>
                  <InfoRow label={t('referralPage.detail.name')}>{referral.name}</InfoRow>

                  <InfoRow label={t('referralPage.detail.code')}>
                    <code className={nbCode}>{referral.code}</code>
                  </InfoRow>

                  <InfoRow label={t('referralPage.detail.percent')}>
                    <span className='tabular-nums'>{referral.percent}%</span>
                  </InfoRow>

                  <InfoRow label={t('referralPage.detail.totalEarnings')}>
                    <span className='inline-block bg-[#ffd84d] px-1 tabular-nums'>
                      {formatIdr(referral.total_earnings ?? 0)}
                    </span>
                  </InfoRow>

                  <div className='nb-frame nb-frame-thin flex items-center justify-between gap-3 bg-[#f5f1e8] px-3 py-2.5'>
                    <div className='min-w-0'>
                      <span className={nbMutedLabel}>{t('referralPage.detail.status')}</span>
                      <p className='text-xs font-black uppercase tracking-[0.12em]'>
                        {referral.is_active
                          ? t('referralPage.statusActive')
                          : t('referralPage.statusInactive')}
                      </p>
                    </div>
                    <Switch
                      className={nbSwitch}
                      checked={referral.is_active}
                      onCheckedChange={handleToggleStatus}
                      aria-label={t('referralPage.form.statusLabel')}
                    />
                  </div>

                  <InfoRow label={t('referralPage.detail.createdAt')} icon={Calendar}>
                    <span className='text-xs tabular-nums'>
                      {formatBackendDateTime(referral.created_at)}
                    </span>
                  </InfoRow>

                  <InfoRow label={t('referralPage.detail.updatedAt')} icon={Calendar}>
                    <span className='text-xs tabular-nums'>
                      {formatBackendDateTime(referral.updated_at)}
                    </span>
                  </InfoRow>
                </div>
              </div>

              <div className='min-w-0 space-y-4 lg:col-span-2'>
                <div
                  className={cn(
                    nbPanel,
                    'flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
                  )}
                >
                  <div className='min-w-0'>
                    <h2 className={nbSectionTitle}>{t('referralPage.detail.txTitle')}</h2>
                    <p className={cn('mt-0.5', nbHint)}>{t('referralPage.detail.txSubtitle')}</p>
                  </div>
                  <p className={cn(nbTag, nbAccent.cyan, 'self-start sm:self-auto')}>
                    <span className='tabular-nums'>{stats.totalCount}</span>
                  </p>
                </div>

                <DataTable
                  className={nbTable}
                  getRowId={(row) => row.id}
                  columns={columns}
                  data={referral.transactions ?? []}
                  emptyMessage={t('referralPage.detail.txEmpty')}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
