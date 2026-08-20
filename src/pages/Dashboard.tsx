import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DashboardFilters } from '@/components/Dashboard/DashboardFilters'
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton'
import { FailedReasonsCard } from '@/components/Dashboard/FailedReasonsCard'
import { KpiCards } from '@/components/Dashboard/KpiCards'
import { PendingAgingCard } from '@/components/Dashboard/PendingAgingCard'
import { ServerHealthAlert } from '@/components/Dashboard/ServerHealthAlert'
import { StatusBreakdown } from '@/components/Dashboard/StatusBreakdown'
import { TopLists } from '@/components/Dashboard/TopLists'
import { TransactionChart } from '@/components/Dashboard/TransactionChart'
import { useDashboardOverview } from '@/hooks/useDashboard'
import type { DashboardRange } from '@/types/dashboard'
import { format } from 'date-fns'
import { LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const [range, setRange] = useState<DashboardRange>('today')
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  const [pollingInterval, setPollingInterval] = useState<number | false>(60_000)

  const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined
  const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
  const params = { range, startDate, endDate }
  const needsDate = range === 'custom' && (!startDate || !endDate)

  const { data, isLoading, isError, refetch, isRefetching } = useDashboardOverview(params, {
    refetchInterval: pollingInterval,
  })
  const overview = data?.data

  return (
    <DashboardLayout>
      <div className='w-full space-y-4'>
        <ServerHealthAlert />

        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5'>
          <div className='flex gap-3'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#c9f24d]'>
              <LayoutDashboard className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
                {t('dashboard.title')}
              </h1>
              <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          <DashboardFilters
            range={range}
            onRangeChange={setRange}
            date={date}
            onDateChange={setDate}
            pollingInterval={pollingInterval}
            onPollingIntervalChange={setPollingInterval}
            onRefresh={() => void refetch()}
            isRefreshing={isRefetching}
          />
        </div>

        {needsDate ? (
          <div className='nb-frame nb-frame-thick nb-sd flex min-h-64 items-center justify-center bg-white px-6 text-center'>
            <p className='text-xs font-bold uppercase tracking-tight text-[#111]/55'>
              {t('dashboard.pickDatePrompt')}
            </p>
          </div>
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : isError || !overview ? (
          <div className='nb-frame nb-frame-thick nb-sd bg-white'>
            <ErrorComponent message={t('dashboard.loadError')} />
          </div>
        ) : (
          <div className='space-y-4'>
            <KpiCards summary={overview.summary} comparison={overview.comparison} />

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <TransactionChart params={params} pollingInterval={pollingInterval} />
              </div>
              <StatusBreakdown
                statusBreakdown={overview.status_breakdown}
                successRate={overview.summary.success_rate}
                totalOrders={overview.summary.total_orders}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
              <PendingAgingCard pendingAging={overview.pending_aging} />
              <div className='lg:col-span-2'>
                <FailedReasonsCard failedReasons={overview.failed_reasons} />
              </div>
            </div>

            <TopLists
              topProducts={overview.top_products}
              topGames={overview.top_games}
              topPaymentMethods={overview.top_payment_methods}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
