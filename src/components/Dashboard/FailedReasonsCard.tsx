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
      <CardHeader className={`${dashCardHeader} ${dashAccent.red}`}>
        <CardTitle className={`${dashCardTitle} flex items-center gap-2`}>
          <AlertTriangle className='h-4 w-4' strokeWidth={3} aria-hidden />
          {t('dashboard.failed.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className={dashCardBody}>
        {failedReasons.length === 0 ? (
          <p className='py-4 text-center text-xs font-bold uppercase tracking-tight text-[#111]/55'>
            {t('dashboard.failed.empty')}
          </p>
        ) : (
          <ul className='space-y-3'>
            {failedReasons.map((r, i) => (
              <li key={`${r.reason}-${i}`} className='space-y-1.5'>
                <div className='flex items-center justify-between gap-3 text-sm'>
                  <span className='min-w-0 truncate font-bold text-[#111]' title={r.reason}>
                    {r.reason}
                  </span>
                  <span className='shrink-0 font-black tabular-nums text-[#111]'>
                    {formatNumber(r.count)}
                  </span>
                </div>
                {/* Bar diberi bingkai penuh supaya nilai kecil tetap terbaca
                    sebagai takaran, bukan sekadar garis tipis yang hilang. */}
                <div className='nb-frame nb-frame-thin h-3 w-full overflow-hidden bg-[#f5f1e8]'>
                  <div
                    className='h-full bg-[#ff4d3d]'
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
