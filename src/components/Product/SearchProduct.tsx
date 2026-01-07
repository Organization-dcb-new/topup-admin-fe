import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

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
    <div className="flex items-center gap-6">
      {/* Search input */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search product..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Active checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="active-only"
          checked={isActive}
          onCheckedChange={(v) => onActiveChange(Boolean(v))}
        />
        <Label htmlFor="active-only" className="text-sm font-normal cursor-pointer">
          Active only
        </Label>
      </div>
    </div>
  )
}
