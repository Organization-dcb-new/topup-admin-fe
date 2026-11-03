import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ClipboardList, RefreshCw } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { ActionChip, ActionTile, ModuleChip } from '@/components/AdminLog/AdminLogParts'
import { countLogFields, logTitle } from '@/components/AdminLog/admin-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { useAdminNames } from '@/hooks/useAdmin'
import { useGetAdminLogs } from '@/hooks/useAdminLog'
import { formatBackendDateTime, parseBackendDate } from '@/lib/backend-datetime'
import type { AdminLog } from '@/types/admin-log'

const PAGE_SIZE = 20

interface DayGroup {
  key: string
  label: string
  logs: AdminLog[]
}

/** Logs arrive newest first, so consecutive entries of the same day form one group. */
function groupByDay(logs: AdminLog[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const log of logs) {
    const key = formatBackendDateTime(log.CreatedAt, 'yyyy-MM-dd')
    const last = groups.at(-1)
    if (last?.key === key) last.logs.push(log)
    else groups.push({ key, label: formatBackendDateTime(log.CreatedAt, 'EEEE, dd MMMM yyyy'), logs: [log] })
  }
  return groups
}

export default function AdminLogPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useGetAdminLogs(page, PAGE_SIZE)
  const names = useAdminNames()

  const groups = groupByDay(data?.data ?? [])
  const total = data?.meta?.total_data

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-5xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('adminLogPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('adminLogPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('adminLogPage.subtitle')}</p>
          </div>
          {total !== undefined && (
            <span className='shrink-0 font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('adminLogPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
            </span>
          )}
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('adminLogPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('adminLogPage.retry')}
            </button>
          </div>
        )}

        {isLoading && <LogSkeleton />}

        {!isError && !isLoading && groups.length === 0 && (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <ClipboardList className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('adminLogPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('adminLogPage.emptyBody')}</p>
          </div>
        )}

        {groups.length > 0 && (
          <div className='space-y-5' aria-busy={isFetching}>
            {groups.map((group, groupIndex) => (
              <section
                key={group.key}
                aria-labelledby={`log-day-${group.key}`}
                className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
                style={{ animationDelay: `${groupIndex * 60}ms` }}
              >
                <h2 id={`log-day-${group.key}`} className='mb-2 flex items-center gap-3'>
                  <span className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    {group.label}
                  </span>
                  <span className='h-px flex-1 bg-slate-200' aria-hidden />
                  <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {t('adminLogPage.entries', { count: group.logs.length })}
                  </span>
                </h2>
                <div className='bg-slate-200/80 p-px hud-clip'>
                  <ul className='divide-y divide-slate-100 bg-white hud-clip'>
                    {group.logs.map((log) => (
                      <LogRow key={log.ID} log={log} adminName={names.get(log.AdminID)} />
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>
    </DashboardLayout>
  )
}

function LogRow({ log, adminName }: { log: AdminLog; adminName?: string }) {
  const { t } = useTranslation('common')
  const fields = countLogFields(log)
  const created = parseBackendDate(log.CreatedAt)

  return (
    <li>
      <Link
        to={`/admin-logs/${log.ID}`}
        className='group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.04] focus-visible:outline-none sm:gap-4 sm:px-5'
      >
        <ActionTile action={log.Action} />
        <div className='min-w-0 space-y-1.5'>
          <p className='truncate text-sm font-medium text-slate-900 transition-colors group-hover:text-brand-purple'>
            {logTitle(log, t)}
          </p>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500'>
            <ActionChip action={log.Action} />
            <ModuleChip module={log.Module} />
            <span className='truncate font-medium text-slate-600'>{adminName ?? log.AdminID.slice(0, 8)}</span>
            {log.IPAddress && <span className='hidden font-mono text-slate-400 sm:inline'>{log.IPAddress}</span>}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='text-right'>
            <time
              dateTime={created?.toISOString()}
              className='block text-xs font-semibold tabular-nums text-slate-700'
            >
              {formatBackendDateTime(log.CreatedAt, 'HH:mm')}
            </time>
            {fields && fields.count > 0 && (
              <span className='hidden text-[11px] text-slate-400 sm:block'>
                {fields.kind === 'changed'
                  ? t('adminLogPage.changedFields', { count: fields.count })
                  : t('adminLogPage.snapshotFields', { count: fields.count })}
              </span>
            )}
          </div>
          <ChevronRight
            className='size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple'
            aria-hidden
          />
        </div>
      </Link>
    </li>
  )
}

function LogSkeleton() {
  return (
    <div className='space-y-2' aria-hidden>
      <div className='h-4 w-48 animate-pulse rounded bg-slate-200/70' />
      <div className='space-y-px overflow-hidden bg-slate-200/60 p-px hud-clip'>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className='flex items-center gap-4 bg-white px-5 py-4'>
            <div className='size-9 animate-pulse bg-slate-200/70 hud-clip-sm' />
            <div className='flex-1 space-y-2'>
              <div className='h-3.5 w-2/3 animate-pulse rounded bg-slate-200/70' />
              <div className='h-3 w-1/3 animate-pulse rounded bg-slate-100' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
