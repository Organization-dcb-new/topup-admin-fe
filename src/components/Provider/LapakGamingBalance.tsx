import { useGetLapakGamingBalance } from '@/hooks/useProvider'
import i18n from '@/i18n'
import { nbHint, nbMutedLabel } from '@/lib/nb'
import { cn } from '@/lib/utils'
import { AlertCircle, Loader2, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LapakGamingBalance() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError } = useGetLapakGamingBalance()

  const balance = data?.data.balance
  const formatted =
    balance != null
      ? new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(balance)
      : null

  return (
    <div className='nb-frame nb-frame-thin nb-sd-sm flex h-10 shrink-0 items-center gap-2 bg-white px-3'>
      <Wallet className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
      <div className='flex flex-col leading-tight'>
        <span className={nbMutedLabel}>{t('lapakGamingBalance.label')}</span>
        {isLoading ? (
          <span className={cn('flex items-center gap-1', nbHint)}>
            <Loader2 className='h-3 w-3 animate-spin' strokeWidth={3} aria-hidden />
            {t('lapakGamingBalance.loading')}
          </span>
        ) : isError ? (
          <span className='flex items-center gap-1 text-xs font-black text-[#ff4d3d]'>
            <AlertCircle className='h-3 w-3' strokeWidth={3} aria-hidden />
            {t('lapakGamingBalance.error')}
          </span>
        ) : (
          <span className='text-sm font-black tabular-nums'>{formatted}</span>
        )}
      </div>
    </div>
  )
}
