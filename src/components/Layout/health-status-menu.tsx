import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HEALTH_REFRESH_MINUTES, useServerStatus, type ServerStatus } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'

const STATUS_DOT: Record<ServerStatus, string> = {
  checking: 'bg-slate-300 animate-pulse',
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  unreachable: 'bg-rose-500',
}

const STATUS_PILL: Record<ServerStatus, string> = {
  checking: 'border-slate-200 text-slate-500',
  operational: 'border-slate-200 text-slate-600',
  degraded: 'border-amber-200 bg-amber-50 text-amber-700',
  unreachable: 'border-rose-200 bg-rose-50 text-rose-700',
}

function formatTimeSince(timestamp: number, language: string) {
  const seconds = Math.round((timestamp - Date.now()) / 1000)
  const format = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'short' })
  if (Math.abs(seconds) < 60) return format.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute')
  return format.format(Math.round(minutes / 60), 'hour')
}

/** Navbar pill with the server status; opens per-service details. */
export function HealthStatusMenu() {
  const { t, i18n } = useTranslation('common')
  const { status, services, dataUpdatedAt, refetch, isFetching } = useServerStatus()
  const [, setTick] = useState(0)

  // Keeps "last checked" fresh while the popover is open.
  useEffect(() => {
    const interval = setInterval(() => setTick((tick) => tick + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const statusLabel = t(`serverStatus.${status}`)
  const serviceEntries = Object.entries(services)
  const lastChecked = dataUpdatedAt
    ? formatTimeSince(dataUpdatedAt, i18n.resolvedLanguage ?? 'en')
    : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={`${t('sidebar.health.title')}: ${statusLabel}`}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-full border bg-white px-3 text-xs font-medium transition-colors duration-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            STATUS_PILL[status]
          )}
        >
          <span className='relative flex size-2' aria-hidden>
            {status === 'operational' && (
              <span className='absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50' />
            )}
            <span className={cn('relative size-2 rounded-full transition-colors duration-500', STATUS_DOT[status])} />
          </span>
          <span key={status} className='hidden animate-in fade-in duration-500 lg:inline'>
            {t(`serverStatus.short.${status}`)}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='z-[60] w-72 overflow-hidden rounded-xl border-slate-200 p-0 shadow-xl'
      >
        <div className='flex items-start justify-between gap-3 p-4'>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-slate-500'>{t('sidebar.health.title')}</p>
            <p className='mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900'>
              <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT[status])} aria-hidden />
              {statusLabel}
            </p>
          </div>
          <button
            type='button'
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label={t('sidebar.health.refresh')}
            className='grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-60'
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
          </button>
        </div>

        {status === 'checking' && (
          <p className='px-4 pb-3 text-xs text-slate-500'>{t('sidebar.health.checking')}</p>
        )}

        {status === 'unreachable' && (
          <p className='mx-4 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700'>
            {t('sidebar.health.unreachableBody')}
          </p>
        )}

        {serviceEntries.length > 0 && (
          <ul className='divide-y divide-slate-100 border-y border-slate-100'>
            {serviceEntries.map(([name, serviceStatus]) => {
              const isUp = serviceStatus === 'up'
              return (
                <li key={name} className='flex items-center justify-between px-4 py-2.5 text-sm'>
                  <span className='capitalize text-slate-700'>{name}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium',
                      isUp ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    <span
                      className={cn('size-1.5 rounded-full', isUp ? 'bg-emerald-500' : 'bg-rose-500')}
                      aria-hidden
                    />
                    {isUp ? t('sidebar.health.up') : t('sidebar.health.down')}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <div className='space-y-0.5 px-4 py-3 text-xs text-slate-400'>
          {lastChecked && <p>{t('sidebar.health.lastChecked', { time: lastChecked })}</p>}
          <p>{t('sidebar.health.autoRefresh', { minutes: HEALTH_REFRESH_MINUTES })}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
