import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DashboardFilters } from '@/components/Dashboard/DashboardFilters'
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton'
import { FailedReasonsCard } from '@/components/Dashboard/FailedReasonsCard'
import { KpiCards } from '@/components/Dashboard/KpiCards'
import { PendingAgingCard } from '@/components/Dashboard/PendingAgingCard'
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

  const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined
  const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined
  const params = { range, startDate, endDate }
  const needsDate = range === 'custom' && (!startDate || !endDate)

  const { data, isLoading, isError } = useDashboardOverview(params)
  const overview = data?.data

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <LayoutDashboard className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0'>
              <h1 className='text-xl font-semibold tracking-tight text-gray-900'>
                {t('dashboard.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>{t('dashboard.subtitle')}</p>
            </div>
          </div>
          <DashboardFilters
            range={range}
            onRangeChange={setRange}
            date={date}
            onDateChange={setDate}
          />
        </div>

        {needsDate ? (
          <div className='flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20'>
            <p className='text-sm text-muted-foreground'>{t('dashboard.pickDatePrompt')}</p>
          </div>
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : isError || !overview ? (
          <ErrorComponent message={t('dashboard.loadError')} />
        ) : (
          <div className='space-y-3'>
            <KpiCards summary={overview.summary} comparison={overview.comparison} />

            <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                {/* keyed by range → remount resets granularity ke default rentang baru */}
                <TransactionChart key={range} params={params} />
              </div>
              <StatusBreakdown
                statusBreakdown={overview.status_breakdown}
                successRate={overview.summary.success_rate}
                totalOrders={overview.summary.total_orders}
              />
            </div>

            <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
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
