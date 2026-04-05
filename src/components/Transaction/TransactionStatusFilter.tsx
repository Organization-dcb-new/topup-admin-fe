import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Payment } from '@/types/transaction'
import { FilterX, ListFilter } from 'lucide-react'

const ALL = '__all__'

const OPTIONS: { value: Payment['status']; label: string }[] = [
  { value: 'PAID', label: 'Lunas' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'FAILED', label: 'Gagal' },
  { value: 'EXPIRED', label: 'Kadaluarsa' },
]

interface TransactionStatusFilterProps {
  value: '' | Payment['status']
  onChange: (status: '' | Payment['status']) => void
}

export default function TransactionStatusFilter({ value, onChange }: TransactionStatusFilterProps) {
  const selectValue = value === '' ? ALL : value

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <div className="min-w-0 flex-1">
        <Select
          value={selectValue}
          onValueChange={(v) => onChange(v === ALL ? '' : (v as Payment['status']))}
        >
          <SelectTrigger
            className="h-10 w-full min-w-0 font-normal shadow-xs"
            aria-label="Filter status pembayaran"
          >
            <ListFilter className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua status</SelectItem>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>
      {value !== '' && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onChange('')}
          aria-label="Hapus filter status"
        >
          <FilterX className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  )
}
