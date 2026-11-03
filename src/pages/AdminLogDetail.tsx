import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronDown, FileJson, GitCompareArrows } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { ActionChip, ActionTile, ModuleChip } from '@/components/AdminLog/AdminLogParts'
import {
  MASKED_VALUE,
  describeUserAgent,
  diffLogData,
  isSensitiveKey,
  logTitle,
  type FieldChange,
} from '@/components/AdminLog/admin-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { CopyCodeButton } from '@/components/Referral/ReferralParts'
import { useAdminNames } from '@/hooks/useAdmin'
import { useGetAdminLogById } from '@/hooks/useAdminLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { AdminLog } from '@/types/admin-log'

export default function AdminLogDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const { data: log, isLoading, isError } = useGetAdminLogById(id)
  const names = useAdminNames()

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-5xl space-y-6'>
        <Link
          to='/admin-logs'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft
            className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5'
            aria-hidden
          />
          {t('adminLogDetailPage.backButton')}
        </Link>

        {isLoading && <div className='h-64 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('adminLogDetailPage.loadError')}</AuthAlert>}

        {log && (
          <>
            <LogSummary log={log} adminName={names.get(log.AdminID)} />
            <ChangesPanel log={log} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function LogSummary({ log, adminName }: { log: AdminLog; adminName?: string }) {
  const { t } = useTranslation('common')
  const device = log.UserAgent ? describeUserAgent(log.UserAgent) : null

  return (
    <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud'>
      <div className='bg-white hud-clip'>
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='space-y-6 p-5 sm:p-7'>
          <div className='flex items-start gap-4'>
            <ActionTile action={log.Action} size='lg' />
            <div className='min-w-0 flex-1 space-y-2'>
              <p className={hudEyebrowClass}>{t('adminLogDetailPage.eyebrow')}</p>
              <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'>
                {logTitle(log, t)}
              </h1>
              <div className='flex flex-wrap items-center gap-2'>
                <ActionChip action={log.Action} />
                <ModuleChip module={log.Module} />
              </div>
            </div>
          </div>

          <dl className='grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4'>
            <Meta label={t('adminLogDetailPage.admin')}>
              <span className='block truncate font-medium text-slate-900'>{adminName ?? '—'}</span>
              <span className='block truncate font-mono text-[11px] text-slate-400' title={log.AdminID}>
                {log.AdminID}
              </span>
            </Meta>
            <Meta label={t('adminLogDetailPage.createdAt')}>
              <span className='block font-medium tabular-nums text-slate-900'>
                {formatBackendDateTime(log.CreatedAt, 'dd MMM yyyy')}
              </span>
              <span className='block text-xs tabular-nums text-slate-500'>
                {formatBackendDateTime(log.CreatedAt, 'HH:mm:ss')}
              </span>
            </Meta>
            <Meta label={t('adminLogDetailPage.ipAddress')}>
              <span className='block font-mono font-medium text-slate-900'>{log.IPAddress || '—'}</span>
            </Meta>
            <Meta label={t('adminLogDetailPage.device')}>
              <span className='block truncate font-medium text-slate-900' title={log.UserAgent || undefined}>
                {device ?? (log.UserAgent ? t('adminLogDetailPage.unknownDevice') : '—')}
              </span>
            </Meta>
          </dl>

          <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
            <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('adminLogDetailPage.id')}
            </span>
            <span className='min-w-0 flex-1 truncate font-mono text-slate-600'>{log.ID}</span>
            <CopyCodeButton code={log.ID} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 text-sm'>
      <dt className='mb-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function ChangesPanel({ log }: { log: AdminLog }) {
  const { t } = useTranslation('common')
  const [showUnchanged, setShowUnchanged] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const rows = diffLogData(log)
  const hasBoth = !!log.OldData && !!log.NewData
  const changed = rows.filter((r) => r.changed)
  const unchanged = rows.filter((r) => !r.changed)
  // With one snapshot there is nothing to compare: list every field.
  const visible = hasBoth ? (showUnchanged ? rows : changed) : rows
  const columns = hasBoth ? 'both' : log.NewData ? 'after' : 'before'

  return (
    <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud fill-mode-both [animation-delay:120ms]'>
      <div className='bg-white hud-clip'>
        <div className='flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7'>
          <div className='flex items-center gap-3'>
            <span className='grid size-9 shrink-0 place-items-center bg-brand-purple/10 text-brand-purple hud-clip-sm'>
              <GitCompareArrows className='size-4' aria-hidden />
            </span>
            <div>
              <h2 className='font-display text-lg font-bold text-slate-900'>{t('adminLogDetailPage.changesTitle')}</h2>
              <p className='text-xs text-slate-500'>
                {hasBoth
                  ? t('adminLogDetailPage.changesSummary', { count: changed.length })
                  : rows.length > 0
                    ? t(columns === 'after' ? 'adminLogDetailPage.snapshotAfter' : 'adminLogDetailPage.snapshotBefore')
                    : t('adminLogDetailPage.noSnapshot')}
              </p>
            </div>
          </div>
          {rows.length > 0 && (
            <button
              type='button'
              onClick={() => setShowRaw((v) => !v)}
              aria-pressed={showRaw}
              className='inline-flex h-8 items-center gap-1.5 self-start px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 hud-clip-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple sm:self-auto'
            >
              <FileJson className='size-3.5' aria-hidden />
              {showRaw ? t('adminLogDetailPage.showTable') : t('adminLogDetailPage.showRaw')}
            </button>
          )}
        </div>

        {rows.length > 0 && !showRaw && (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[36rem] text-left text-sm'>
              <thead>
                <tr className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                  <th scope='col' className='w-1/4 px-5 py-2.5 sm:px-7'>{t('adminLogDetailPage.field')}</th>
                  {columns !== 'after' && <th scope='col' className='px-3 py-2.5'>{t('adminLogDetailPage.before')}</th>}
                  {columns !== 'before' && <th scope='col' className='px-3 py-2.5 pr-5 sm:pr-7'>{t('adminLogDetailPage.after')}</th>}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {visible.map((row) => (
                  <ChangeRow key={row.key} row={row} columns={columns} />
                ))}
              </tbody>
            </table>
            {hasBoth && changed.length === 0 && !showUnchanged && (
              <p className='px-5 py-6 text-center text-sm text-slate-500 sm:px-7'>{t('adminLogDetailPage.noChanges')}</p>
            )}
            {hasBoth && unchanged.length > 0 && (
              <button
                type='button'
                onClick={() => setShowUnchanged((v) => !v)}
                aria-expanded={showUnchanged}
                className='flex w-full items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-purple'
              >
                <ChevronDown
                  className={cn('size-3.5 transition-transform duration-300 ease-hud', showUnchanged && 'rotate-180')}
                  aria-hidden
                />
                {showUnchanged
                  ? t('adminLogDetailPage.hideUnchanged')
                  : t('adminLogDetailPage.showUnchanged', { count: unchanged.length })}
              </button>
            )}
          </div>
        )}

        {showRaw && (
          <div className='grid gap-4 p-5 sm:p-7 lg:grid-cols-2'>
            {log.OldData && <RawSnapshot label={t('adminLogDetailPage.before')} data={log.OldData} />}
            {log.NewData && <RawSnapshot label={t('adminLogDetailPage.after')} data={log.NewData} />}
          </div>
        )}
      </div>
    </section>
  )
}

function ChangeRow({ row, columns }: { row: FieldChange; columns: 'both' | 'before' | 'after' }) {
  return (
    <tr className={cn('align-top', row.changed && 'bg-amber-50/40')}>
      <th scope='row' className='px-5 py-3 font-mono text-xs font-semibold text-slate-700 sm:px-7'>
        <span className='flex items-center gap-2'>
          {row.changed && <span className='size-1.5 shrink-0 rounded-full bg-amber-500' aria-hidden />}
          {row.key}
        </span>
      </th>
      {columns !== 'after' && (
        <td className='px-3 py-3'>
          <Value value={row.before} tone={row.changed ? 'removed' : undefined} />
        </td>
      )}
      {columns !== 'before' && (
        <td className='px-3 py-3 pr-5 sm:pr-7'>
          <Value value={row.after} tone={row.changed ? 'added' : undefined} />
        </td>
      )}
    </tr>
  )
}

function Value({ value, tone }: { value: string; tone?: 'added' | 'removed' }) {
  return (
    <span
      className={cn(
        'inline-block max-w-full break-all rounded px-1.5 py-0.5 font-mono text-xs',
        tone === 'added' && 'bg-emerald-50 text-emerald-800',
        tone === 'removed' && 'bg-rose-50 text-rose-700 line-through decoration-rose-300',
        !tone && 'text-slate-600'
      )}
    >
      {value}
    </span>
  )
}

function RawSnapshot({ label, data }: { label: string; data: Record<string, unknown> }) {
  return (
    <div className='min-w-0'>
      <p className='mb-2 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
      <pre className='max-h-96 overflow-auto rounded-md bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>
        {JSON.stringify(data, (key, value) => (key && isSensitiveKey(key) ? MASKED_VALUE : value), 2)}
      </pre>
    </div>
  )
}
