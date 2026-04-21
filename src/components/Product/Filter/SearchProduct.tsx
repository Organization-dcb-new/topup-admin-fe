import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProductInputProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function ProductsSearchInput({ search, onSearchChange }: ProductInputProps) {
  const { t } = useTranslation('common')
  return (
    <div className='relative min-w-0 flex-1 sm:min-w-[14rem] sm:max-w-md'>
      <Search
        className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
        aria-hidden
      />
      <Input
        placeholder={t('gameSearchInput.placeholder')}
        className='h-10 pl-9 shadow-sm'
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={t('gameSearchInput.placeholder')}
      />
    </div>
  )
}
