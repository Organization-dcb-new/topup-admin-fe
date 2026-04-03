import { useToggleGameStatus } from '@/hooks/useGame'
import type { Game } from '@/types/game'
import { Switch } from '../ui/switch'

interface ToggleGameStatusProps {
  game: Game
}

export default function ToggleGameStatus({ game }: ToggleGameStatusProps) {
  const toggleStatusMutation = useToggleGameStatus(game.id)

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={game.is_active}
        onCheckedChange={(v) => toggleStatusMutation.mutate(v)}
        disabled={toggleStatusMutation.isPending}
        aria-label={
          game.is_active
            ? `Nonaktifkan game ${game.name}`
            : `Aktifkan game ${game.name}`
        }
      />
      <span className="text-sm font-medium text-foreground">
        {game.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    </div>
  )
}
