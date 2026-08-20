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

export type ProductStatusFilterValue = 'all' | 'active' | 'inactive'

type Props = {
  value: ProductStatusFilterValue
  onChange: (value: ProductStatusFilterValue) => void
}

export function ProductStatusFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className='grid min-w-0 gap-1.5'>
      <Label htmlFor='product-status-filter' className={nbLabel}>
        {t('productFilters.statusLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductStatusFilterValue)}>
        <SelectTrigger
          id='product-status-filter'
          className={cn(nbSelectTrigger, 'w-full min-w-0')}
        >
          <SelectValue placeholder={t('productFilters.statusPlaceholder')} />
        </SelectTrigger>
        {/* Portal Radix di luar pembungkus `.nb`, jadi kelasnya dipasang ulang. */}
        <SelectContent position='popper' align='start' className={nbSelectContent}>
          <SelectItem value='all' className={nbSelectItem}>
            {t('productFilters.all')}
          </SelectItem>
          <SelectItem value='active' className={nbSelectItem}>
            {t('productFilters.active')}
          </SelectItem>
          <SelectItem value='inactive' className={nbSelectItem}>
            {t('productFilters.inactive')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
