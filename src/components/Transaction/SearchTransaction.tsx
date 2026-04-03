import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TransactionInputProps {
  value: string
  onChange: (value: string) => void
}

export default function TransactionSearchInput({ value, onChange }: TransactionInputProps) {
  return (
    <div className="relative w-full min-w-[12rem] max-w-md shrink-0">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Cari transaksi"
        className="h-10 pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Cari transaksi"
      />
    </div>
  )
}
