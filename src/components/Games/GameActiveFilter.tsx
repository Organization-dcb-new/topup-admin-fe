import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type GameActiveFilterValue = 'all' | 'active' | 'inactive'

type Props = {
  value: GameActiveFilterValue
  onChange: (value: GameActiveFilterValue) => void
}

export function GameActiveFilter({ value, onChange }: Props) {
  return (
    <div className="grid min-w-0 gap-1.5 sm:w-[11rem]">
      <Label htmlFor="game-active-filter" className="text-xs text-muted-foreground">
        Status
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as GameActiveFilterValue)}>
        <SelectTrigger id="game-active-filter" className="w-full min-w-0" size="sm">
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
