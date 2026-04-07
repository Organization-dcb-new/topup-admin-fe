import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ProductInputProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function ProductsSearchInput({ search, onSearchChange }: ProductInputProps) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[14rem] sm:max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        placeholder="Cari berdasarkan game…"
        className="h-10 pl-9 shadow-sm"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Cari produk berdasarkan nama game"
      />
    </div>
  )
}
