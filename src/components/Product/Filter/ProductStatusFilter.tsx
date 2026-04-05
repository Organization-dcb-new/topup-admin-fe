import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ProductStatusFilterValue = 'all' | 'active' | 'inactive'

type Props = {
  value: ProductStatusFilterValue
  onChange: (value: ProductStatusFilterValue) => void
}

export function ProductStatusFilter({ value, onChange }: Props) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor="product-status-filter" className="text-xs text-muted-foreground">
        Status
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as ProductStatusFilterValue)}>
        <SelectTrigger id="product-status-filter" className="h-10 w-full min-w-0 shadow-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="all">Semua</SelectItem>
          <SelectItem value="active">Aktif</SelectItem>
          <SelectItem value="inactive">Nonaktif</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
