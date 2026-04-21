import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function ProductNameSearchInput({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className='grid min-w-0 gap-1.5'>
      <Label htmlFor='product-name-search' className='text-xs text-muted-foreground'>
        {t('productFilters.nameLabel')}
      </Label>
      <div className='relative'>
        <Search
          className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
          aria-hidden
        />
        <Input
          id='product-name-search'
          placeholder={t('productFilters.namePlaceholder')}
          className='h-10 w-full min-w-0 pl-9 shadow-sm'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t('productFilters.nameAria')}
        />
      </div>
    </div>
  )
}
