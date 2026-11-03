import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarRange, RefreshCw } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardFilters } from '@/components/Dashboard/DashboardFilters'
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton'
import { FailedReasonsCard } from '@/components/Dashboard/FailedReasonsCard'
import { KpiCards } from '@/components/Dashboard/KpiCards'
import { PendingAgingCard } from '@/components/Dashboard/PendingAgingCard'
import { ServerHealthAlert } from '@/components/Dashboard/ServerHealthAlert'
import { StatusBreakdown } from '@/components/Dashboard/StatusBreakdown'
import { TopLists } from '@/components/Dashboard/TopLists'
import { TransactionChart } from '@/components/Dashboard/TransactionChart'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { useDashboardOverview } from '@/hooks/useDashboard'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { DashboardRange, DashboardTimeRange } from '@/types/dashboard'

function formatPeriod({ start, end }: DashboardTimeRange, locale: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(locale, { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation('common')
  const { user } = useAuthUser()
  const [range, setRange] = useState<DashboardRange>('today')
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  const [pollingInterval, setPollingInterval] = useState<number | false>(60_000)

  const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined
  const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
  const params = { range, startDate, endDate }
  const needsDate = range === 'custom' && (!startDate || !endDate)

  const { data, isLoading, isError, refetch, isFetching, isPlaceholderData, dataUpdatedAt } = useDashboardOverview(params, {
    refetchInterval: pollingInterval,
  })
  const overview = data?.data
  const name = user?.username || user?.email?.split('@')[0]

  return (
    <DashboardLayout>
      <div className='mx-auto w-full max-w-7xl space-y-5'>
        <ServerHealthAlert />

        <header className='space-y-1'>
          <p className={hudEyebrowClass}>{t('dashboard.eyebrow')}</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
            {name ? t('dashboard.greeting', { name }) : t('dashboard.title')}
          </h1>
          <p className='flex items-start gap-2 text-sm text-slate-500'>
            {overview && !needsDate ? (
              <>
                <CalendarRange className='mt-0.5 size-4 shrink-0 text-slate-400' aria-hidden />
                <span className='min-w-0'>{formatPeriod(overview.range, i18n.language)} WIB</span>
              </>
            ) : (
              t('dashboard.subtitle')
            )}
          </p>
        </header>

        <DashboardFilters
          range={range}
          onRangeChange={setRange}
          date={date}
          onDateChange={setDate}
          pollingInterval={pollingInterval}
          onPollingIntervalChange={setPollingInterval}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
          updatedAt={needsDate ? undefined : dataUpdatedAt}
        />

        {needsDate ? (
          <div className='grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center animate-in fade-in duration-300'>
            <div className='space-y-3'>
              <span className='mx-auto grid size-12 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <CalendarRange className='size-5' aria-hidden />
              </span>
              <p className='text-sm text-slate-500'>{t('dashboard.pickDatePrompt')}</p>
            </div>
          </div>
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : isError && !overview ? (
          <div className='space-y-3'>
            <AuthAlert>{t('dashboard.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('dashboard.retry')}
            </button>
          </div>
        ) : overview ? (
          <div
            className={cn('space-y-4 transition-opacity duration-300', isPlaceholderData && 'opacity-60')}
            aria-busy={isFetching}
          >
            <KpiCards summary={overview.summary} comparison={overview.comparison} params={params} />

            <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
              <div className='min-w-0 xl:col-span-2'>
                <TransactionChart params={params} order={2} />
              </div>
              <StatusBreakdown
                order={3}
                statusBreakdown={overview.status_breakdown}
                successRate={overview.summary.success_rate}
                totalOrders={overview.summary.total_orders}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <PendingAgingCard order={4} pendingAging={overview.pending_aging} />
              <div className='min-w-0 lg:col-span-2'>
                <FailedReasonsCard order={5} failedReasons={overview.failed_reasons} />
              </div>
            </div>

            <TopLists
              order={6}
              topProducts={overview.top_products}
              topGames={overview.top_games}
              topPaymentMethods={overview.top_payment_methods}
            />
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
