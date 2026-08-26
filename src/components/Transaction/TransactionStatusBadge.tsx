import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/types/transaction'

type BadgeTone = 'success' | 'warning' | 'info' | 'destructive' | 'neutral'

export interface TransactionStatusBadgeProps {
  /**
   * Status pembayaran kanonik, atau nilai bebas dari provider
   * (`status_provider`). Nilai yang tidak dikenal jatuh ke tampilan netral.
   */
  status: PaymentStatus | (string & {})
  /** `soft` (default): latar tipis; `solid`: latar penuh token warna. */
  variant?: 'soft' | 'solid'
  className?: string
}

const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'PENDING',
  'PAID',
  'FAILED',
  'PROCESSING',
  'EXPIRED',
]

/**
 * Peta nada warna. Selain lima status kanonik, beberapa nilai provider yang
 * lazim ikut dipetakan; sisanya netral — provider bebas mengirim apa saja.
 */
const TONE_BY_STATUS: Record<string, BadgeTone> = {
  PAID: 'success',
  SUCCESS: 'success',
  PENDING: 'warning',
  PROCESS: 'info',
  PROCESSING: 'info',
  FAILED: 'destructive',
  EXPIRED: 'destructive',
}

const SOFT_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-info/10 text-info border-info/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral: 'bg-muted text-muted-foreground border-border',
}

const SOLID_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success text-success-foreground border-transparent',
  warning: 'bg-warning text-warning-foreground border-transparent',
  info: 'bg-info text-info-foreground border-transparent',
  destructive: 'bg-destructive text-white border-transparent',
  neutral: 'bg-muted text-muted-foreground border-transparent',
}

const SOFT_DOT_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
  neutral: 'bg-muted-foreground',
}

export function TransactionStatusBadge({
  status,
  variant = 'soft',
  className,
}: TransactionStatusBadgeProps) {
  const { t } = useTranslation('common')

  const tone: BadgeTone = TONE_BY_STATUS[status] ?? 'neutral'
  const isCanonical = (PAYMENT_STATUSES as readonly string[]).includes(status)
  const isLive = status === 'PENDING' || status === 'PROCESSING'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors duration-200 motion-reduce:transition-none',
        variant === 'solid' ? SOLID_CLASSES[tone] : SOFT_CLASSES[tone],
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          variant === 'solid' ? 'bg-current' : SOFT_DOT_CLASSES[tone],
          isLive && 'animate-pulse motion-reduce:animate-none',
        )}
        aria-hidden
      />
      {isCanonical ? t(`paymentStatus.${status}`) : status}
    </span>
  )
}
