import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, ArrowLeft, ArrowUpRight } from 'lucide-react'

import { useActorLabel } from '@/components/ActivityLog/activity-log-meta'
import { ActorChip, MethodChip, StatusChip } from '@/components/ActivityLog/activity-log-parts'
import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { JsonBlock, LogMeta } from '@/components/IntegrationLog/integration-log-parts'
import { logCardClass } from '@/components/IntegrationLog/integration-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { CopyCodeButton } from '@/components/Referral/ReferralParts'
import { PERM, type Permission } from '@/constants/permissions'
import { useActivityLog } from '@/hooks/useActivityLog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { ActivityLogDetail } from '@/types/activity-log'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Where the record the request made or changed opens in this panel, when it has a page here. */
function resourceLink(log: ActivityLogDetail, can: (...codes: Permission[]) => boolean): string | null {
  if (!UUID.test(log.resource_id)) return null
  if (log.route.startsWith('/v1/transactions') && can(PERM.transactionView)) return `/transactions/${log.resource_id}`
  if (log.route.startsWith('/v1/games') && can(PERM.gameView)) return `/games/${log.resource_id}`
  return null
}

export default function ActivityLogDetailPage() {
  const { t } = useTranslation('common')
  const { id = '' } = useParams()
  const { data: log, isLoading, isError } = useActivityLog(id)
  const { can } = usePermissions()
  const actorLabel = useActorLabel()
  const resource = log ? resourceLink(log, can) : null
  const customer = log?.actor_type === 'USER' && log.actor_id && can(PERM.customerView) ? `/customers/${log.actor_id}` : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link
          to='/activity-logs'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
          {t('activityLogPage.detail.back')}
        </Link>

        {isLoading && <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('activityLogPage.detail.loadError')}</AuthAlert>}

        {log && (
          <section className={cn(logCardClass, 'animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud')}>
            <div className='bg-white hud-clip'>
              <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
              <div className='space-y-6 p-5 sm:p-7'>
                <div className='flex items-start gap-4'>
                  <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                    <Activity className='size-5' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <p className={hudEyebrowClass}>{t('activityLogPage.detail.eyebrow')}</p>
                    <h1 className='flex flex-wrap items-center gap-2 font-mono text-lg font-semibold leading-tight text-slate-900 sm:text-xl'>
                      <MethodChip method={log.method} />
                      <span className='break-all'>{log.route}</span>
                    </h1>
                    <div className='flex flex-wrap items-center gap-2'>
                      <StatusChip status={log.status} />
                      <ActorChip actor={log.actor_type} />
                      <span className='text-sm text-slate-600'>{actorLabel(log)}</span>
                    </div>
                  </div>
                </div>

                {log.message && (
                  <p
                    className={cn(
                      'rounded-md border px-3 py-2.5 text-sm',
                      log.status >= 400 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600'
                    )}
                  >
                    {log.message}
                  </p>
                )}

                <dl className='grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
                  <LogMeta label={t('activityLogPage.detail.time')}>{formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}</LogMeta>
                  <LogMeta label={t('activityLogPage.detail.ip')} mono>
                    {log.ip}
                  </LogMeta>
                  <LogMeta label={t('activityLogPage.detail.device')}>
                    <span title={log.user_agent}>{log.device || log.user_agent}</span>
                  </LogMeta>
                  <LogMeta label={t('activityLogPage.detail.path')} mono>
                    {log.path}
                  </LogMeta>
                  <LogMeta label={t('integrationLog.duration')}>{t('integrationLog.ms', { ms: log.duration_ms })}</LogMeta>
                  <LogMeta label={t('activityLogPage.detail.resource')} mono>
                    {log.resource_id}
                  </LogMeta>
                </dl>

                {(resource || customer) && (
                  <div className='flex flex-wrap gap-2'>
                    {resource && (
                      <Link
                        to={resource}
                        className='inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-purple/40 hover:text-brand-purple'
                      >
                        {t('activityLogPage.detail.openResource')}
                        <ArrowUpRight className='size-4' aria-hidden />
                      </Link>
                    )}
                    {customer && (
                      <Link
                        to={customer}
                        className='inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-purple/40 hover:text-brand-purple'
                      >
                        {t('activityLogPage.detail.openCustomer')}
                        <ArrowUpRight className='size-4' aria-hidden />
                      </Link>
                    )}
                  </div>
                )}

                <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
                  <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('integrationLog.logId')}</span>
                  <span className='min-w-0 flex-1 truncate font-mono text-slate-600'>{log.id}</span>
                  <CopyCodeButton code={log.id} />
                </div>

                <JsonBlock title={t('activityLogPage.detail.body')} value={log.request_body} empty={t('activityLogPage.detail.noBody')} />
                <p className='text-xs leading-relaxed text-slate-500'>{t('activityLogPage.detail.redactedNote')}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
