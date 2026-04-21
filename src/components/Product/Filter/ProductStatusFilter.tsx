import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type ProductStatusFilterValue = 'all' | 'active' | 'inactive'

type Props = {
  value: ProductStatusFilterValue
  onChange: (value: ProductStatusFilterValue) => void
}

export function ProductStatusFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className='grid min-w-0 gap-1.5'>
      <Label htmlFor='product-status-filter' className='text-xs text-muted-foreground'>
        {t('productFilters.statusLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductStatusFilterValue)}>
        <SelectTrigger id='product-status-filter' className='h-10 w-full min-w-0 shadow-sm'>
          <SelectValue placeholder={t('productFilters.statusPlaceholder')} />
        </SelectTrigger>
        <SelectContent position='popper' align='start'>
          <SelectItem value='all'>{t('productFilters.all')}</SelectItem>
          <SelectItem value='active'>{t('productFilters.active')}</SelectItem>
          <SelectItem value='inactive'>{t('productFilters.inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
