import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface ProductInputProps {
  search: string
  isActive: boolean
  onSearchChange: (value: string) => void
  onActiveChange: (value: boolean) => void
}

export default function ProductsSearchInput({
  search,
  isActive,
  onSearchChange,
  onActiveChange,
}: ProductInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[11rem] max-w-xs flex-1 sm:flex-initial sm:min-w-[14rem] sm:max-w-sm">
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

      <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 shadow-sm">
        <Checkbox
          id="active-only"
          checked={isActive}
          onCheckedChange={(v) => onActiveChange(Boolean(v))}
        />
        <Label
          htmlFor="active-only"
          className="cursor-pointer text-sm font-normal leading-snug text-foreground"
        >
          Hanya produk aktif
        </Label>
      </div>
    </div>
  )
}
