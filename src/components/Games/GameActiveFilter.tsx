import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type GameActiveFilterValue = 'all' | 'active' | 'inactive'

type Props = {
  value: GameActiveFilterValue
  onChange: (value: GameActiveFilterValue) => void
}

export function GameActiveFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')

  return (
    <div className="grid min-w-0 w-full gap-1.5">
      <Label htmlFor="game-active-filter" className="text-xs text-muted-foreground">
        {t('gameFilters.statusLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as GameActiveFilterValue)}>
        <SelectTrigger id="game-active-filter" className="w-full min-w-0 bg-background shadow-sm" size="sm">
          <SelectValue placeholder={t('gameFilters.statusPlaceholder')} />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">{t('gameFilters.all')}</SelectItem>
          <SelectItem value="active">{t('gameFilters.active')}</SelectItem>
          <SelectItem value="inactive">{t('gameFilters.inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
