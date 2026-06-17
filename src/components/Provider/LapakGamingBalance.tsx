import { useGetLapakGamingBalance } from '@/hooks/useProvider'
import i18n from '@/i18n'
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
    <div className='flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 shadow-sm'>
      <Wallet className='h-4 w-4 shrink-0 text-primary' aria-hidden />
      <div className='flex flex-col leading-tight'>
        <span className='text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground'>
          {t('lapakGamingBalance.label')}
        </span>
        {isLoading ? (
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Loader2 className='h-3 w-3 animate-spin' aria-hidden />
            {t('lapakGamingBalance.loading')}
          </span>
        ) : isError ? (
          <span className='flex items-center gap-1 text-xs font-medium text-destructive'>
            <AlertCircle className='h-3 w-3' aria-hidden />
            {t('lapakGamingBalance.error')}
          </span>
        ) : (
          <span className='text-sm font-semibold tabular-nums text-foreground'>{formatted}</span>
        )}
      </div>
    </div>
  )
}
