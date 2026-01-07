import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TransactionInputProps {
  value: string
  onChange: (value: string) => void
}

export default function TransactionSearchInput({ value, onChange }: TransactionInputProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Transactions..."
          className="pl-9"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
