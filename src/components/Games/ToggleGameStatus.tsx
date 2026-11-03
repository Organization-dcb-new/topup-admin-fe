import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { useToggleGameStatus } from '@/hooks/useGame'
import type { Game } from '@/types/game'
import { Switch } from '../ui/switch'
import { useTranslation } from 'react-i18next'

interface ToggleGameStatusProps {
  game: Game
}

export default function ToggleGameStatus({ game }: ToggleGameStatusProps) {
  const { t } = useTranslation('common')
  const toggleStatusMutation = useToggleGameStatus(game.id)

  return (
    <div className='flex items-center gap-2'>
      <Can permission={PERM.gameUpdate}>
        <Switch
          checked={game.is_active}
          onCheckedChange={(v) => toggleStatusMutation.mutate(v)}
          disabled={toggleStatusMutation.isPending}
          aria-label={
            game.is_active
              ? t('gameToggleLabels.deactivateAria', { name: game.name })
              : t('gameToggleLabels.activateAria', { name: game.name })
          }
        />
      </Can>
      <span className='text-sm font-medium text-foreground'>
        {game.is_active ? t('gameToggleLabels.active') : t('gameToggleLabels.inactive')}
      </span>
    </div>
  )
}
