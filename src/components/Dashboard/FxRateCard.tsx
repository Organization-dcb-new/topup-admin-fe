import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, ChevronDown, RefreshCw } from 'lucide-react'

import { useLapakGamingFxRates } from '@/hooks/useDashboard'
import { apiErrorMessage } from '@/hooks/useIntegrationLog'
import { formatRupiahRate } from '@/lib/format'
import { regionName } from '@/lib/regions'
import { cn } from '@/lib/utils'
import type { FxRate } from '@/types/dashboard'
import { DashboardPanel } from './DashboardPanel'

/** Rates shown before "show all"; the synced regions' currencies are always among them. */
const COLLAPSED = 8
/** LapakGaming sets rates daily; one older than this is marked old. */
const STALE_AFTER_DAYS = 3

/** LapakGaming's `YYYY-MM-DD HH:mm:ss` in WIB as a Date, null when it can't be read. */
function parseWib(value: string): Date | null {
  const date = new Date(`${value.trim().replace(' ', 'T')}+07:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * LapakGaming's exchange rates into rupiah, one tile per currency. The currencies of the regions
 * the LapakGaming provider syncs come first.
 */
export function FxRateCard({ order }: { order?: number }) {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, error, isFetching, refetch } = useLapakGamingFxRates()
  const [showAll, setShowAll] = useState(false)

  const rates = data?.rates ?? []
  const synced = rates.filter((r) => r.synced).length
  const visible = showAll ? rates : rates.slice(0, Math.max(COLLAPSED, synced))
  const fetchedAt = data?.fetched_at ? new Date(data.fetched_at) : null

  return (
    <DashboardPanel
      title={t('dashboard.fx.title')}
      icon={ArrowLeftRight}
      iconClassName='bg-cyan-50 text-cyan-700'
      order={order}
      actions={
        fetchedAt && (
          <span className='text-xs tabular-nums text-slate-400'>
            {t('dashboard.fx.fetchedAt', { time: fetchedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) })}
          </span>
        )
      }
    >
      <p className='mb-4 text-xs leading-relaxed text-slate-500'>{t('dashboard.fx.subtitle')}</p>

      {isLoading ? (
        <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-4' aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className='h-24 animate-pulse rounded-lg bg-slate-100' />
          ))}
        </div>
      ) : isError ? (
        <div className='flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600'>
          <span className='min-w-0 flex-1'>{apiErrorMessage(error) ?? t('dashboard.fx.loadError')}</span>
          <button
            type='button'
            onClick={() => void refetch()}
            disabled={isFetching}
            className='inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-brand-purple transition-colors hover:bg-brand-purple/10 disabled:opacity-60'
          >
            <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
            {t('dashboard.retry')}
          </button>
        </div>
      ) : (
        <>
          <ul className='grid gap-2 sm:grid-cols-2 xl:grid-cols-4'>
            {visible.map((rate) => (
              <FxRateTile key={rate.currency} rate={rate} readAt={fetchedAt} />
            ))}
          </ul>
          <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
            {rates.length > visible.length || showAll ? (
              <button
                type='button'
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className='inline-flex items-center gap-1 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple'
              >
                {showAll ? t('dashboard.fx.showLess') : t('dashboard.fx.showAll', { count: rates.length })}
                <ChevronDown className={cn('size-3.5 transition-transform duration-300', showAll && 'rotate-180')} aria-hidden />
              </button>
            ) : null}
            {data && data.missing.length > 0 && (
              <p className='text-xs text-slate-400'>{t('dashboard.fx.missing', { currencies: data.missing.join(', ') })}</p>
            )}
          </div>
        </>
      )}
    </DashboardPanel>
  )
}

/** readAt is when the backend read the rates; a rate set long before that is marked old. */
function FxRateTile({ rate, readAt }: { rate: FxRate; readAt: Date | null }) {
  const { t, i18n } = useTranslation('common')
  const updated = parseWib(rate.updated_at)
  const stale = updated && readAt ? readAt.getTime() - updated.getTime() > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000 : false
  const regions = rate.regions.map((r) => regionName(r, i18n.resolvedLanguage)).join(', ')
  const oneRate = rate.buy_rate === rate.sell_rate

  return (
    <li
      className={cn(
        'flex flex-col gap-1.5 rounded-lg border bg-white p-3',
        rate.synced ? 'border-brand-purple/30 bg-brand-purple/[0.02]' : 'border-slate-200'
      )}
    >
      <div className='flex items-center gap-2'>
        <span className='font-mono text-sm font-bold text-slate-900'>{rate.currency}</span>
        {rate.synced && (
          <span className='rounded bg-brand-purple/10 px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-purple'>
            {t('dashboard.fx.synced')}
          </span>
        )}
        <span className='ml-auto min-w-0 truncate text-[11px] text-slate-400' title={regions}>
          {regions}
        </span>
      </div>
      {oneRate ? (
        <p className='font-display text-lg font-bold tabular-nums text-slate-900'>{formatRupiahRate(rate.sell_rate)}</p>
      ) : (
        <dl className='grid grid-cols-2 gap-x-2 text-sm tabular-nums'>
          <dt className='text-[11px] text-slate-500'>{t('dashboard.fx.buy')}</dt>
          <dt className='text-[11px] text-slate-500'>{t('dashboard.fx.sell')}</dt>
          <dd className='font-semibold text-slate-900'>{formatRupiahRate(rate.buy_rate)}</dd>
          <dd className='font-semibold text-slate-900'>{formatRupiahRate(rate.sell_rate)}</dd>
        </dl>
      )}
      <p className={cn('text-[11px] tabular-nums', stale ? 'text-amber-700' : 'text-slate-400')}>
        {updated
          ? t(stale ? 'dashboard.fx.updatedStale' : 'dashboard.fx.updated', {
              date: updated.toLocaleDateString(i18n.resolvedLanguage === 'en' ? 'en-US' : 'id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
            })
          : rate.updated_at}
      </p>
    </li>
  )
}
