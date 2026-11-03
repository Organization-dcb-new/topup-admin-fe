import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, TextCursorInput } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { InputPreview, InputTypeChip } from '@/components/Inputs/GameInputParts'
import { GameInputsDialog } from '@/components/Inputs/GameInputsDialog'
import { PERM } from '@/constants/permissions'
import type { Game } from '@/types/game'
import { DetailPanel } from './GameDetailParts'
import { editableInputs, gamePanelButtonClass } from './game-utils'

/** The fields buyers fill in at checkout (user ID, server…), roughly as the storefront draws them. */
export function GameCheckoutPanel({ game, order }: { game: Pick<Game, 'id' | 'name' | 'thumbnail_url' | 'input'>; order?: number }) {
  const { t } = useTranslation('common')
  const [editing, setEditing] = useState(false)
  const inputs = editableInputs(game)

  return (
    <>
      <DetailPanel
        icon={TextCursorInput}
        title={t('gameDetailPage.checkout.title')}
        description={t('gameDetailPage.checkout.description')}
        order={order}
        action={
          inputs.length > 0 && (
            <Can permission={PERM.gameInputUpdate}>
              <button type='button' onClick={() => setEditing(true)} className={gamePanelButtonClass}>
                <Pencil className='size-4' aria-hidden />
                {t('gameDetailPage.checkout.edit')}
              </button>
            </Can>
          )
        }
      >
        {inputs.length === 0 ? (
          <p className='text-sm text-slate-500'>{t('gameDetailPage.checkout.empty')}</p>
        ) : (
          <ul className='grid gap-3 sm:grid-cols-2'>
            {inputs.map((input) => (
              <li key={input.id} className='space-y-2.5 rounded-lg border border-slate-200 bg-white p-3'>
                <InputPreview input={input} />
                <div className='flex flex-wrap items-center gap-1.5'>
                  <InputTypeChip input={input} />
                  <span className='font-mono text-[11px] text-slate-500'>{input.key}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DetailPanel>
      <GameInputsDialog
        game={editing ? { id: game.id, game_name: game.name, image: game.thumbnail_url, inputs } : null}
        onOpenChange={(open) => !open && setEditing(false)}
      />
    </>
  )
}
