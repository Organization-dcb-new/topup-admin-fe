import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, KeyRound, ListOrdered, RefreshCw, Search } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { OrderDetailDialog } from '@/components/Order/OrderDetailDialog'
import { ProviderStatusChip } from '@/components/Order/OrderParts'
import { orderItemTotal, pageRange, providerState, type ProviderState } from '@/components/Order/order-utils'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetOrderItems } from '@/hooks/useOrderItem'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OrderItem, OrderSort } from '@/types/order-item'

const PAGE_SIZES = [20, 50, 100] as const
type StateFilter = 'all' | ProviderState

export default function OrderPages() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(PAGE_SIZES[0])
  const [sort, setSort] = useState<OrderSort>('newest')
  // The API has no search or status filter, so these only narrow the page that's loaded.
  const [search, setSearch] = useState('')
  const [state, setState] = useState<StateFilter>('all')
  const [selected, setSelected] = useState<OrderItem | null>(null)

  const { rows, total, totalPages, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetOrderItems(page, limit, sort)
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'

  const counts = useMemo(() => {
    const c: Record<ProviderState, number> = { accepted: 0, rejected: 0, unsent: 0 }
    for (const row of rows) c[providerState(row.status_provider)] += 1
    return c
  }, [rows])

  const query = search.trim().toLowerCase()
  const visible = rows.filter(
    (row) =>
      (state === 'all' || providerState(row.status_provider) === state) &&
      (!query || [row.product_name, row.product_sku, row.id, row.product_id].some((v) => v?.toLowerCase().includes(query)))
  )
  const narrowed = state !== 'all' || !!query
  const range = total !== undefined ? pageRange(sort, page, limit, total, rows.length) : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('orderPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('orderPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('orderPage.subtitle')}</p>
          </div>
          {total !== undefined && (
            <span className='shrink-0 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('orderPage.total', { count: total, formatted: total.toLocaleString(locale) })}
            </span>
          )}
        </header>

        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='space-y-3 bg-white p-4 hud-clip'>
            <div className='flex flex-wrap items-center gap-2'>
              <Segmented
                size='md'
                value={sort}
                onChange={(v) => {
                  setSort(v)
                  setPage(1)
                }}
                label={t('orderPage.sortLabel')}
                options={[
                  { value: 'newest', label: t('orderPage.sort.newest') },
                  { value: 'oldest', label: t('orderPage.sort.oldest') },
                ]}
              />
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger aria-label={t('orderPage.pageSizeLabel')} className='h-10 w-auto gap-2 bg-white text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {t('orderPage.pageSize', { count: size })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type='button'
                onClick={() => void refetch()}
                disabled={isFetching}
                aria-label={t('orderPage.refresh')}
                title={t('orderPage.refresh')}
                className='ml-auto grid size-10 place-items-center bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-60'
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
              </button>
            </div>

            <div className='flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center'>
              <div className='group relative lg:w-80'>
                <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                  <Search className='size-4' aria-hidden />
                </span>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('orderPage.searchPlaceholder')}
                  aria-label={t('orderPage.searchPlaceholder')}
                  className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
                />
              </div>
              <div role='radiogroup' aria-label={t('orderPage.stateLabel')} className='flex flex-wrap items-center gap-1.5'>
                {(['all', 'accepted', 'rejected', 'unsent'] as const).map((value) => {
                  const selectedChip = state === value
                  const count = value === 'all' ? rows.length : counts[value]
                  return (
                    <button
                      key={value}
                      type='button'
                      role='radio'
                      aria-checked={selectedChip}
                      onClick={() => setState(value)}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
                        selectedChip ? 'bg-brand-purple text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple'
                      )}
                    >
                      {value === 'all' ? t('orderPage.stateAll') : t(`orderPage.provider.${value}`)}
                      <span className={cn('tabular-nums', selectedChip ? 'text-white/80' : 'text-slate-400')}>{count}</span>
                    </button>
                  )
                })}
              </div>
              <p className='text-xs text-slate-400 lg:ml-auto'>{t('orderPage.pageOnlyHint')}</p>
            </div>
          </div>
        </div>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('orderPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('orderPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
        ) : !isError && total === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <ListOrdered className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('orderPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('orderPage.emptyBody')}</p>
          </div>
        ) : (
          !isError &&
          rows.length > 0 && (
            <div className='space-y-2'>
              {range && (
                <p className='text-xs text-slate-500'>
                  {t(sort === 'newest' ? 'orderPage.rangeNewest' : 'orderPage.rangeOldest', {
                    from: range.from.toLocaleString(locale),
                    to: range.to.toLocaleString(locale),
                    total: (total ?? 0).toLocaleString(locale),
                  })}
                </p>
              )}
              {narrowed && visible.length === 0 ? (
                <p className='rounded-md border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500'>
                  {t('orderPage.noMatch')}
                </p>
              ) : (
                <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
                  <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                    {visible.map((item, index) => (
                      <OrderRow key={item.id} item={item} order={index} onOpen={() => setSelected(item)} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        )}

        <HudPagination page={page} totalPages={totalPages ?? 1} onChange={setPage} />
      </div>

      <OrderDetailDialog item={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </DashboardLayout>
  )
}

function OrderRow({ item, order, onOpen }: { item: OrderItem; order: number; onOpen: () => void }) {
  const { t } = useTranslation('common')
  const name = item.product_name || item.product_sku || t('orderPage.unnamed')

  return (
    <li className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}>
      <button
        type='button'
        onClick={onOpen}
        aria-label={t('orderPage.openDetail', { name })}
        className='group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.04] focus-visible:outline-none sm:px-5 lg:grid-cols-[minmax(0,1fr)_9rem_8rem_10rem_1rem]'
      >
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>{name}</p>
          <p className='flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-500'>
            <span className='truncate font-mono'>{item.product_sku || '—'}</span>
            <span className='shrink-0 text-slate-300' aria-hidden>·</span>
            <span className='shrink-0 font-mono text-slate-400' title={item.id}>
              #{item.id.slice(0, 8)}
            </span>
            {item.voucher_code && (
              <span
                className='inline-flex shrink-0 items-center gap-1 rounded bg-amber-50 px-1.5 text-[10px] font-semibold text-amber-700'
                title={t('orderPage.hasVoucher')}
              >
                <KeyRound className='size-3' aria-hidden />
                {t('orderPage.voucherShort')}
              </span>
            )}
          </p>
        </div>
        <div className='col-start-1 row-start-2 text-xs tabular-nums text-slate-500 lg:col-start-auto lg:row-start-auto'>
          <span className='font-semibold text-slate-700'>{item.quantity}</span> × {formatCurrency(item.unit_price)}
        </div>
        <div className='col-start-2 row-start-2 text-right text-sm font-semibold tabular-nums text-slate-900 lg:col-start-auto lg:row-start-auto lg:text-left'>
          {formatCurrency(orderItemTotal(item))}
        </div>
        <div className='col-start-2 row-start-1 justify-self-end lg:col-start-auto lg:row-start-auto lg:justify-self-start'>
          <ProviderStatusChip code={item.status_provider} />
        </div>
        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </button>
    </li>
  )
}
