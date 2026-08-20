import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { nbLabel, nbSelectContent, nbSelectItem, nbSelectTrigger } from '@/styles/nb'
import { cn } from '@/lib/utils'
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
      <Label htmlFor='product-last-updated-by-filter' className={nbLabel}>
        {t('productFilters.lastUpdatedByLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductLastUpdatedByFilterValue)}>
        <SelectTrigger
          id='product-last-updated-by-filter'
          className={cn(nbSelectTrigger, 'w-full min-w-0')}
        >
          <SelectValue placeholder={t('productFilters.lastUpdatedByPlaceholder')} />
        </SelectTrigger>
        {/* Portal Radix di luar pembungkus `.nb`, jadi kelasnya dipasang ulang. */}
        <SelectContent position='popper' align='start' className={nbSelectContent}>
          <SelectItem value='all' className={nbSelectItem}>
            {t('productFilters.all')}
          </SelectItem>
          <SelectItem value='system' className={nbSelectItem}>
            {t('productFilters.system')}
          </SelectItem>
          <SelectItem value='process' className={nbSelectItem}>
            {t('productFilters.process')}
          </SelectItem>
          <SelectItem value='admin' className={nbSelectItem}>
            {t('productFilters.admin')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
