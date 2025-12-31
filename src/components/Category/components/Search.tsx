import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface CategoriesInputProps {
  value: string
  onChange: (value: string) => void
}

export default function CategoriesSearchInput({ value, onChange }: CategoriesInputProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Search input */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Categories..."
          className="pl-9"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
