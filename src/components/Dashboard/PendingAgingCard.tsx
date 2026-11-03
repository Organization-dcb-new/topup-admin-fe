import { ArrowRight, CheckCircle2, Hourglass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { formatNumber } from '@/lib/format'
import type { PendingAging } from '@/types/dashboard'
import { DashboardPanel } from './DashboardPanel'

export function PendingAgingCard({ pendingAging, order }: { pendingAging: PendingAging; order?: number }) {
  const { t } = useTranslation('common')
  const { count, oldest_minutes, threshold_minutes } = pendingAging
  const hasStuck = count > 0

  const hours = Math.floor(oldest_minutes / 60)
  const minutes = oldest_minutes % 60
  const oldest = [
    hours ? t('dashboard.pending.hours', { count: hours }) : null,
    minutes || !hours ? t('dashboard.pending.minutes', { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <DashboardPanel
      title={t('dashboard.pending.title')}
      icon={Hourglass}
      iconClassName={hasStuck ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
      order={order}
      tone={hasStuck ? 'warning' : 'default'}
    >
      {hasStuck ? (
        <div className='flex h-full flex-col gap-4'>
          <div>
            <p className='font-display text-4xl font-bold text-amber-600'>{formatNumber(count)}</p>
            <p className='mt-1 text-sm text-slate-600'>
              {t('dashboard.pending.stuck', { count, minutes: threshold_minutes })}
            </p>
          </div>
          <div className='rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800'>
            {t('dashboard.pending.oldest', { duration: oldest })}
          </div>
          <Can permission={PERM.transactionView}>
            <Link
              to='/transactions'
              className='group mt-auto inline-flex items-center gap-1.5 self-start font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple'
            >
              {t('dashboard.pending.review')}
              <ArrowRight className='size-3.5 transition-transform duration-300 ease-hud group-hover:translate-x-0.5' aria-hidden />
            </Link>
          </Can>
        </div>
      ) : (
        <div className='flex h-full flex-col items-center justify-center gap-2 py-4 text-center'>
          <span className='grid size-11 place-items-center bg-emerald-50 text-emerald-600 hud-clip-sm'>
            <CheckCircle2 className='size-5' aria-hidden />
          </span>
          <p className='text-sm font-medium text-slate-700'>{t('dashboard.pending.none')}</p>
          <p className='text-xs text-slate-500'>{t('dashboard.pending.noneHint', { minutes: threshold_minutes })}</p>
        </div>
      )}
    </DashboardPanel>
  )
}
