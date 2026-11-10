import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, TextCursorInput, TriangleAlert } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { InputPreview, InputTypeChip } from '@/components/Inputs/GameInputParts'
import { GameInputsDialog } from '@/components/Inputs/GameInputsDialog'
import { PERM } from '@/constants/permissions'
import type { Game } from '@/types/game'
import { DetailPanel } from './GameDetailParts'
import { editableInputs, gamePanelButtonClass } from './game-utils'

type CheckoutGame = Pick<Game, 'id' | 'name' | 'thumbnail_url' | 'input' | 'variant' | 'missing_inputs' | 'supplier_brand_code'>

/**
 * The fields buyers fill in at checkout (user ID, server…), roughly as the storefront draws them,
 * and the ones the LapakGaming category asks for that the game still lacks.
 */
export function GameCheckoutPanel({ game, order }: { game: CheckoutGame; order?: number }) {
  const { t } = useTranslation('common')
  const [editing, setEditing] = useState(false)
  const inputs = editableInputs(game)
  const missing = game.missing_inputs ?? []

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
        {missing.length > 0 && (
          <div role='alert' className='mb-4 flex gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700'>
            <TriangleAlert className='mt-0.5 size-4 shrink-0' aria-hidden />
            <p>
              {t('gameDetailPage.checkout.missing', {
                code: game.supplier_brand_code,
                fields: missing.join(', '),
                count: missing.length,
              })}
            </p>
          </div>
        )}
        {inputs.length === 0 ? (
          <p className='text-sm text-slate-500'>
            {game.variant === 'VOUCHER' ? t('gameDetailPage.checkout.emptyVoucher') : t('gameDetailPage.checkout.empty')}
          </p>
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
