import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { ChevronRight, RefreshCw, RotateCcw, Search, Truck } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { ProviderResultChip, SupplierCodeChip } from '@/components/IntegrationLog/integration-log-parts'
import { logCardClass, logRowLinkClass, useProviderLogLabel } from '@/components/IntegrationLog/integration-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { useDebounce } from '@/hooks/useDebounce'
import { useProviderOrderLogs } from '@/hooks/useIntegrationLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import { PROVIDER_LOG_OPERATIONS, type ProviderOrderLog } from '@/types/integration-log'

const PAGE_SIZE = 30
const OPERATION_FILTERS = ['all', ...PROVIDER_LOG_OPERATIONS] as const
type OperationFilter = (typeof OPERATION_FILTERS)[number]
const RESULT_FILTERS = ['all', 'FAILED', 'SUCCESS', 'SENT'] as const
type ResultFilter = (typeof RESULT_FILTERS)[number]

export default function ProviderOrderLogPage() {
  const { t, i18n } = useTranslation('common')
  const [params] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [operation, setOperation] = useState<OperationFilter>('all')
  const [result, setResult] = useState<ResultFilter>('all')
  const [range, setRange] = useState<DateRange | undefined>()

  const debouncedSearch = useDebounce(search.trim(), 350)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useProviderOrderLogs({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    operation: operation === 'all' ? undefined : operation,
    result: result === 'all' ? undefined : result,
    startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
    endDate: range?.from ? format(range.to ?? range.from, 'yyyy-MM-dd') : undefined,
  })
  const logs = data?.data ?? []
  const total = data?.meta?.total_data

  const filtered = !!(search || operation !== 'all' || result !== 'all' || range?.from)
  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }
  const reset = () => {
    setSearch('')
    setOperation('all')
    setResult('all')
    setRange(undefined)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('providerOrderLogPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('providerOrderLogPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('providerOrderLogPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('providerOrderLogPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label={t('integrationLog.refresh')}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            </button>
          </div>
        </header>

        <div className={logCardClass}>
          <div className='space-y-3 bg-white p-4 hud-clip'>
            <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]'>
              <div className='group relative'>
                <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                  <Search className='size-4' aria-hidden />
                </span>
                <Input
                  value={search}
                  onChange={(e) => update(setSearch)(e.target.value)}
                  placeholder={t('providerOrderLogPage.searchPlaceholder')}
                  aria-label={t('providerOrderLogPage.searchPlaceholder')}
                  className={cn(hudInputClass, 'h-10 bg-white pl-10 font-mono text-sm')}
                />
              </div>
              <DateRangeFilter value={range} onChange={update(setRange)} placeholder={t('integrationLog.datePlaceholder')} />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Segmented
                value={operation}
                onChange={update(setOperation)}
                label={t('providerOrderLogPage.operationLabel')}
                options={OPERATION_FILTERS.map((o) => ({
                  value: o,
                  label: o === 'all' ? t('integrationLog.all') : t(`integrationLog.operation.${o}`),
                }))}
              />
              <Segmented
                value={result}
                onChange={update(setResult)}
                label={t('providerOrderLogPage.resultLabel')}
                options={RESULT_FILTERS.map((r) => ({
                  value: r,
                  label: r === 'all' ? t('integrationLog.all') : t(`integrationLog.result.${r}`),
                }))}
              />
              {filtered && (
                <button
                  type='button'
                  onClick={reset}
                  className='ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
                >
                  <RotateCcw className='size-3.5' aria-hidden />
                  {t('integrationLog.reset')}
                </button>
              )}
            </div>
          </div>
        </div>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('providerOrderLogPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('integrationLog.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && logs.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Truck className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {filtered ? t('integrationLog.noMatchTitle') : t('providerOrderLogPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {filtered ? t('integrationLog.noMatchBody') : t('providerOrderLogPage.emptyBody')}
            </p>
          </div>
        ) : (
          logs.length > 0 && (
            <div className={cn(logCardClass, 'transition-opacity duration-300', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {logs.map((log, index) => (
                  <ProviderLogRow key={log.id} log={log} order={index} />
                ))}
              </ul>
            </div>
          )
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>
    </DashboardLayout>
  )
}

function ProviderLogRow({ log, order }: { log: ProviderOrderLog; order: number }) {
  const { t } = useTranslation('common')
  const label = useProviderLogLabel()
  const { op, type } = label(log.operation, log.log_type)
  const reference = log.payment_number || log.order_id || t('providerOrderLogPage.noOrder')
  const detail = [
    log.provider_order_id && `TID ${log.provider_order_id}`,
    log.http_status_code ? `HTTP ${log.http_status_code}` : '',
    log.response_time_ms ? t('integrationLog.ms', { ms: log.response_time_ms }) : '',
    log.error_message,
  ].filter(Boolean)

  return (
    <li className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}>
      <Link
        to={`/provider-order-logs/${log.id}`}
        className={cn(logRowLinkClass, 'grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,14rem)_6.5rem_1rem]')}
      >
        <div className='hidden text-xs tabular-nums lg:block'>
          <p className='font-semibold text-slate-700'>{formatBackendDateTime(log.created_at, 'HH:mm:ss')}</p>
          <p className='text-slate-400'>{formatBackendDateTime(log.created_at, 'dd MMM yyyy')}</p>
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>
            {op} <span className='text-slate-400'>·</span> <span className='text-slate-600'>{type}</span>
          </p>
          <p className='truncate text-xs text-slate-500'>
            <span className='font-mono'>{reference}</span>
            {detail.length > 0 && ` · ${detail.join(' · ')}`}
            <span className='lg:hidden'> · {formatBackendDateTime(log.created_at, 'dd MMM, HH:mm')}</span>
          </p>
        </div>
        <div className='col-span-2 flex flex-wrap items-center gap-1.5 lg:col-span-1'>
          <SupplierCodeChip value={log.provider_code} />
          {log.provider_status && log.provider_status !== log.provider_code && <SupplierCodeChip value={log.provider_status} />}
        </div>
        <div className='col-start-2 row-start-1 justify-self-end lg:col-start-auto lg:row-start-auto lg:justify-self-start'>
          <ProviderResultChip result={log.result} />
        </div>
        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </Link>
    </li>
  )
}
