import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUpRight, ShieldAlert, ShieldCheck, TriangleAlert, Webhook } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { CallbackOutcomeChip, JsonBlock, LogMeta, PaylabsStatusChip } from '@/components/IntegrationLog/integration-log-parts'
import { logCardClass } from '@/components/IntegrationLog/integration-log-meta'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { CopyCodeButton } from '@/components/Referral/ReferralParts'
import { PaymentStatusChip } from '@/components/Transaction/TransactionParts'
import { usePaymentCallbackLog } from '@/hooks/useIntegrationLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CALLBACK_OUTCOMES, type CallbackOutcome } from '@/types/integration-log'

export default function PaymentCallbackLogDetailPage() {
  const { t } = useTranslation('common')
  const { id = '' } = useParams()
  const { data: log, isLoading, isError } = usePaymentCallbackLog(id)

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link
          to='/payment-callbacks'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
          {t('paymentCallbackLogPage.detail.back')}
        </Link>

        {isLoading && <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('paymentCallbackLogPage.detail.loadError')}</AuthAlert>}

        {log && (
          <section className={cn(logCardClass, 'animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud')}>
            <div className='bg-white hud-clip'>
              <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
              <div className='space-y-6 p-5 sm:p-7'>
                <div className='flex items-start gap-4'>
                  <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                    <Webhook className='size-5' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <p className={hudEyebrowClass}>{t('paymentCallbackLogPage.detail.eyebrow')}</p>
                    <h1 className='break-all font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'>
                      {log.payment_number || log.merchant_trade_no || t('paymentCallbackLogPage.noReference')}
                    </h1>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                      <CallbackOutcomeChip outcome={log.outcome} />
                      <PaylabsStatusChip status={log.status} />
                      <span className='inline-flex items-center gap-1'>
                        {log.signature_valid ? (
                          <ShieldCheck className='size-3.5 text-emerald-500' aria-hidden />
                        ) : (
                          <ShieldAlert className='size-3.5 text-amber-500' aria-hidden />
                        )}
                        {log.signature_valid ? t('integrationLog.signatureValid') : t('integrationLog.signatureInvalid')}
                      </span>
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

                {CALLBACK_OUTCOMES.includes(log.outcome as CallbackOutcome) && (
                  <p className='rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600'>{t(`integrationLog.outcomeHint.${log.outcome}`)}</p>
                )}

                {log.error_message && (
                  <div className='flex gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700'>
                    <TriangleAlert className='mt-0.5 size-4 shrink-0' aria-hidden />
                    <span className='break-all'>{log.error_message}</span>
                  </div>
                )}

                <dl className='grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
                  <LogMeta label={t('integrationLog.receivedAt')}>{formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}</LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.amount')}>{log.amount ? formatCurrency(log.amount) : ''}</LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.paymentType')}>{log.payment_type}</LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.requestId')} mono>
                    {log.request_id}
                  </LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.merchantTradeNo')} mono>
                    {log.merchant_trade_no}
                  </LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.platformTradeNo')} mono>
                    {log.platform_trade_no}
                  </LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.reply')}>
                    {log.ack_code
                      ? t('paymentCallbackLogPage.detail.ack', { code: log.ack_code, http: log.http_status })
                      : t('paymentCallbackLogPage.detail.httpOnly', { http: log.http_status })}
                  </LogMeta>
                  <LogMeta label={t('integrationLog.duration')}>{t('integrationLog.ms', { ms: log.duration_ms })}</LogMeta>
                  <LogMeta label={t('paymentCallbackLogPage.detail.clientIp')} mono>
                    {log.client_ip}
                  </LogMeta>
                  {log.payment_id && (
                    <LogMeta label={t('paymentCallbackLogPage.detail.paymentStatus')}>
                      <PaymentStatusChip status={log.payment_status} />
                    </LogMeta>
                  )}
                </dl>

                {log.payment_id && (
                  <Link
                    to={`/transactions/${log.payment_id}`}
                    className='inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple sm:hidden'
                  >
                    {t('integrationLog.openTransaction')}
                    <ArrowUpRight className='size-4' aria-hidden />
                  </Link>
                )}

                <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
                  <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('integrationLog.logId')}</span>
                  <span className='min-w-0 flex-1 truncate font-mono text-slate-600'>{log.id}</span>
                  <CopyCodeButton code={log.id} />
                </div>

                <JsonBlock title={t('paymentCallbackLogPage.detail.body')} value={log.body_json} raw={log.body} />
                <JsonBlock title={t('paymentCallbackLogPage.detail.headers')} value={Object.keys(log.headers ?? {}).length ? log.headers : null} />
                <JsonBlock
                  title={t('paymentCallbackLogPage.detail.replyBody')}
                  value={log.reply_json}
                  raw={log.reply}
                  empty={t('paymentCallbackLogPage.detail.noReply')}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
