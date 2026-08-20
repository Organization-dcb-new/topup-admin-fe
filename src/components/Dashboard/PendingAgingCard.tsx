import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  dashAccent,
  dashCard,
  dashCardBody,
  dashCardHeader,
  dashCardTitle,
} from '@/components/Dashboard/styles'
import { formatNumber } from '@/lib/format'
import type { PendingAging } from '@/types/dashboard'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PendingAgingCardProps {
  pendingAging: PendingAging
}

export function PendingAgingCard({ pendingAging }: PendingAgingCardProps) {
  const { t } = useTranslation('common')
  const { count, oldest_minutes, threshold_minutes } = pendingAging
  const hasStuck = count > 0

  const oldestHours = Math.floor(oldest_minutes / 60)
  const oldestMins = oldest_minutes % 60
  const oldestLabel =
    oldestHours > 0 ? `${oldestHours}${t('dashboard.pending.hourShort')} ${oldestMins}${t('dashboard.pending.minShort')}` : `${oldestMins}${t('dashboard.pending.minShort')}`

  return (
    <Card className={dashCard}>
      <CardHeader className={`${dashCardHeader} ${dashAccent.orange}`}>
        <CardTitle className={`${dashCardTitle} flex items-center gap-2`}>
          <Clock className='h-4 w-4' strokeWidth={3} aria-hidden />
          {t('dashboard.pending.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className={dashCardBody}>
        {hasStuck ? (
          <div className='space-y-2'>
            <div className='flex flex-wrap items-baseline gap-2'>
              <span className='nb-frame nb-frame-thin bg-[#ff9d3d] px-1.5 text-2xl font-black tabular-nums'>
                {formatNumber(count)}
              </span>
              <span className='text-xs font-bold uppercase tracking-tight text-[#111]/60'>
                {t('dashboard.pending.stuckSuffix', { minutes: threshold_minutes })}
              </span>
            </div>
            <p className='text-xs font-bold text-[#111]/55'>
              {t('dashboard.pending.oldest', { duration: oldestLabel })}
            </p>
          </div>
        ) : (
          <div className='flex items-center gap-3 py-2'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-9 w-9 shrink-0 items-center justify-center bg-[#c9f24d]'>
              <CheckCircle2 className='h-5 w-5' strokeWidth={3} aria-hidden />
            </span>
            <p className='text-xs font-bold uppercase tracking-tight text-[#111]/70'>
              {t('dashboard.pending.none')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
