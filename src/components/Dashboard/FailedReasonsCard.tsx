import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatNumber } from '@/lib/format'
import type { FailedReason } from '@/types/dashboard'
import { DashboardPanel } from './DashboardPanel'

export function FailedReasonsCard({ failedReasons, order }: { failedReasons: FailedReason[]; order?: number }) {
  const { t } = useTranslation('common')
  const max = failedReasons.reduce((acc, r) => Math.max(acc, r.count), 0)
  const total = failedReasons.reduce((acc, r) => acc + r.count, 0)

  return (
    <DashboardPanel
      title={t('dashboard.failed.title')}
      icon={AlertTriangle}
      iconClassName='bg-rose-50 text-rose-600'
      order={order}
      actions={
        total > 0 ? (
          <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
            {t('dashboard.failed.total', { count: total, formatted: formatNumber(total) })}
          </span>
        ) : undefined
      }
    >
      {failedReasons.length === 0 ? (
        <div className='flex h-full flex-col items-center justify-center gap-2 py-4 text-center'>
          <span className='grid size-11 place-items-center bg-emerald-50 text-emerald-600 hud-clip-sm'>
            <ShieldCheck className='size-5' aria-hidden />
          </span>
          <p className='text-sm font-medium text-slate-700'>{t('dashboard.failed.empty')}</p>
        </div>
      ) : (
        <ol className='space-y-3.5'>
          {failedReasons.map((r, i) => (
            <li key={`${r.reason}-${i}`} className='space-y-1.5'>
              <div className='flex items-baseline justify-between gap-3 text-sm'>
                <span className='min-w-0 truncate text-slate-700' title={r.reason}>
                  {r.reason || t('dashboard.failed.unknown')}
                </span>
                <span className='shrink-0 font-semibold tabular-nums text-slate-900'>{formatNumber(r.count)}</span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-rose-500/80 transition-[width] duration-700 ease-hud'
                  style={{ width: `${max > 0 ? (r.count / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardPanel>
  )
}
