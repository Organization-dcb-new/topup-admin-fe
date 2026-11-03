import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  BarChart2,
  CheckCircle,
  Coins,
  Pencil,
  Percent,
  RefreshCw,
  Ticket,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import { AuthAlert, AuthPanelHeader, HudCard } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DataTable } from '@/components/Layout/table-data'
import { ReferralFormDialog } from '@/components/Referral/ReferralFormDialog'
import { CopyCodeButton, ReferralStatusToggle, ReferralTicket } from '@/components/Referral/ReferralParts'
import { PERM } from '@/constants/permissions'
import { useDeleteReferralCode, useGetReferralCodeById } from '@/hooks/useReferral'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const STATUS_STYLE: Record<Payment['status'], string> = {
  PAID: 'bg-emerald-50 text-emerald-700',
  PROCESSING: 'bg-sky-50 text-sky-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-rose-50 text-rose-700',
  EXPIRED: 'bg-rose-50 text-rose-700',
}

const STATUS_DOT: Record<Payment['status'], string> = {
  PAID: 'bg-emerald-500',
  PROCESSING: 'bg-sky-500 animate-pulse',
  PENDING: 'bg-amber-500 animate-pulse',
  FAILED: 'bg-rose-500',
  EXPIRED: 'bg-rose-500',
}

const actionButtonClass =
  'inline-flex h-9 items-center gap-2 bg-white px-3 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'

export default function ReferralDetailPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, isFetching, refetch } = useGetReferralCodeById(id)
  const deleteReferral = useDeleteReferralCode()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const referral = data?.data

  const stats = useMemo(() => {
    const transactions = referral?.transactions ?? []
    const paid = transactions.filter((tx) => tx.status === 'PAID')
    return {
      total: transactions.length,
      paid: paid.length,
      volume: paid.reduce((sum, tx) => sum + tx.amount, 0),
      conversion: transactions.length > 0 ? Math.round((paid.length / transactions.length) * 100) : 0,
    }
  }, [referral])

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: 'payment_number',
        header: t('referralPage.detail.table.paymentNo'),
        cell: ({ row }) => (
          <Link
            to={`/transactions/${row.original.id}`}
            className='font-mono text-xs font-semibold text-brand-purple hover:underline'
          >
            {row.original.payment_number}
          </Link>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <span className='block text-right'>{t('referralPage.detail.table.amount')}</span>,
        cell: ({ row }) => (
          <span className='block text-right font-semibold tabular-nums text-slate-900'>
            {formatIdr(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'margin',
        header: () => <span className='block text-right'>{t('referralPage.detail.table.margin')}</span>,
        cell: ({ row }) => (
          <span className='block text-right tabular-nums text-slate-600'>{formatIdr(row.original.margin ?? 0)}</span>
        ),
      },
      {
        accessorKey: 'earnings',
        header: () => <span className='block text-right'>{t('referralPage.detail.table.commission')}</span>,
        cell: ({ row }) => (
          <span
            className={cn(
              'block text-right font-semibold tabular-nums',
              row.original.earnings ? 'text-amber-600' : 'text-slate-400'
            )}
          >
            {formatIdr(row.original.earnings ?? 0)}
          </span>
        ),
      },
      {
        accessorKey: 'payment_channel',
        header: t('referralPage.detail.table.channel'),
        cell: ({ row }) => (
          <span className='bg-slate-100 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 hud-clip-sm'>
            {row.original.payment_channel}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('referralPage.detail.table.status'),
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
                STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-600'
              )}
            >
              <span className={cn('size-1.5 rounded-full', STATUS_DOT[status] ?? 'bg-slate-400')} aria-hidden />
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: t('referralPage.detail.table.date'),
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-xs tabular-nums text-slate-500'>
            {formatBackendDateTime(row.original.created_at, 'dd MMM yyyy, HH:mm')}
          </span>
        ),
      },
    ],
    [t]
  )

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <Link
          to='/referral-codes'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft
            className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5'
            aria-hidden
          />
          {t('referralPage.detail.backBtn')}
        </Link>

        {isLoading && <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('referralPage.toastError')}</AuthAlert>}

        {referral && (
          <>
            <HudCard className='animate-in fade-in slide-in-from-bottom-4 duration-700 ease-hud'>
              <AuthPanelHeader
                eyebrow={t('referralPage.detail.eyebrow')}
                icon={Ticket}
                title={referral.name}
                description={t('referralPage.detail.subtitle')}
              />

              <div className='grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center'>
                <ReferralTicket code={referral.code} percent={referral.percent} active={referral.is_active} size='lg' />

                <div className='space-y-4'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <ReferralStatusToggle referral={referral} />
                  </div>
                  <dl className='grid grid-cols-2 gap-3 text-xs'>
                    <div>
                      <dt className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
                        {t('referralPage.detail.createdAt')}
                      </dt>
                      <dd className='mt-0.5 text-slate-700'>{formatBackendDateTime(referral.created_at, 'dd MMM yyyy, HH:mm')}</dd>
                    </div>
                    <div>
                      <dt className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
                        {t('referralPage.detail.updatedAt')}
                      </dt>
                      <dd className='mt-0.5 text-slate-700'>{formatBackendDateTime(referral.updated_at, 'dd MMM yyyy, HH:mm')}</dd>
                    </div>
                  </dl>
                  <div className='flex flex-wrap gap-2'>
                    <CopyCodeButton code={referral.code} className='size-9 bg-white ring-1 ring-inset ring-slate-200' />
                    <Can permission={PERM.referralUpdate}>
                      <button
                        type='button'
                        onClick={() => setEditOpen(true)}
                        className={`${actionButtonClass} hover:text-brand-purple`}
                      >
                        <Pencil className='size-4' aria-hidden />
                        {t('referralPage.editBtn')}
                      </button>
                    </Can>
                    <Can permission={PERM.referralDelete}>
                      <button
                        type='button'
                        onClick={() => setDeleteOpen(true)}
                        className={`${actionButtonClass} hover:text-rose-600`}
                      >
                        <Trash2 className='size-4' aria-hidden />
                        {t('referralPage.deleteBtn')}
                      </button>
                    </Can>
                    <button
                      type='button'
                      onClick={() => void refetch()}
                      disabled={isFetching}
                      className={`${actionButtonClass} hover:text-brand-purple`}
                    >
                      <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
                      {t('common.refresh')}
                    </button>
                  </div>
                </div>
              </div>
            </HudCard>

            <ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
              <Metric order={0} icon={BarChart2} label={t('referralPage.detail.metrics.uses')} value={String(stats.total)} />
              <Metric order={1} icon={CheckCircle} label={t('referralPage.detail.metrics.paid')} value={String(stats.paid)} tone='emerald' />
              <Metric order={2} icon={TrendingUp} label={t('referralPage.detail.metrics.volume')} value={formatIdr(stats.volume)} tone='emerald' />
              <Metric order={3} icon={Coins} label={t('referralPage.detail.totalEarnings')} value={formatIdr(referral.total_earnings ?? 0)} tone='amber' />
              <Metric order={4} icon={Percent} label={t('referralPage.detail.metrics.conversion')} value={`${stats.conversion}%`} />
            </ul>

            <section className='overflow-hidden rounded-xl bg-white ring-1 ring-slate-200'>
              <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
              <div className='border-b border-slate-100 px-5 py-4'>
                <p className={hudEyebrowClass}>{t('referralPage.detail.txTitle')}</p>
                <p className='mt-1 text-sm text-slate-500'>{t('referralPage.detail.txSubtitle')}</p>
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
            </section>

            <ReferralFormDialog open={editOpen} onOpenChange={setEditOpen} referral={referral} />
            <DangerDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              eyebrow={t('referralPage.deleteConfirm.eyebrow')}
              title={t('referralPage.deleteConfirm.title', { code: referral.code })}
              description={t('referralPage.deleteConfirm.description')}
              confirmLabel={t('referralPage.deleteConfirm.confirm')}
              cancelLabel={t('referralPage.deleteConfirm.cancel')}
              pending={deleteReferral.isPending}
              onConfirm={() =>
                deleteReferral.mutate(referral.id, {
                  onSuccess: () => navigate('/referral-codes', { replace: true }),
                })
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

interface MetricProps {
  order: number
  icon: LucideIcon
  label: string
  value: string
  tone?: 'emerald' | 'amber'
}

function Metric({ order, icon: Icon, label, value, tone }: MetricProps) {
  return (
    <li
      className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${150 + order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='h-full bg-white p-4 hud-clip-sm'>
          <div className='flex items-center justify-between gap-2'>
            <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
            <Icon
              className={cn(
                'size-4 shrink-0',
                tone === 'emerald' ? 'text-emerald-500' : tone === 'amber' ? 'text-amber-500' : 'text-slate-400'
              )}
              aria-hidden
            />
          </div>
          <p
            className={cn(
              'mt-2 truncate font-display text-xl font-bold tabular-nums',
              tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-slate-900'
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </li>
  )
}
