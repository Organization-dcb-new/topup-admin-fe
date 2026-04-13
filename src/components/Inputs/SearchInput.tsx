import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { useTranslation } from 'react-i18next'

interface GameInputFormProps {
  value: string
  onChange: (value: string) => void
}

export default function GameInputSearchInput({ value, onChange }: GameInputFormProps) {
  const { t } = useTranslation('common')
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('inputPage.searchPlaceholder')}
          className="pl-9"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
