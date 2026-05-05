import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type ProductLastUpdatedByFilterValue = 'all' | 'system' | 'process' | 'admin'

type Props = {
  value: ProductLastUpdatedByFilterValue
  onChange: (value: ProductLastUpdatedByFilterValue) => void
}

export function ProductLastUpdatedByFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className='grid min-w-0 gap-1.5'>
      <Label htmlFor='product-last-updated-by-filter' className='text-xs text-muted-foreground'>
        {t('productFilters.lastUpdatedByLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductLastUpdatedByFilterValue)}>
        <SelectTrigger id='product-last-updated-by-filter' className='h-10 w-full min-w-0 shadow-sm'>
          <SelectValue placeholder={t('productFilters.lastUpdatedByPlaceholder')} />
        </SelectTrigger>
        <SelectContent position='popper' align='start'>
          <SelectItem value='all'>{t('productFilters.all')}</SelectItem>
          <SelectItem value='system'>{t('productFilters.system')}</SelectItem>
          <SelectItem value='process'>{t('productFilters.process')}</SelectItem>
          <SelectItem value='admin'>{t('productFilters.admin')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
