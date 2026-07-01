import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashCard, dashCardHeader } from '@/components/Dashboard/styles'
import { formatNumber } from '@/lib/format'
import type { FailedReason } from '@/types/dashboard'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FailedReasonsCardProps {
  failedReasons: FailedReason[]
}

export function FailedReasonsCard({ failedReasons }: FailedReasonsCardProps) {
  const { t } = useTranslation('common')
  const max = failedReasons.reduce((acc, r) => Math.max(acc, r.count), 0)

  return (
    <Card className={dashCard}>
      <CardHeader className={dashCardHeader}>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
          <AlertTriangle className='h-4 w-4 text-red-500' aria-hidden />
          {t('dashboard.failed.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        {failedReasons.length === 0 ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            {t('dashboard.failed.empty')}
          </p>
        ) : (
          <ul className='space-y-3'>
            {failedReasons.map((r, i) => (
              <li key={`${r.reason}-${i}`} className='space-y-1'>
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='min-w-0 truncate text-foreground' title={r.reason}>
                    {r.reason}
                  </span>
                  <span className='shrink-0 tabular-nums font-medium text-muted-foreground'>
                    {formatNumber(r.count)}
                  </span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-full rounded-full bg-red-500/70'
                    style={{ width: `${max > 0 ? (r.count / max) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
