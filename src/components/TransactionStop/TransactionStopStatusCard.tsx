import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Ban, CircleCheck, Clock, Eye, Hourglass, ShoppingCart, TimerReset, type LucideIcon } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { formatRelative } from '@/components/Maintenance/maintenance-status'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import { cn } from '@/lib/utils'
import { TRANSACTION_STOP_DEFAULT_MESSAGE } from '@/schemas/transaction-stop'
import type { TransactionStop } from '@/types/transaction-stop'

const labelClass = 'font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'

function toMs(iso: string | null) {
  return iso ? Date.parse(iso) : Number.NaN
}

/** The big state of the switch: STOP or running, since when, until when and who changed it. */
export function TransactionStopStatusCard({ state, now }: { state: TransactionStop; now: number }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const stopped = state.is_stopped
  // Switched on but no longer in force: resume_at passed and checkout reopened by itself.
  const autoReopened = state.switched_on && !state.is_stopped
  const stoppedMs = toMs(state.stopped_at)
  const resumeMs = toMs(state.resume_at)
  const absolute = (iso: string | null) => formatMaintenanceInstant(iso, { locale, dateStyle: 'medium' })
  const relative = (ms: number) => (Number.isFinite(ms) ? formatRelative(ms, now, locale) : null)

  return (
    <section className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'>
      <div
        className={cn(
          'h-full p-px transition-colors duration-300 hud-clip',
          stopped ? 'bg-rose-300/80' : 'bg-slate-200/80'
        )}
      >
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div
            className={cn(
              'h-1 transition-colors duration-300',
              stopped ? 'bg-linear-to-r from-rose-500 to-brand-purple' : 'bg-linear-to-r from-emerald-400 to-brand-cyan'
            )}
            aria-hidden
          />
          <div className='flex flex-1 flex-col gap-5 p-5 sm:p-6'>
            <p className={hudEyebrowClass}>{t('transactionStopPage.status.eyebrow')}</p>

            <div className='flex items-center gap-4' role='status' aria-live='polite'>
              <span
                className={cn(
                  'grid size-14 shrink-0 place-items-center text-white hud-clip-sm',
                  stopped ? 'bg-linear-to-br from-rose-500 to-brand-purple' : 'bg-linear-to-br from-emerald-400 to-brand-cyan'
                )}
              >
                {stopped ? <Ban className='size-6' aria-hidden /> : <ShoppingCart className='size-6' aria-hidden />}
              </span>
              <div key={stopped ? 'stopped' : 'running'} className='min-w-0 animate-in fade-in duration-500'>
                <p
                  className={cn(
                    'flex items-center gap-2.5 font-display text-4xl font-bold uppercase leading-none tracking-tight',
                    stopped ? 'text-rose-600' : 'text-emerald-600'
                  )}
                >
                  <span
                    className={cn('size-2.5 shrink-0 rounded-full', stopped ? 'bg-rose-500 animate-hud-signal' : 'bg-emerald-500')}
                    aria-hidden
                  />
                  {stopped ? t('transactionStopPage.status.stopped') : t('transactionStopPage.status.running')}
                </p>
                <p className='mt-1.5 text-sm text-slate-500'>
                  {stopped ? t('transactionStopPage.status.stoppedBody') : t('transactionStopPage.status.runningBody')}
                </p>
              </div>
            </div>

            {autoReopened && (
              <p className='flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>
                <TimerReset className='mt-0.5 size-4 shrink-0' aria-hidden />
                <span>
                  {t('transactionStopPage.status.autoReopened', {
                    date: absolute(state.resume_at),
                    when: relative(resumeMs) ?? '',
                  })}
                </span>
              </p>
            )}

            {stopped && (
              <dl className='grid gap-4 rounded-lg border border-slate-200 px-4 py-3 sm:grid-cols-2'>
                <Fact
                  icon={Clock}
                  label={t('transactionStopPage.status.since')}
                  value={absolute(state.stopped_at)}
                  wib={!!state.stopped_at}
                  sub={relative(stoppedMs)}
                />
                <Fact
                  icon={Hourglass}
                  label={t('transactionStopPage.status.resumeAt')}
                  value={state.resume_at ? absolute(state.resume_at) : t('transactionStopPage.status.resumeManual')}
                  wib={!!state.resume_at}
                  sub={state.resume_at ? relative(resumeMs) : t('transactionStopPage.status.resumeManualHint')}
                  tone={state.resume_at ? 'rose' : undefined}
                />
              </dl>
            )}

            {stopped && (
              <div className='space-y-1.5'>
                <p className={labelClass}>{t('transactionStopPage.status.messageLabel')}</p>
                <p
                  className={cn(
                    'rounded-md border-l-2 px-3 py-2 text-sm leading-relaxed whitespace-pre-line',
                    state.message ? 'border-rose-400 bg-rose-50/60 text-slate-800' : 'border-slate-300 bg-slate-50 text-slate-500'
                  )}
                >
                  {state.message || TRANSACTION_STOP_DEFAULT_MESSAGE}
                </p>
                {!state.message && (
                  <p className='text-[11px] text-slate-400'>{t('transactionStopPage.status.defaultMessageNote')}</p>
                )}
              </div>
            )}

            <div className='space-y-2'>
              <p className={labelClass}>{t('transactionStopPage.impact.title')}</p>
              <ul className='divide-y divide-slate-100 rounded-lg border border-slate-200'>
                <ImpactRow icon={Ban} label={t('transactionStopPage.impact.checkout')} value={t('transactionStopPage.impact.checkoutValue')} tone='rose' />
                <ImpactRow icon={Eye} label={t('transactionStopPage.impact.browse')} value={t('transactionStopPage.impact.browseValue')} tone='emerald' />
                <ImpactRow icon={CircleCheck} label={t('transactionStopPage.impact.pending')} value={t('transactionStopPage.impact.pendingValue')} tone='emerald' />
              </ul>
            </div>

            <p className='mt-auto truncate border-t border-slate-100 pt-4 text-xs text-slate-500'>
              {state.updated_by
                ? t('transactionStopPage.status.updatedBy', { who: state.updated_by, date: absolute(state.updated_at) })
                : t('transactionStopPage.status.neverChanged')}
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}

interface FactProps {
  icon: LucideIcon
  label: string
  value: string
  /** Mark the value as WIB time. */
  wib: boolean
  sub: ReactNode
  tone?: 'rose'
}

function Fact({ icon: Icon, label, value, wib, sub, tone }: FactProps) {
  const { t } = useTranslation()
  return (
    <div className='min-w-0'>
      <dt className={cn(labelClass, 'flex items-center gap-1.5')}>
        <Icon className='size-3.5' aria-hidden />
        {label}
      </dt>
      <dd className='mt-1'>
        <span className='block text-sm font-semibold leading-snug tabular-nums text-slate-800'>
          {value}
          {wib && (
            <span className='ml-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('transactionStopPage.wib')}
            </span>
          )}
        </span>
        {sub && <span className={cn('block text-xs', tone === 'rose' ? 'font-medium text-rose-600' : 'text-slate-500')}>{sub}</span>}
      </dd>
    </div>
  )
}

function ImpactRow({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: 'rose' | 'emerald' }) {
  return (
    <li className='flex items-center justify-between gap-3 px-4 py-2.5 text-sm'>
      <span className='flex min-w-0 items-center gap-2 text-slate-700'>
        <Icon className={cn('size-4 shrink-0', tone === 'rose' ? 'text-rose-500' : 'text-emerald-500')} aria-hidden />
        <span className='truncate'>{label}</span>
      </span>
      <span className={cn('shrink-0 text-xs font-semibold', tone === 'rose' ? 'text-rose-600' : 'text-emerald-600')}>{value}</span>
    </li>
  )
}
