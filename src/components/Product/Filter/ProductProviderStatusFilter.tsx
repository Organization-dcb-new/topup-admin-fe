import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export type ProductProviderStatusFilterValue = 'all' | 'available' | 'empty'

type Props = {
  value: ProductProviderStatusFilterValue
  onChange: (value: ProductProviderStatusFilterValue) => void
}

export function ProductProviderStatusFilter({ value, onChange }: Props) {
  const { t } = useTranslation('common')
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor="product-provider-status-filter" className="text-xs text-muted-foreground">
        {t('productFilters.providerStatusLabel')}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ProductProviderStatusFilterValue)}
      >
        <SelectTrigger id="product-provider-status-filter" className="h-10 w-full min-w-0 shadow-sm">
          <SelectValue placeholder={t('productFilters.providerStatusPlaceholder')} />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">{t('productFilters.all')}</SelectItem>
          <SelectItem value="available">{t('productFilters.providerAvailable')}</SelectItem>
          <SelectItem value="empty">{t('productFilters.providerEmpty')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
