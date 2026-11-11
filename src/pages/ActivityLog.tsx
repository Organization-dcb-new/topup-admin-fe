import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Activity, ChevronRight, RefreshCw, RotateCcw, Search } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useActorLabel } from '@/components/ActivityLog/activity-log-meta'
import { ActorChip, MethodChip, StatusChip } from '@/components/ActivityLog/activity-log-parts'
import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { logCardClass, logRowLinkClass } from '@/components/IntegrationLog/integration-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { useActivityLogs } from '@/hooks/useActivityLog'
import { useDebounce } from '@/hooks/useDebounce'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import { ACTIVITY_ACTORS, ACTIVITY_METHODS, type ActivityActor, type ActivityLog } from '@/types/activity-log'

const PAGE_SIZE = 30
const ACTOR_FILTERS = ['all', ...ACTIVITY_ACTORS] as const
type ActorFilter = (typeof ACTOR_FILTERS)[number]
const METHOD_FILTERS = ['all', ...ACTIVITY_METHODS] as const
type MethodFilter = (typeof METHOD_FILTERS)[number]
const OUTCOME_FILTERS = ['all', 'success', 'failed'] as const
type OutcomeFilter = (typeof OUTCOME_FILTERS)[number]

/**
 * Every write request to the backend (anything but GET), from anyone: buyers at checkout, admins in this
 * panel, the suppliers' and Paylabs' callbacks. The admin log keeps what an admin changed, with before and
 * after; this keeps who did what, from where.
 */
export default function ActivityLogPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actor, setActor] = useState<ActorFilter>('all')
  const [method, setMethod] = useState<MethodFilter>('all')
  const [outcome, setOutcome] = useState<OutcomeFilter>('all')
  const [range, setRange] = useState<DateRange | undefined>()

  const debouncedSearch = useDebounce(search.trim(), 350)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useActivityLogs({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    actorType: actor === 'all' ? undefined : (actor as ActivityActor),
    method: method === 'all' ? undefined : method,
    outcome: outcome === 'all' ? undefined : outcome,
    startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
    endDate: range?.from ? format(range.to ?? range.from, 'yyyy-MM-dd') : undefined,
  })
  const logs = data?.data ?? []
  const total = data?.meta?.total_data

  const filtered = !!(search || actor !== 'all' || method !== 'all' || outcome !== 'all' || range?.from)
  const update = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }
  const reset = () => {
    setSearch('')
    setActor('all')
    setMethod('all')
    setOutcome('all')
    setRange(undefined)
    setPage(1)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('activityLogPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('activityLogPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('activityLogPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('activityLogPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
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
                  placeholder={t('activityLogPage.searchPlaceholder')}
                  aria-label={t('activityLogPage.searchPlaceholder')}
                  maxLength={200}
                  className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
                />
              </div>
              <DateRangeFilter value={range} onChange={update(setRange)} placeholder={t('integrationLog.datePlaceholder')} />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Segmented
                value={actor}
                onChange={update(setActor)}
                label={t('activityLogPage.actorLabel')}
                options={ACTOR_FILTERS.map((a) => ({
                  value: a,
                  label: a === 'all' ? t('integrationLog.all') : t(`activityLogPage.actor.${a}`),
                }))}
              />
              <Segmented
                value={method}
                onChange={update(setMethod)}
                label={t('activityLogPage.methodLabel')}
                options={METHOD_FILTERS.map((m) => ({ value: m, label: m === 'all' ? t('integrationLog.all') : m }))}
              />
              <Segmented
                value={outcome}
                onChange={update(setOutcome)}
                label={t('activityLogPage.outcomeLabel')}
                options={OUTCOME_FILTERS.map((o) => ({
                  value: o,
                  label: o === 'all' ? t('integrationLog.all') : t(`activityLogPage.outcome.${o}`),
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
            <AuthAlert>{t('activityLogPage.loadError')}</AuthAlert>
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
              <Activity className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {filtered ? t('integrationLog.noMatchTitle') : t('activityLogPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {filtered ? t('integrationLog.noMatchBody') : t('activityLogPage.emptyBody')}
            </p>
          </div>
        ) : (
          logs.length > 0 && (
            <div className={cn(logCardClass, 'transition-opacity duration-300', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {logs.map((log, index) => (
                  <ActivityRow key={log.id} log={log} order={index} />
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

function ActivityRow({ log, order }: { log: ActivityLog; order: number }) {
  const { t } = useTranslation('common')
  const actorLabel = useActorLabel()
  const where = [log.ip, log.device].filter(Boolean).join(' · ')

  return (
    <li className='animate-in fade-in duration-300 fill-mode-both' style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}>
      <Link
        to={`/activity-logs/${log.id}`}
        className={cn(logRowLinkClass, 'grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[6.5rem_minmax(0,16rem)_minmax(0,1fr)_5.5rem_1rem]')}
      >
        <div className='hidden text-xs tabular-nums lg:block'>
          <p className='font-semibold text-slate-700'>{formatBackendDateTime(log.created_at, 'HH:mm:ss')}</p>
          <p className='text-slate-400'>{formatBackendDateTime(log.created_at, 'dd MMM yyyy')}</p>
        </div>
        <div className='min-w-0 space-y-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <ActorChip actor={log.actor_type} />
            <span className='truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>{actorLabel(log)}</span>
          </div>
          <p className='truncate text-xs text-slate-500'>
            {where || t('activityLogPage.noOrigin')}
            <span className='lg:hidden'> · {formatBackendDateTime(log.created_at, 'dd MMM, HH:mm')}</span>
          </p>
        </div>
        <div className='col-span-2 min-w-0 space-y-1 lg:col-span-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <MethodChip method={log.method} />
            <span className='truncate font-mono text-xs text-slate-700' title={log.path}>
              {log.route}
            </span>
          </div>
          {log.message && <p className='truncate text-xs text-slate-500'>{log.message}</p>}
        </div>
        <div className='col-start-2 row-start-1 flex flex-col items-end gap-1 lg:col-start-auto lg:row-start-auto lg:items-start'>
          <StatusChip status={log.status} />
          <span className='text-[11px] tabular-nums text-slate-400'>{t('integrationLog.ms', { ms: log.duration_ms })}</span>
        </div>
        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </Link>
    </li>
  )
}
