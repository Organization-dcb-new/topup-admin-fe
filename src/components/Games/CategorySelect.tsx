import { useTranslation } from 'react-i18next'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGameCategoryOptions } from '@/hooks/useCategory'
import { gameSelectTriggerClass } from './game-utils'

interface CategorySelectProps {
  id: string
  value: string
  onChange: (id: string) => void
  /** Name to show when the saved id isn't among the options (e.g. a category no other game uses). */
  currentName?: string
  invalid?: boolean
  /** Fetch only while the form is open. */
  enabled: boolean
}

export function CategorySelect({ id, value, onChange, currentName, invalid, enabled }: CategorySelectProps) {
  const { t } = useTranslation('common')
  const { data, isLoading, isError } = useGameCategoryOptions(enabled)
  const options = data?.options ?? []
  // Keep the saved category selectable even when the list can't offer it.
  const all = value && !options.some((o) => o.id === value) ? [{ id: value, name: currentName || value }, ...options] : options

  return (
    <div className='space-y-1.5'>
      <Select value={value || undefined} onValueChange={onChange} disabled={isLoading || (isError && all.length === 0)}>
        <SelectTrigger id={id} aria-invalid={invalid} className={gameSelectTriggerClass}>
          <SelectValue placeholder={isLoading ? t('gameForm.categoryLoading') : t('gameForm.categoryPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {all.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {data?.source === 'games' && <p className='text-[11px] leading-snug text-amber-700'>{t('gameForm.categoryFallback')}</p>}
      {isError && <p className='text-[11px] leading-snug text-rose-600'>{t('gameForm.categoryError')}</p>}
    </div>
  )
}
