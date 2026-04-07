import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ProductProviderStatusFilterValue = 'all' | 'available' | 'empty'

type Props = {
  value: ProductProviderStatusFilterValue
  onChange: (value: ProductProviderStatusFilterValue) => void
}

export function ProductProviderStatusFilter({ value, onChange }: Props) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor="product-provider-status-filter" className="text-xs text-muted-foreground">
        Status provider
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ProductProviderStatusFilterValue)}
      >
        <SelectTrigger id="product-provider-status-filter" className="h-10 w-full min-w-0 shadow-sm">
          <SelectValue placeholder="Status provider" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">Semua</SelectItem>
          <SelectItem value="available">Tersedia</SelectItem>
          <SelectItem value="empty">Kosong</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
