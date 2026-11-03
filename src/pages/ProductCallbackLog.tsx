import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ChevronRight, Coins, RadioTower, RefreshCw, RotateCcw, Search } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { Segmented } from '@/components/ui/segmented'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { PriceDelta, StockChip } from '@/components/ProductCallbackLog/callback-log-parts'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetProductCallbackLogs } from '@/hooks/useProductCallbackLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductCallbackLogResponse } from '@/types/product_callback_log'

const PAGE_SIZE = 30

type StockFilter = 'all' | 'available' | 'empty'
const SORTS = {
  newest: { sortBy: 'created_at', sortOrder: 'desc' },
  oldest: { sortBy: 'created_at', sortOrder: 'asc' },
  priceHigh: { sortBy: 'price', sortOrder: 'desc' },
  priceLow: { sortBy: 'price', sortOrder: 'asc' },
  code: { sortBy: 'product_code', sortOrder: 'asc' },
} as const
type SortKey = keyof typeof SORTS

export default function ProductCallbackLogPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stock, setStock] = useState<StockFilter>('all')
  const [range, setRange] = useState<DateRange | undefined>()
  const [sort, setSort] = useState<SortKey>('newest')
  const [showPrice, setShowPrice] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Typing shouldn't fire a request per keystroke.
  const debouncedSearch = useDebounce(search.trim(), 350)
  const debouncedMin = useDebounce(minPrice, 350)
  const debouncedMax = useDebounce(maxPrice, 350)

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetProductCallbackLogs({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: stock === 'all' ? undefined : stock,
    startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
    endDate: range?.from ? format(range.to ?? range.from, 'yyyy-MM-dd') : undefined,
    minPrice: debouncedMin,
    maxPrice: debouncedMax,
    ...SORTS[sort],
  })
  const logs = data?.data ?? []
  const total = data?.meta?.total_data

  const filtered = !!(search || stock !== 'all' || range?.from || minPrice || maxPrice || sort !== 'newest')
  // Any filter change starts from the first page again.
  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }
  const reset = () => {
    setSearch('')
    setStock('all')
    setRange(undefined)
    setSort('newest')
    setMinPrice('')
    setMaxPrice('')
    setShowPrice(false)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('productCallbackLogPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('productCallbackLogPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('productCallbackLogPage.subtitle')}</p>
          </div>
          {total !== undefined && (
            <span className='shrink-0 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('productCallbackLogPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
            </span>
          )}
        </header>

        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='space-y-3 bg-white p-4 hud-clip'>
            <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_14rem_12rem]'>
              <div className='group relative'>
                <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                  <Search className='size-4' aria-hidden />
                </span>
                <Input
                  value={search}
                  onChange={(e) => update(setSearch)(e.target.value)}
                  placeholder={t('productCallbackLogPage.searchPlaceholder')}
                  aria-label={t('productCallbackLogPage.searchPlaceholder')}
                  className={cn(hudInputClass, 'h-10 bg-white pl-10 font-mono text-sm')}
                />
              </div>
              <Segmented
                size='md'
                value={stock}
                onChange={update(setStock)}
                label={t('productCallbackLogPage.stockLabel')}
                options={(['all', 'available', 'empty'] as const).map((s) => ({
                  value: s,
                  label: s === 'all' ? t('productCallbackLogPage.stockAll') : t(`productCallbackLogPage.stock.${s}`),
                }))}
              />
              <DateRangeFilter value={range} onChange={update(setRange)} placeholder={t('productCallbackLogPage.datePlaceholder')} />
              <Select value={sort} onValueChange={(v) => update(setSort)(v as SortKey)}>
                <SelectTrigger aria-label={t('productCallbackLogPage.sortLabel')} className='h-10 w-full bg-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORTS) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`productCallbackLogPage.sort.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => setShowPrice((v) => !v)}
                aria-expanded={showPrice}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] hud-clip-sm transition-colors',
                  showPrice || minPrice || maxPrice ? 'bg-brand-purple/10 text-brand-purple' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Coins className='size-3.5' aria-hidden />
                {t('productCallbackLogPage.priceFilter')}
              </button>
              {showPrice && (
                <div className='flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-300'>
                  <PriceInput value={minPrice} onChange={update(setMinPrice)} label={t('productCallbackLogPage.minPrice')} />
                  <span className='text-slate-300' aria-hidden>–</span>
                  <PriceInput value={maxPrice} onChange={update(setMaxPrice)} label={t('productCallbackLogPage.maxPrice')} />
                </div>
              )}
              {filtered && (
                <button
                  type='button'
                  onClick={reset}
                  className='ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
                >
                  <RotateCcw className='size-3.5' aria-hidden />
                  {t('productCallbackLogPage.reset')}
                </button>
              )}
            </div>
          </div>
        </div>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('productCallbackLogPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('productCallbackLogPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && logs.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <RadioTower className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {filtered ? t('productCallbackLogPage.noMatchTitle') : t('productCallbackLogPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {filtered ? t('productCallbackLogPage.noMatchBody') : t('productCallbackLogPage.emptyBody')}
            </p>
          </div>
        ) : (
          logs.length > 0 && (
            <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {logs.map((log, index) => (
                  <LogRow key={log.id} log={log} order={index} />
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

function PriceInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className='relative w-36'>
      <span className='pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[11px] font-semibold text-slate-400'>Rp</span>
      <Input
        type='number'
        inputMode='numeric'
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        aria-label={label}
        className='h-8 rounded-md border-slate-200 bg-white pl-8 text-sm tabular-nums'
      />
    </div>
  )
}

function LogRow({ log, order }: { log: ProductCallbackLogResponse; order: number }) {
  return (
    <li className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}>
      <Link
        to={`/products/callback-logs/${log.id}`}
        className='group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.04] focus-visible:outline-none sm:px-5 lg:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,17rem)_6.5rem_1rem]'
      >
        <div className='hidden text-xs tabular-nums lg:block'>
          <p className='font-semibold text-slate-700'>{formatBackendDateTime(log.created_at, 'HH:mm:ss')}</p>
          <p className='text-slate-400'>{formatBackendDateTime(log.created_at, 'dd MMM yyyy')}</p>
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>{log.product_name || log.product_code}</p>
          <p className='truncate text-xs text-slate-500'>
            <span className='font-mono'>{log.product_code}</span>
            {log.provider_code && <span> · {log.provider_code}</span>}
            <span className='lg:hidden'> · {formatBackendDateTime(log.created_at, 'dd MMM, HH:mm')}</span>
          </p>
        </div>
        <div className='col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 lg:col-span-1'>
          <span className='text-xs tabular-nums text-slate-400 line-through decoration-slate-300'>{formatCurrency(log.previous_price)}</span>
          <ArrowRight className='size-3 text-slate-300' aria-hidden />
          <span className='text-sm font-semibold tabular-nums text-slate-900'>{formatCurrency(log.price)}</span>
          <PriceDelta previous={log.previous_price} current={log.price} />
        </div>
        <div className='col-start-2 row-start-1 lg:col-start-auto lg:row-start-auto'>
          <StockChip status={log.status} />
        </div>
        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </Link>
    </li>
  )
}
