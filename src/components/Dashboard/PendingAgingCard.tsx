import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashCard, dashCardHeader } from '@/components/Dashboard/styles'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
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
      <CardHeader className={dashCardHeader}>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
          <Clock className='h-4 w-4 text-amber-500' aria-hidden />
          {t('dashboard.pending.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        {hasStuck ? (
          <div className='space-y-2'>
            <div className='flex items-baseline gap-2'>
              <span
                className={cn(
                  'text-2xl font-semibold tabular-nums',
                  count > 0 ? 'text-amber-600' : 'text-foreground',
                )}
              >
                {formatNumber(count)}
              </span>
              <span className='text-sm text-muted-foreground'>
                {t('dashboard.pending.stuckSuffix', { minutes: threshold_minutes })}
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('dashboard.pending.oldest', { duration: oldestLabel })}
            </p>
          </div>
        ) : (
          <div className='flex items-center gap-3 py-2'>
            <CheckCircle2 className='h-6 w-6 shrink-0 text-emerald-600' aria-hidden />
            <p className='text-sm text-muted-foreground'>{t('dashboard.pending.none')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
