import { useToggleGameShow } from '@/hooks/useGame'
import type { Game } from '@/types/game'
import { Switch } from '../ui/switch'
import EditGameModal from './EditGameModal'
import { DeleteGameModal } from './DeleteGameModal'
import UpdateBulkProductPriceModal from './EditBulkPriceModal'
import type { Product } from '@/types/product'

export function GameTableActions({ game, product }: { game: Game; product: Product[] }) {
  const toggleMutation = useToggleGameShow(game.id)

  return (
    <div className="flex items-center gap-1">
      <Switch
        checked={game.is_show}
        onCheckedChange={(v) => toggleMutation.mutate(v)}
        disabled={toggleMutation.isPending}
      />

      {/* Edit */}
      <EditGameModal game={game} />
      <DeleteGameModal id={game.id} />
      <UpdateBulkProductPriceModal product={product} gameId={game.id} />
    </div>
  )
}
