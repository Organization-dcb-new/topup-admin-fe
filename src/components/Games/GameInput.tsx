import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search } from 'lucide-react'

interface GameInputProps {
  value: string
  onChange: (value: string) => void
  noImageOnly: boolean
  onToggleNoImage: (value: boolean) => void
}

export default function GameSearchInput({
  value,
  onChange,
  noImageOnly,
  onToggleNoImage,
}: GameInputProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Search input */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search game..."
          className="pl-9"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* Checkbox No Image */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={noImageOnly} onCheckedChange={(val) => onToggleNoImage(!!val)} />
        <span className="text-sm text-muted-foreground">Without Image</span>
      </label>
    </div>
  )
}
