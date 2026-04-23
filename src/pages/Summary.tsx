import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import SummaryCard from '@/components/Summary/Summary'
import { SummaryFilter } from '@/components/Summary/SummaryFilter'
import { useGetSummary } from '@/hooks/useSummary'
import { getSummaryColumns } from '@/tables/table-summary'
import { format } from 'date-fns'
import { AlertCircle, BarChart3, CheckCircle2, Loader2 } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const PAGE_LIMIT = 10

export default function SummaryPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [groupBy, setGroupBy] = useState('hour')
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
  const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : ''

  const { data, isLoading, isSuccess, isError } = useGetSummary(
    page,
    PAGE_LIMIT,
    startDate,
    endDate,
    groupBy,
  )

  const handleReset = () => {
    setPage(1)
    setGroupBy('hour')
    setDate(undefined)
  }

  const tableRows = data?.data.data ?? []
  const summaryColumns = useMemo(() => getSummaryColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <BarChart3 className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                {t('summaryPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('summaryPage.subtitle', { limit: PAGE_LIMIT })}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('summaryPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('summaryPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && data && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('summaryPage.totalRows', {
                    count: (data.data.meta.total_data ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <SummaryFilter
          date={date}
          setDate={(d) => {
            setDate(d)
            setPage(1)
          }}
          groupBy={groupBy}
          setGroupBy={(v) => {
            setGroupBy(v)
            setPage(1)
          }}
          onReset={handleReset}
        />

        {isLoading && (
          <div
            className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12 shadow-sm ring-1 ring-gray-900/5'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
            <div className='text-center'>
              <p className='text-sm font-medium text-foreground'>{t('summaryPage.tableLoadingTitle')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('summaryPage.tableLoadingHint')}</p>
            </div>
          </div>
        )}

        {isError && <ErrorComponent message={t('summaryPage.loadErrorDetail')} />}

        {isSuccess && data && (
          <div className='space-y-6'>
            <SummaryCard stats={data.data.overall_stats} />

            <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
              <div className='border-b border-gray-100 px-4 py-3 sm:px-5'>
                <div className='min-w-0 space-y-0.5'>
                  <h2 className='text-sm font-semibold text-gray-900'>
                    {t('summaryPage.detailSectionTitle')}
                  </h2>
                  <p className='text-xs text-muted-foreground'>{t('summaryPage.detailSectionHint')}</p>
                </div>
              </div>
              <div className='min-w-0 p-3 sm:p-4'>
                <div className='max-h-[min(70vh,40rem)] min-w-0 w-full overflow-auto overscroll-contain'>
                  <DataTable
                    columns={summaryColumns}
                    data={tableRows}
                    emptyMessage={t('summaryPage.emptyPage')}
                  />
                </div>
                <div className='mt-4'>
                  <Pagination
                    page={page}
                    totalPage={data.data.meta.total_pages}
                    onChange={setPage}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
