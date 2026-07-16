import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetCashflows } from '@/hooks/useCashflow'
import { getCashflowColumns } from '@/tables/table-cashflow'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle, Banknote, CheckCircle2, Loader2, FilterX, CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const PAGE_LIMIT = 10

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CashflowPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [cashflowType, setCashflowType] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>(undefined)

  const queryType = cashflowType === 'all' ? '' : cashflowType
  const startDateStr = date?.from ? format(date.from, 'yyyy-MM-dd') : ''
  const endDateStr = date?.to ? format(date.to, 'yyyy-MM-dd') : ''

  const { data, isLoading, isSuccess, isError } = useGetCashflows(
    page,
    PAGE_LIMIT,
    queryType,
    startDateStr,
    endDateStr,
  )

  const handleReset = () => {
    setPage(1)
    setCashflowType('all')
    setDate(undefined)
  }

  const tableRows = data?.data ?? []
  const columns = useMemo(() => getCashflowColumns(t), [t])

  const showReset = cashflowType !== 'all' || !!date

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Banknote className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                {t('cashflowPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {t('cashflowPage.subtitle', { limit: PAGE_LIMIT })}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-1 sm:text-right'>
            {isLoading && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin text-primary' aria-hidden />
                {t('cashflowPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className='flex items-center gap-2 text-sm font-medium text-destructive'>
                <AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
                {t('cashflowPage.loadFailedShort')}
              </p>
            )}
            {isSuccess && data && (
              <p className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
                <span className='tabular-nums text-foreground'>
                  {t('cashflowPage.totalRows', {
                    count: (data.meta.total ?? 0).toLocaleString('id-ID'),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {isSuccess && data?.stats && (() => {
          const netProfit = data.stats.net_profit
          const isPositiveProfit = netProfit >= 0
          return (
            <Card className='w-full overflow-hidden rounded-xl border shadow-sm ring-1 ring-gray-900/5 border-l-4 border-l-primary bg-white'>
              <CardHeader className='border-b border-gray-100 pb-4'>
                <CardTitle className='text-lg font-semibold tracking-tight text-gray-900'>
                  {t('cashflowPage.statsTitle')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t('cashflowPage.statsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                {/* Row 1: Key Financials */}
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8'>
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.totalRevenue')}
                    </p>
                    <p className='text-2xl font-bold tabular-nums text-emerald-600'>
                      {formatCurrency(data.stats.total_revenue)}
                    </p>
                  </div>

                  <div className='space-y-2 md:border-l md:border-border/85 md:pl-8'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.totalOutflow')}
                    </p>
                    <p className='text-2xl font-bold tabular-nums text-amber-600'>
                      {formatCurrency(data.stats.total_outflow)}
                    </p>
                  </div>

                  <div className='space-y-2 md:border-l md:border-border/85 md:pl-8'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.netProfit')}
                    </p>
                    <p
                      className={cn(
                        'text-2xl font-extrabold tabular-nums',
                        isPositiveProfit ? 'text-emerald-600' : 'text-destructive',
                      )}
                    >
                      {formatCurrency(netProfit)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t border-gray-100' />

                {/* Row 2: Breakdown & Margins */}
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8'>
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.totalOutProvider')}
                    </p>
                    <p className='text-2xl font-semibold tabular-nums text-gray-900'>
                      {formatCurrency(data.stats.total_out_provider)}
                    </p>
                  </div>

                  <div className='space-y-2 md:border-l md:border-border/85 md:pl-8'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.totalOutPG')}
                    </p>
                    <p className='text-2xl font-semibold tabular-nums text-gray-900'>
                      {formatCurrency(data.stats.total_out_pg)}
                    </p>
                  </div>

                  <div className='space-y-2 md:border-l md:border-border/85 md:pl-8'>
                    <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('cashflowPage.selisihPg')}
                    </p>
                    <p className='text-2xl font-bold tabular-nums text-primary'>
                      {formatCurrency(data.stats.selisih_pg)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* Filter Toolbar */}
        <div className='flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4 shadow-sm'>
          {/* Date Picker Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                aria-label={t('cashflowFilter.pickDateAria')}
                className={`w-65 justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>{t('cashflowFilter.pickDateRange')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                selected={date}
                onSelect={(d) => {
                  setDate(d)
                  setPage(1)
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Type Filter */}
          <Select
            value={cashflowType}
            onValueChange={(val) => {
              setCashflowType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder={t('cashflowFilter.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('cashflowFilter.all')}</SelectItem>
              <SelectItem value='PROVIDER'>{t('cashflowFilter.provider')}</SelectItem>
              <SelectItem value='PAYMENT_GATEWAY'>{t('cashflowFilter.pg')}</SelectItem>
              <SelectItem value='REVENUE'>{t('cashflowFilter.revenue')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='ghost'
            onClick={handleReset}
            className='text-muted-foreground'
            disabled={!showReset}
          >
            <FilterX className='mr-2 h-4 w-4' />
            {t('cashflowFilter.reset')}
          </Button>
        </div>

        {isLoading && (
          <div
            className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12 shadow-sm ring-1 ring-gray-900/5'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
            <div className='text-center'>
              <p className='text-sm font-medium text-foreground'>{t('cashflowPage.tableLoadingTitle')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('cashflowPage.tableLoadingHint')}</p>
            </div>
          </div>
        )}

        {isError && <ErrorComponent message={t('cashflowPage.loadErrorDetail')} />}

        {isSuccess && data && (
          <div className='overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5'>
            <div className='min-w-0 p-3 sm:p-4'>
              <div className='max-h-[min(70vh,40rem)] min-w-0 w-full overflow-auto overscroll-contain'>
                <DataTable
                  columns={columns}
                  data={tableRows}
                  emptyMessage={t('cashflowPage.emptyPage')}
                />
              </div>
              <div className='mt-4'>
                <Pagination
                  page={page}
                  totalPage={data.meta.last_page}
                  onChange={setPage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
