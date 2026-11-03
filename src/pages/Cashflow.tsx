import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { ChevronRight, RefreshCw, RotateCcw, Wallet } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { CashflowDetailDialog } from '@/components/Cashflow/CashflowDetailDialog'
import { DirectionTile, SignedAmount } from '@/components/Cashflow/CashflowParts'
import { CashflowSummary } from '@/components/Cashflow/CashflowSummary'
import {
  DIRECTION_TYPE,
  RANGE_KEYS,
  directionOf,
  fromDay,
  parseNotes,
  rangeDays,
  toDay,
  type RangeKey,
} from '@/components/Cashflow/cashflow-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Segmented } from '@/components/ui/segmented'
import { useCashflowSummary, useGetCashflows } from '@/hooks/useCashflow'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatPaymentChannel } from '@/lib/dashboard'
import { cn } from '@/lib/utils'
import type { CashflowItem } from '@/types/cashflow'

const PAGE_SIZE = 20

type FlowFilter = 'all' | 'in' | 'out'
const FLOWS: FlowFilter[] = ['all', 'in', 'out']

interface DayGroup {
  key: string
  label: string
  items: CashflowItem[]
}

/** Rows arrive newest first, so consecutive entries of the same day form one group. */
function groupByDay(items: CashflowItem[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const item of items) {
    const key = formatBackendDateTime(item.created_at, 'yyyy-MM-dd')
    const last = groups.at(-1)
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, label: formatBackendDateTime(item.created_at, 'EEEE, dd MMMM yyyy'), items: [item] })
  }
  return groups
}

export default function CashflowPage() {
  const { t, i18n } = useTranslation('common')
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<CashflowItem | null>(null)

  // Filters live in the URL, so coming back from a transaction keeps the same view.
  const rawRange = params.get('range') as RangeKey | null
  const range: RangeKey = rawRange && RANGE_KEYS.includes(rawRange) ? rawRange : 'today'
  const rawFlow = params.get('flow') as FlowFilter | null
  const flow: FlowFilter = rawFlow && FLOWS.includes(rawFlow) ? rawFlow : 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const customFrom = fromDay(params.get('from'))
  const custom: DateRange | undefined = customFrom ? { from: customFrom, to: fromDay(params.get('to')) } : undefined
  const { start, end } = rangeDays(range, range === 'custom' ? custom : undefined)

  const update = (next: Record<string, string | null>, keepPage = false) =>
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(next)) {
          if (value === null) out.delete(key)
          else out.set(key, value)
        }
        if (!keepPage) out.delete('page')
        return out
      },
      { replace: true }
    )

  const list = useGetCashflows({
    page,
    limit: PAGE_SIZE,
    type: flow === 'all' ? undefined : DIRECTION_TYPE[flow],
    startDate: start,
    endDate: end,
  })
  const summary = useCashflowSummary(start, end)

  const items = list.data?.data ?? []
  const groups = groupByDay(items)
  const total = list.data?.meta?.total
  const filtered = range !== 'today' || flow !== 'all'

  const dateLocale = i18n.language.startsWith('id') ? idLocale : enUS
  const fmtDay = (day: string) => format(fromDay(day) ?? new Date(), 'dd MMM yyyy', { locale: dateLocale })
  const periodLabel = !start || !end ? t('cashflowPage.allTime') : start === end ? fmtDay(start) : `${fmtDay(start)} – ${fmtDay(end)}`

  const retry = () => {
    void list.refetch()
    void summary.refetch()
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('cashflowPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('cashflowPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('cashflowPage.subtitle')}</p>
          </div>
          {total !== undefined && (
            <span className='shrink-0 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('cashflowPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
            </span>
          )}
        </header>

        {/* One filter row above everything it scopes. */}
        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='flex flex-col gap-3 bg-white p-4 hud-clip lg:flex-row lg:flex-wrap lg:items-center'>
            <Segmented
              size='md'
              value={range}
              onChange={(next) => update({ range: next === 'today' ? null : next, from: null, to: null })}
              label={t('cashflowPage.range.label')}
              options={RANGE_KEYS.map((key) => ({ value: key, label: t(`cashflowPage.range.${key}`) }))}
            />
            {range === 'custom' && (
              <DateRangeFilter
                className='w-full animate-in fade-in slide-in-from-left-1 duration-300 sm:w-72'
                value={custom}
                onChange={(next) =>
                  update({ from: next?.from ? toDay(next.from) : null, to: next?.to ? toDay(next.to) : null })
                }
                placeholder={t('cashflowPage.datePlaceholder')}
              />
            )}
            <Segmented
              size='md'
              value={flow}
              onChange={(next) => update({ flow: next === 'all' ? null : next })}
              label={t('cashflowPage.flow.label')}
              options={FLOWS.map((key) => ({ value: key, label: t(`cashflowPage.flow.${key}`) }))}
            />
            {filtered && (
              <button
                type='button'
                onClick={() => update({ range: null, flow: null, from: null, to: null })}
                className='inline-flex h-9 items-center gap-1.5 self-start rounded-md px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 lg:ml-auto lg:self-auto'
              >
                <RotateCcw className='size-3.5' aria-hidden />
                {t('cashflowPage.reset')}
              </button>
            )}
          </div>
        </div>

        {(list.isError || summary.isError) && (
          <div className='space-y-3'>
            <AuthAlert>{t('cashflowPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={retry}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('cashflowPage.retry')}
            </button>
          </div>
        )}

        <CashflowSummary
          summary={summary.data}
          isLoading={summary.isLoading}
          stale={summary.isPlaceholderData}
          periodLabel={periodLabel}
        />

        <section className='space-y-3' aria-label={t('cashflowPage.listLabel')}>
          {flow !== 'all' && (
            <p className='text-xs text-slate-500'>{t('cashflowPage.flowNote')}</p>
          )}

          {list.isLoading ? (
            <div className='space-px overflow-hidden bg-slate-200/60 p-px hud-clip' aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className='flex items-center gap-4 bg-white px-5 py-4'>
                  <div className='size-9 animate-pulse bg-slate-200/70 hud-clip-sm' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70' />
                    <div className='h-3 w-1/2 animate-pulse rounded bg-slate-100' />
                  </div>
                  <div className='h-4 w-24 animate-pulse rounded bg-slate-200/70' />
                </div>
              ))}
            </div>
          ) : !list.isError && items.length === 0 ? (
            <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center animate-in fade-in duration-500'>
              <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <Wallet className='size-6' aria-hidden />
              </span>
              <h2 className='font-display text-xl font-bold text-slate-900'>{t('cashflowPage.emptyTitle')}</h2>
              <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('cashflowPage.emptyBody', { period: periodLabel })}</p>
              {range === 'today' && (
                <button
                  type='button'
                  onClick={() => update({ range: '7d' })}
                  className='mt-5 inline-flex h-9 items-center gap-1.5 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple ring-1 ring-inset ring-brand-purple/30 hud-clip-sm transition-colors hover:bg-brand-purple/10'
                >
                  {t('cashflowPage.tryWeek')}
                </button>
              )}
            </div>
          ) : (
            groups.length > 0 && (
              <div className={cn('space-y-5 transition-opacity duration-300', list.isPlaceholderData && 'opacity-60')} aria-busy={list.isFetching}>
                {groups.map((group, groupIndex) => (
                  <section
                    key={group.key}
                    aria-labelledby={`cashflow-day-${group.key}`}
                    className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
                    style={{ animationDelay: `${groupIndex * 50}ms` }}
                  >
                    <h2 id={`cashflow-day-${group.key}`} className='mb-2 flex items-center gap-3'>
                      <span className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>{group.label}</span>
                      <span className='h-px flex-1 bg-slate-200' aria-hidden />
                      <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                        {t('cashflowPage.entries', { count: group.items.length })}
                      </span>
                    </h2>
                    <div className='bg-slate-200/80 p-px hud-clip'>
                      <ul className='divide-y divide-slate-100 bg-white hud-clip'>
                        {group.items.map((item) => (
                          <CashflowRow key={item.id} item={item} onOpen={() => setSelected(item)} />
                        ))}
                      </ul>
                    </div>
                  </section>
                ))}
              </div>
            )
          )}

          <HudPagination
            page={page}
            totalPages={list.data?.meta?.last_page ?? 1}
            onChange={(next) => update({ page: next > 1 ? String(next) : null }, true)}
          />
        </section>
      </div>

      <CashflowDetailDialog item={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </DashboardLayout>
  )
}

function CashflowRow({ item, onOpen }: { item: CashflowItem; onOpen: () => void }) {
  const { t } = useTranslation('common')
  const direction = directionOf(item.type)
  const note = parseNotes(item.notes)
  const time = formatBackendDateTime(item.created_at, 'HH:mm:ss')
  const order = t('cashflowPage.order', { id: item.order_id.slice(0, 8) })

  const detail =
    direction === 'in'
      ? [note.method && t('cashflowPage.via', { method: formatPaymentChannel(note.method) }), order]
      : direction === 'out'
        ? [note.provider, note.sku, order]
        : [item.notes || item.type, order]

  return (
    <li>
      <button
        type='button'
        onClick={onOpen}
        className='group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.04] focus-visible:outline-none sm:grid-cols-[auto_minmax(0,1fr)_5.5rem_auto_1rem] sm:gap-x-4 sm:px-5'
      >
        <DirectionTile direction={direction} />
        <span className='min-w-0'>
          <span className='block truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>
            {direction === 'other' ? item.type : t(`cashflowPage.kind.${direction}`)}
          </span>
          <span className='block truncate text-xs text-slate-500'>
            {detail.filter(Boolean).join(' · ')}
            <span className='sm:hidden'> · {time}</span>
          </span>
        </span>
        <time className='hidden text-right text-xs tabular-nums text-slate-500 sm:block'>{time}</time>
        <SignedAmount direction={direction} amount={item.amount} className='text-right text-sm font-semibold' />
        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple sm:block'
          aria-hidden
        />
      </button>
    </li>
  )
}
