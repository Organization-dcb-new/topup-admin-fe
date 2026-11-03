import { useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { FileDown, ReceiptText, RefreshCw, RotateCcw } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { TransactionExportDialog } from '@/components/Transaction/TransactionExportDialog'
import { TransactionFilterBar } from '@/components/Transaction/TransactionFilterBar'
import { TransactionList } from '@/components/Transaction/TransactionList'
import { TransactionStats } from '@/components/Transaction/TransactionStats'
import { computeStats } from '@/components/Transaction/transaction-meta'
import { EMPTY_FILTERS, hasAnyFilter, toListQuery, type TransactionFilterState } from '@/components/Transaction/transaction-filters'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PERM } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTransactions } from '@/hooks/useTransaction'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20
/** Auto-refresh choices; 0 turns it off. */
const REFRESH_OPTIONS = [
  { ms: 0, key: 'off' },
  { ms: 10_000, key: 's10' },
  { ms: 30_000, key: 's30' },
  { ms: 60_000, key: 'm1' },
] as const

export default function TransactionPage() {
  const { t, i18n } = useTranslation('common')
  const [filters, setFilters] = useState<TransactionFilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [refreshMs, setRefreshMs] = useState(10_000)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportSession, setExportSession] = useState(0)

  // Typed values settle before they reach the backend.
  const search = useDebounce(filters.search, 400)
  const priceAbove = useDebounce(filters.priceAbove, 400)
  const priceBelow = useDebounce(filters.priceBelow, 400)
  const price = useDebounce(filters.price, 400)
  const query = toListQuery({ ...filters, search, priceAbove, priceBelow, price }, page, PAGE_SIZE)

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch, dataUpdatedAt } = useGetTransactions(query, refreshMs || false)
  const rows = data?.data ?? []
  const total = data?.meta?.total_data ?? 0
  const filtered = hasAnyFilter(filters)
  const locale = i18n.resolvedLanguage

  // Any filter change starts from the first page again.
  const change = (patch: Partial<TransactionFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }
  const reset = () => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }
  const openExport = () => {
    setExportSession((n) => n + 1)
    setExportOpen(true)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='min-w-0 space-y-1'>
            <p className={hudEyebrowClass}>{t('transactionPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('transactionPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('transactionPage.subtitle')}</p>
          </div>
          <div className='flex flex-wrap items-center gap-2 lg:shrink-0 lg:flex-nowrap'>
            {dataUpdatedAt > 0 && (
              <span className='mr-1 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('transactionPage.updatedAt', { time: format(dataUpdatedAt, 'HH:mm:ss') })}
              </span>
            )}
            <Select value={String(refreshMs)} onValueChange={(v) => setRefreshMs(Number(v))}>
              <SelectTrigger aria-label={t('transactionPage.autoRefresh')} className='h-9 w-auto min-w-36 bg-white text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((option) => (
                  <SelectItem key={option.ms} value={String(option.ms)}>
                    {t(`transactionPage.autoRefreshOption.${option.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label={t('transactionPage.refresh')}
              title={t('transactionPage.refresh')}
              className='grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            </button>
            <Can permission={PERM.transactionExport}>
              <button
                type='button'
                onClick={openExport}
                className='inline-flex h-9 items-center gap-2 bg-brand-purple px-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hud-clip-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 focus-visible:ring-offset-2'
              >
                <FileDown className='size-4' aria-hidden />
                {t('transactionPage.exportButton')}
              </button>
            </Can>
          </div>
        </header>

        <TransactionFilterBar value={filters} onChange={change} onReset={reset} advancedOpen={advancedOpen} onAdvancedOpenChange={setAdvancedOpen} />

        {(isLoading || data) && <TransactionStats stats={computeStats(data?.meta, rows)} loading={isLoading} />}

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('transactionPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('transactionPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-[28rem] animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : rows.length > 0 ? (
          <section className='space-y-2' aria-label={t('transactionPage.listLabel')}>
            <p className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('transactionPage.range', {
                from: ((page - 1) * PAGE_SIZE + 1).toLocaleString(locale),
                to: Math.min(page * PAGE_SIZE, total).toLocaleString(locale),
                total: total.toLocaleString(locale),
              })}
            </p>
            <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
              <TransactionList rows={rows} busy={isFetching} />
            </div>
          </section>
        ) : (
          !isError && (
            <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
              <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <ReceiptText className='size-6' aria-hidden />
              </span>
              <h2 className='font-display text-xl font-bold text-slate-900'>
                {filtered ? t('transactionPage.noMatchTitle') : t('transactionPage.emptyTitle')}
              </h2>
              <p className='mt-1 max-w-sm text-sm text-slate-500'>{filtered ? t('transactionPage.noMatchBody') : t('transactionPage.emptyBody')}</p>
              {filtered && (
                <button
                  type='button'
                  onClick={reset}
                  className='mt-5 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10'
                >
                  <RotateCcw className='size-4' aria-hidden />
                  {t('transactionPage.filters.reset')}
                </button>
              )}
            </div>
          )
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>

      <TransactionExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        session={exportSession}
        defaults={{ range: filters.range, status: filters.status, paymentMethodId: filters.paymentMethodId }}
        hasUnsupportedFilters={!!(filters.search.trim() || filters.gameId || filters.priceAbove || filters.priceBelow || filters.price)}
      />
    </DashboardLayout>
  )
}
