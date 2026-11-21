import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useGetTransactionStop } from '@/hooks/useTransactionStop'

/**
 * Navbar pill while new checkouts are stopped, on every page, for admins who may see the switch.
 * Shares the page's query, so stopping or reopening there shows here at once.
 */
export function TransactionStopIndicator() {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const allowed = can(PERM.transactionStopView)
  const { data } = useGetTransactionStop({ enabled: allowed })

  if (!allowed || !data?.is_stopped) return null

  const label = t('transactionStopPage.indicator.aria')
  return (
    <Link
      to='/transaction-stop'
      aria-label={label}
      title={label}
      className='inline-flex h-9 shrink-0 items-center gap-2 bg-rose-600 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-white hud-clip-sm transition-colors duration-300 animate-in fade-in zoom-in-95 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90'
    >
      <span className='relative flex size-2' aria-hidden>
        <span className='absolute inset-0 animate-ping rounded-full bg-white opacity-60' />
        <span className='relative size-2 rounded-full bg-white' />
      </span>
      <span className='sm:hidden'>{t('transactionStopPage.indicator.short')}</span>
      <span className='hidden sm:inline'>{t('transactionStopPage.indicator.label')}</span>
    </Link>
  )
}
