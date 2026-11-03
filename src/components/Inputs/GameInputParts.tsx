import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GameInput } from '@/types/game-input'

/** A field roughly as the storefront draws it, so admins can judge the wording. */
export function InputPreview({ input, label, placeholder }: { input: GameInput; label?: string; placeholder?: string }) {
  const { t } = useTranslation('common')
  const shownLabel = (label ?? input.label) || input.key
  const shownPlaceholder = placeholder ?? input.placeholder

  return (
    <div className='min-w-0 space-y-1'>
      <p className='truncate text-xs font-medium text-slate-700'>
        {shownLabel}
        {input.required && <span className='ml-0.5 text-rose-500' aria-label={t('inputPage.required')}>*</span>}
      </p>
      <div
        className={cn(
          'flex h-9 items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm',
          shownPlaceholder ? 'text-slate-400' : 'italic text-slate-300'
        )}
        aria-hidden
      >
        <span className='truncate'>{shownPlaceholder || t('inputPage.noPlaceholder')}</span>
        {input.input_type === 'dropdown' && <ChevronDown className='size-4 shrink-0 text-slate-400' />}
      </div>
    </div>
  )
}

export function InputTypeChip({ input }: { input: GameInput }) {
  const { t } = useTranslation('common')
  const options = input.Options?.length ?? 0
  return (
    <span className='inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 hud-clip-sm'>
      {t(`inputPage.types.${input.input_type}`, { defaultValue: input.input_type })}
      {input.input_type === 'dropdown' && options > 0 && <span className='text-slate-400'>· {options}</span>}
    </span>
  )
}
