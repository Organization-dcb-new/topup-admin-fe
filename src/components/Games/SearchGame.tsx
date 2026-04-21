import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface GameInputProps {
  value: string
  onChange: (value: string) => void
}

export default function GameSearchInput({ value, onChange }: GameInputProps) {
  const { t } = useTranslation('common')

  return (
    <div className='flex items-center gap-4'>
      <div className='relative w-64'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' aria-hidden />
        <Input
          placeholder={t('gameSearchInput.placeholder')}
          className='pl-9'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
