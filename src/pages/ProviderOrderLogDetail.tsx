import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUpRight, TriangleAlert, Truck } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { JsonBlock, LogMeta, ProviderResultChip, SupplierCodeChip } from '@/components/IntegrationLog/integration-log-parts'
import { logCardClass, useProviderLogLabel } from '@/components/IntegrationLog/integration-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { CopyCodeButton } from '@/components/Referral/ReferralParts'
import { useProviderOrderLog } from '@/hooks/useIntegrationLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'

export default function ProviderOrderLogDetailPage() {
  const { t } = useTranslation('common')
  const { id = '' } = useParams()
  const { data: log, isLoading, isError } = useProviderOrderLog(id)
  const label = useProviderLogLabel()
  const names = log ? label(log.operation, log.log_type) : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link
          to='/provider-order-logs'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
          {t('providerOrderLogPage.detail.back')}
        </Link>

        {isLoading && <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('providerOrderLogPage.detail.loadError')}</AuthAlert>}

        {log && names && (
          <section className={cn(logCardClass, 'animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud')}>
            <div className='bg-white hud-clip'>
              <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
              <div className='space-y-6 p-5 sm:p-7'>
                <div className='flex items-start gap-4'>
                  <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                    <Truck className='size-5' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <p className={hudEyebrowClass}>{t('providerOrderLogPage.detail.eyebrow', { provider: log.provider_name })}</p>
                    <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'>
                      {names.op} <span className='text-slate-400'>·</span> {names.type}
                    </h1>
                    <div className='flex flex-wrap items-center gap-2'>
                      <ProviderResultChip result={log.result} />
                      <SupplierCodeChip value={log.provider_code} />
                      {log.provider_status && log.provider_status !== log.provider_code && <SupplierCodeChip value={log.provider_status} />}
                    </div>
                  </div>
                  {log.payment_id && (
                    <Link
                      to={`/transactions/${log.payment_id}`}
                      className='hidden shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-purple/40 hover:text-brand-purple sm:inline-flex'
                    >
                      {t('integrationLog.openTransaction')}
                      <ArrowUpRight className='size-4' aria-hidden />
                    </Link>
                  )}
                </div>

                {log.error_message && (
                  <div className='flex gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700'>
                    <TriangleAlert className='mt-0.5 size-4 shrink-0' aria-hidden />
                    <span className='break-all'>{log.error_message}</span>
                  </div>
                )}

                <dl className='grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
                  <LogMeta label={t('integrationLog.receivedAt')}>{formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}</LogMeta>
                  <LogMeta label={t('providerOrderLogPage.detail.payment')} mono>
                    {log.payment_number}
                  </LogMeta>
                  <LogMeta label={t('providerOrderLogPage.detail.tid')} mono>
                    {log.provider_order_id}
                  </LogMeta>
                  <LogMeta label={t('providerOrderLogPage.detail.orderId')} mono>
                    {log.order_id}
                  </LogMeta>
                  <LogMeta label={t('providerOrderLogPage.detail.http')}>{log.http_status_code ? String(log.http_status_code) : ''}</LogMeta>
                  <LogMeta label={t('integrationLog.duration')}>{log.response_time_ms ? t('integrationLog.ms', { ms: log.response_time_ms }) : ''}</LogMeta>
                </dl>

                {log.payment_id && (
                  <Link to={`/transactions/${log.payment_id}`} className='inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple sm:hidden'>
                    {t('integrationLog.openTransaction')}
                    <ArrowUpRight className='size-4' aria-hidden />
                  </Link>
                )}

                <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
                  <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('integrationLog.logId')}</span>
                  <span className='min-w-0 flex-1 truncate font-mono text-slate-600'>{log.id}</span>
                  <CopyCodeButton code={log.id} />
                </div>

                <JsonBlock
                  title={log.log_type === 'CALLBACK_FROM_PROVIDER' ? t('providerOrderLogPage.detail.callbackBody') : t('providerOrderLogPage.detail.request')}
                  value={log.request_payload}
                />
                {log.log_type !== 'CALLBACK_FROM_PROVIDER' && (
                  <JsonBlock
                    title={t('providerOrderLogPage.detail.response')}
                    value={log.response_payload}
                    empty={log.log_type === 'REQUEST_TO_PROVIDER' ? t('providerOrderLogPage.detail.responseElsewhere') : undefined}
                  />
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
