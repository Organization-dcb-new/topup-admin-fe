import { useTranslation } from 'react-i18next'
import {
  KeyRound,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Nilai yang benar-benar ditulis backend (`admin_logs_entity.go` + satu
 * literal `RECOVERY` di admin_service). `LOGOUT` sudah dideklarasikan tapi
 * belum pernah dipakai — tetap dipetakan supaya tidak jatuh ke gaya netral
 * begitu backend mulai mencatatnya.
 */
const ACTION_STYLE: Record<string, { className: string; icon: LucideIcon }> = {
  CREATE: {
    className: 'border-success/30 bg-success/10 text-success',
    icon: Plus,
  },
  UPDATE: {
    className: 'border-primary/25 bg-primary/10 text-primary',
    icon: Pencil,
  },
  DELETE: {
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    icon: Trash2,
  },
  LOGIN: {
    className: 'border-border bg-muted text-muted-foreground',
    icon: LogIn,
  },
  LOGOUT: {
    className: 'border-border bg-muted text-muted-foreground',
    icon: LogOut,
  },
  RECOVERY: {
    className: 'border-warning/35 bg-warning/10 text-warning',
    icon: KeyRound,
  },
}

const NEUTRAL = 'border-border bg-muted text-muted-foreground'

export function ActionBadge({
  action,
  className,
}: {
  action: string
  className?: string
}) {
  const { t } = useTranslation('common')
  const style = ACTION_STYLE[action]
  const Icon = style?.icon

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold',
        style?.className ?? NEUTRAL,
        className,
      )}
    >
      {Icon && <Icon className='h-3 w-3 shrink-0' aria-hidden />}
      {/* Aksi tak dikenal tetap ditampilkan apa adanya, bukan disembunyikan */}
      {t(`adminLogActions.${action}`, { defaultValue: action })}
    </span>
  )
}

export function ModuleBadge({ module }: { module: string }) {
  const { t } = useTranslation('common')
  return (
    <span className='inline-flex w-fit shrink-0 whitespace-nowrap rounded-md border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-foreground'>
      {t(`adminLogModules.${module}`, { defaultValue: module })}
    </span>
  )
}
