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

export type ProductProviderStatusFilterValue = 'all' | 'available' | 'empty'

type Props = {
  value: ProductProviderStatusFilterValue
  onChange: (value: ProductProviderStatusFilterValue) => void
}

export function ProductProviderStatusFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className='grid min-w-0 gap-1.5'>
      <Label htmlFor='product-provider-status-filter' className={nbLabel}>
        {t('productFilters.providerStatusLabel')}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductProviderStatusFilterValue)}>
        <SelectTrigger
          id='product-provider-status-filter'
          className={cn(nbSelectTrigger, 'w-full min-w-0')}
        >
          <SelectValue placeholder={t('productFilters.providerStatusPlaceholder')} />
        </SelectTrigger>
        {/* Portal Radix di luar pembungkus `.nb`, jadi kelasnya dipasang ulang. */}
        <SelectContent position='popper' align='start' className={nbSelectContent}>
          <SelectItem value='all' className={nbSelectItem}>
            {t('productFilters.all')}
          </SelectItem>
          <SelectItem value='available' className={nbSelectItem}>
            {t('productFilters.providerAvailable')}
          </SelectItem>
          <SelectItem value='empty' className={nbSelectItem}>
            {t('productFilters.providerEmpty')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
