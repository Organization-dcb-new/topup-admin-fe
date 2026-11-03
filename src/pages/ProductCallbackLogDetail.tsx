import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, RadioTower } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { PriceDelta, StockChip } from '@/components/ProductCallbackLog/callback-log-parts'
import { CopyCodeButton } from '@/components/Referral/ReferralParts'
import { useGetProductCallbackLogById } from '@/hooks/useProductCallbackLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'

/** Provider timestamps come as Unix seconds or milliseconds. */
function fromUnix(value: number) {
  if (!value) return null
  const date = new Date(value > 1e12 ? value : value * 1000)
  return Number.isNaN(date.getTime()) ? null : date
}

export default function ProductCallbackLogDetailPage() {
  const { t, i18n } = useTranslation('common')
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useGetProductCallbackLogById(id)
  const log = data?.data
  const providerTime = log ? fromUnix(log.meta_timestamp) : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link
          to='/products/callback-logs'
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
          {t('productCallbackLogPage.detail.back')}
        </Link>

        {isLoading && <div className='h-72 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}
        {isError && <AuthAlert>{t('productCallbackLogPage.detail.loadError')}</AuthAlert>}

        {log && (
          <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud'>
            <div className='bg-white hud-clip'>
              <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
              <div className='space-y-6 p-5 sm:p-7'>
                <div className='flex items-start gap-4'>
                  <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                    <RadioTower className='size-5' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <p className={hudEyebrowClass}>{t('productCallbackLogPage.detail.eyebrow')}</p>
                    <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'>
                      {log.product_name || log.product_code}
                    </h1>
                    <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                      <span className='font-mono'>{log.product_code}</span>
                      {log.provider_code && (
                        <span className='bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 hud-clip-sm'>
                          {log.provider_code}
                        </span>
                      )}
                      <StockChip status={log.status} />
                    </div>
                  </div>
                </div>

                <div className='grid items-center gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_auto_1fr_auto] sm:p-5'>
                  <PriceBlock label={t('productCallbackLogPage.detail.previousPrice')} value={formatCurrency(log.previous_price)} muted />
                  <ArrowRight className='hidden size-5 text-slate-300 sm:block' aria-hidden />
                  <PriceBlock label={t('productCallbackLogPage.detail.newPrice')} value={formatCurrency(log.price)} />
                  <PriceDelta previous={log.previous_price} current={log.price} size='lg' />
                </div>

                <dl className='grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
                  <Meta label={t('productCallbackLogPage.detail.receivedAt')}>
                    {formatBackendDateTime(log.created_at, 'dd MMM yyyy, HH:mm:ss')}
                  </Meta>
                  <Meta label={t('productCallbackLogPage.detail.providerTime')}>
                    {providerTime
                      ? providerTime.toLocaleString(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Jakarta' })
                      : '—'}
                  </Meta>
                  <Meta label={t('productCallbackLogPage.detail.level')}>
                    <span className='capitalize'>{log.meta_level || '—'}</span>
                  </Meta>
                </dl>

                <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500'>
                  <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {t('productCallbackLogPage.detail.logId')}
                  </span>
                  <span className='min-w-0 flex-1 truncate font-mono text-slate-600'>{log.id}</span>
                  <CopyCodeButton code={log.id} />
                </div>

                {log.original_payload && Object.keys(log.original_payload).length > 0 && (
                  <div className='space-y-2'>
                    <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                      {t('productCallbackLogPage.detail.payload')}
                    </p>
                    <pre className='max-h-96 overflow-auto rounded-md bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>
                      {JSON.stringify(log.original_payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function PriceBlock({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className='min-w-0'>
      <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
      <p className={muted ? 'truncate text-xl font-semibold text-slate-400 line-through decoration-slate-300' : 'truncate font-display text-3xl font-bold text-slate-900'}>
        {value}
      </p>
    </div>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 text-sm'>
      <dt className='mb-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</dt>
      <dd className='truncate font-medium text-slate-800'>{children}</dd>
    </div>
  )
}
