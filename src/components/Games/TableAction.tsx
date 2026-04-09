import { useToggleGameShow } from '@/hooks/useGame'
import type { Game } from '@/types/game'
import { Switch } from '../ui/switch'
import EditGameModal from './EditGameModal'
import UpdateBulkProductPriceModal from './EditBulkPriceModal'
import { useTranslation } from 'react-i18next'

export function GameTableActions({ game }: { game: Game }) {
  const { t } = useTranslation('common')
  const toggleMutation = useToggleGameShow(game.id)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2">
      <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted/35 px-2.5 py-1.5">
        <span className="hidden max-w-[4.5rem] truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
          {t('gameShowcase.label')}
        </span>
        <Switch
          checked={game.is_show}
          onCheckedChange={(v) => toggleMutation.mutate(v)}
          disabled={toggleMutation.isPending}
          aria-label={
            game.is_show
              ? t('gameShowcase.hideAria', { name: game.name })
              : t('gameShowcase.showAria', { name: game.name })
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <EditGameModal game={game} />
        {/* <DeleteGameModal id={game.id} /> */}
        <UpdateBulkProductPriceModal key={game.id} gameId={game.id} />
      </div>
    </div>
  )
}
