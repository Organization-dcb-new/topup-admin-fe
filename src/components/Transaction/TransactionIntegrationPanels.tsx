import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ChevronRight, RefreshCw, ShieldAlert, TriangleAlert, Truck, Webhook } from 'lucide-react'

import { CallbackOutcomeChip, PaylabsStatusChip, ProviderResultChip, SupplierCodeChip } from '@/components/IntegrationLog/integration-log-parts'
import { useProviderLogLabel } from '@/components/IntegrationLog/integration-log-meta'
import { apiErrorMessage, useCheckProviderStatus, usePaymentCallbackLogs, useProviderOrderLogs } from '@/hooks/useIntegrationLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { TransactionDetail } from '@/types/transaction'
import { DetailField, DetailPanel, EmptyValue } from './detail-parts'
import { OrderStatusChip, ProviderStatusChip } from './TransactionParts'

const TRAIL_LIMIT = 10

interface PanelProps {
  detail: TransactionDetail
  order?: number
}

/** Every notification Paylabs sent about this transaction, newest first. */
export function TransactionPaylabsPanel({ detail, order }: PanelProps) {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, refetch } = usePaymentCallbackLogs({ page: 1, limit: TRAIL_LIMIT, orderId: detail.order_id })
  const logs = data?.data ?? []
  const total = data?.meta?.total_data ?? 0

  // A new callback is what moves the payment on; look again whenever its status changes.
  useRefetchOnChange(detail.status, refetch)

  return (
    <DetailPanel
      icon={Webhook}
      title={t('transactionDetailPage.paylabs.title')}
      order={order}
      footer={
        total > 0 ? (
          <TrailFooter to={`/payment-callbacks?search=${encodeURIComponent(detail.payment_number)}`} total={total} shown={logs.length} />
        ) : undefined
      }
    >
      {isLoading ? (
        <TrailSkeleton />
      ) : isError ? (
        <TrailError onRetry={() => void refetch()} />
      ) : logs.length === 0 ? (
        <p className='py-3 text-sm leading-relaxed text-slate-500'>
          {detail.gateway === 'redision' ? t('transactionDetailPage.paylabs.otherGateway') : t('transactionDetailPage.paylabs.empty')}
        </p>
      ) : (
        <ul className='divide-y divide-slate-100'>
          {logs.map((log) => (
            <li key={log.id}>
              <Link to={`/payment-callbacks/${log.id}`} className='group flex items-center gap-3 py-2.5'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <CallbackOutcomeChip outcome={log.outcome} />
                    <PaylabsStatusChip status={log.status} />
                    {!log.signature_valid && <ShieldAlert className='size-3.5 text-amber-500' aria-label={t('integrationLog.unverified')} />}
                  </div>
                  <p className='mt-1 truncate text-xs text-slate-500'>
                    {formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}
                    {log.error_message && ` · ${log.error_message}`}
                  </p>
                </div>
                <ChevronRight className='size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-purple' aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DetailPanel>
  )
}

/** The order at LapakGaming: its stored status, a live check, and every exchange about it. */
export function TransactionProviderPanel({ detail, order }: PanelProps) {
  const { t } = useTranslation('common')
  const label = useProviderLogLabel()
  const item = detail.order_item
  const tid = item?.provider_order_id || detail.order?.tid
  const check = useCheckProviderStatus(detail.order_id)
  const { data, isLoading, isError, refetch } = useProviderOrderLogs({ page: 1, limit: TRAIL_LIMIT, orderId: detail.order_id })
  const logs = data?.data ?? []
  const total = data?.meta?.total_data ?? 0
  const live = check.data

  // The order is sent once the payment is PAID; look again whenever either status changes.
  useRefetchOnChange(`${detail.status}/${detail.order?.status ?? ''}`, refetch)

  return (
    <DetailPanel
      icon={Truck}
      title={t('transactionDetailPage.provider.title')}
      order={order}
      footer={
        total > 0 ? (
          <TrailFooter to={`/provider-order-logs?search=${encodeURIComponent(detail.payment_number)}`} total={total} shown={logs.length} />
        ) : undefined
      }
    >
      <dl>
        <DetailField label={t('transactionDetailPage.provider.storedStatus')}>
          <ProviderStatusChip status={item?.status_provider} />
        </DetailField>
        <DetailField label={t('transactionDetailPage.provider.tid')} copy={tid || undefined} mono>
          {tid || <EmptyValue />}
        </DetailField>
      </dl>

      <div className='space-y-3 border-t border-slate-100 py-3'>
        <button
          type='button'
          onClick={() => check.mutate()}
          disabled={check.isPending}
          className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-brand-purple/40 hover:text-brand-purple disabled:opacity-60'
        >
          <RefreshCw className={cn('size-4', check.isPending && 'animate-spin')} aria-hidden />
          {check.isPending ? t('transactionDetailPage.provider.checking') : t('transactionDetailPage.provider.check')}
        </button>

        {check.isError && (
          <div className='flex gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700' role='alert'>
            <TriangleAlert className='mt-px size-3.5 shrink-0' aria-hidden />
            <span className='break-all'>{apiErrorMessage(check.error) ?? t('transactionDetailPage.provider.checkFailed')}</span>
          </div>
        )}

        {live && !check.isPending && (
          <div className='space-y-2 rounded-md bg-slate-50 px-3 py-2.5 text-xs text-slate-600 animate-in fade-in duration-300'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('transactionDetailPage.provider.liveAnswer')}
              </span>
              <SupplierCodeChip value={live.code} />
              {live.status && <SupplierCodeChip value={live.status} />}
            </div>
            {live.code && live.code !== 'SUCCESS' && <p>{t('transactionDetailPage.provider.liveNotOk')}</p>}
            {(live.transactions ?? []).map((tx) => (
              <p key={tx.id || tx.product_name} className='break-all'>
                {tx.product_name} · {tx.status}
                {tx.voucher_code && <span className='font-mono'> · {tx.voucher_code}</span>}
                {tx.note && <span className='text-slate-500'> · {tx.note}</span>}
              </p>
            ))}
            {live.order_updated && (
              <p className='flex flex-wrap items-center gap-1.5 font-medium text-emerald-700'>
                {t('transactionDetailPage.provider.orderUpdated')}
                <OrderStatusChip status={live.order_status} />
              </p>
            )}
            <p className='text-slate-400'>
              {t(live.order_updated ? 'transactionDetailPage.provider.checkedAtUpdated' : 'transactionDetailPage.provider.checkedAt', {
                time: formatBackendDateTime(live.checked_at, 'HH:mm:ss'),
              })}
            </p>
          </div>
        )}
      </div>

      <div className='border-t border-slate-100'>
        {isLoading ? (
          <TrailSkeleton />
        ) : isError ? (
          <TrailError onRetry={() => void refetch()} />
        ) : logs.length === 0 ? (
          <p className='py-3 text-sm leading-relaxed text-slate-500'>{t('transactionDetailPage.provider.empty')}</p>
        ) : (
          <ul className='divide-y divide-slate-100'>
            {logs.map((log) => {
              const { op, type } = label(log.operation, log.log_type)
              return (
                <li key={log.id}>
                  <Link to={`/provider-order-logs/${log.id}`} className='group flex items-center gap-3 py-2.5'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-1.5'>
                        <span className='text-sm font-medium text-slate-800 group-hover:text-brand-purple'>
                          {op} <span className='text-slate-400'>·</span> <span className='text-slate-500'>{type}</span>
                        </span>
                        <ProviderResultChip result={log.result} />
                        <SupplierCodeChip value={log.provider_code} />
                      </div>
                      <p className='mt-1 truncate text-xs text-slate-500'>
                        {formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}
                        {log.error_message && ` · ${log.error_message}`}
                      </p>
                    </div>
                    <ChevronRight className='size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-purple' aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </DetailPanel>
  )
}

/** Calls refetch when value changes after the first render (the query already loads on mount). */
function useRefetchOnChange(value: string, refetch: () => unknown) {
  const previous = useRef(value)
  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    void refetch()
  }, [value, refetch])
}

function TrailFooter({ to, total, shown }: { to: string; total: number; shown: number }) {
  const { t } = useTranslation('common')
  return (
    <Link to={to} className='group inline-flex items-center gap-1.5 font-medium text-brand-purple'>
      {total > shown ? t('transactionDetailPage.trail.seeAll', { count: total }) : t('transactionDetailPage.trail.openList')}
      <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' aria-hidden />
    </Link>
  )
}

function TrailSkeleton() {
  return (
    <div className='space-y-2 py-3' aria-hidden>
      <div className='h-9 animate-pulse rounded bg-slate-100' />
      <div className='h-9 animate-pulse rounded bg-slate-100' />
    </div>
  )
}

function TrailError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('common')
  return (
    <div className='flex items-center justify-between gap-3 py-3 text-sm text-rose-600'>
      <span>{t('transactionDetailPage.trail.loadError')}</span>
      <button type='button' onClick={onRetry} className='text-xs font-medium text-slate-600 hover:text-brand-purple'>
        {t('integrationLog.retry')}
      </button>
    </div>
  )
}
