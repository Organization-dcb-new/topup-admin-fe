import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { actionMeta } from './admin-log-meta'

const chipClass =
  'inline-flex items-center px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm'

export function ActionTile({ action, size = 'md' }: { action: string; size?: 'md' | 'lg' }) {
  const meta = actionMeta(action)
  const Icon = meta.icon
  return (
    <span
      className={cn('grid shrink-0 place-items-center hud-clip-sm', meta.tile, size === 'lg' ? 'size-12' : 'size-9')}
      aria-hidden
    >
      <Icon className={size === 'lg' ? 'size-5' : 'size-4'} />
    </span>
  )
}

export function ActionChip({ action }: { action: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn(chipClass, actionMeta(action).chip)}>
      {t(`adminLogPage.actions.${action}`, { defaultValue: action })}
    </span>
  )
}

export function ModuleChip({ module }: { module: string }) {
  const { t } = useTranslation()
  return (
    <span className={cn(chipClass, 'bg-slate-100 text-slate-600')}>
      {t(`adminLogPage.modules.${module}`, { defaultValue: module.replaceAll('_', ' ') })}
    </span>
  )
}
