import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, Loader2 } from 'lucide-react'

import { FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudLabelClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import type { GameNames } from '@/hooks/useGame'
import { useChangeProductImageByGame, useGetProducts, useProductsByGame } from '@/hooks/useProduct'
import { cn } from '@/lib/utils'
import { GamePicker } from './GamePicker'
import { useRetained } from '@/hooks/useRetained'

export interface GameImageTarget {
  /** Preselected game, e.g. when opened from a product row. */
  game?: { id: string; name: string }
}

interface GameImageDialogProps {
  target: GameImageTarget | null
  onOpenChange: (open: boolean) => void
  games: GameNames[]
  /** Without the game list (no game.view), only the preselected game can be used. */
  canPickGame: boolean
}

export function GameImageDialog({ target, onOpenChange, games, canPickGame }: GameImageDialogProps) {
  // Keep showing the last target while the dialog animates closed.
  const shown = useRetained(target)
  const change = useChangeProductImageByGame(() => onOpenChange(false))

  return (
    <Dialog open={!!target} onOpenChange={(next) => !change.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && (
          <GameImageForm
            key={shown.game?.id ?? 'new'}
            initialGame={shown.game}
            games={games}
            canPickGame={canPickGame}
            pending={change.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(gameId, image) => change.mutate({ game_id: gameId, image })}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface GameImageFormProps {
  initialGame?: { id: string; name: string }
  games: GameNames[]
  canPickGame: boolean
  pending: boolean
  onCancel: () => void
  onSave: (gameId: string, image: string) => void
}

function GameImageForm({ initialGame, games, canPickGame, pending, onCancel, onSave }: GameImageFormProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const [gameId, setGameId] = useState(initialGame?.id ?? '')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { data: products, isLoading } = useProductsByGame(gameId, !!gameId)
  const gameName = games.find((g) => g.id === gameId)?.name ?? initialGame?.name
  // The by-game listing has no images; the admin list does, but only filters by game name (substring),
  // so keep just this game's rows.
  const { data: named } = useGetProducts(1, 20, { search: '', sku: '', game_name: gameName ?? '' }, !!gameId && !!gameName)
  const currentImage = named?.data?.find((p) => p.game_id === gameId && p.image)?.image

  const submit = () => {
    setSubmitted(true)
    if (!gameId || !image || uploading) return
    onSave(gameId, image)
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className='space-y-6 p-6 sm:p-7'
    >
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <ImagePlus className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('productsPage.gameImage.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('productsPage.gameImage.title')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('productsPage.gameImage.description')}</DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor={`${ids}-game`} className={hudLabelClass}>{t('productsPage.gameImage.game')}</label>
        {canPickGame ? (
          <GamePicker
            id={`${ids}-game`}
            games={games}
            value={gameId}
            by='id'
            onChange={(game) => setGameId(game?.id ?? '')}
            placeholder={t('productsPage.gameImage.gamePlaceholder')}
            invalid={submitted && !gameId}
          />
        ) : (
          <p id={`${ids}-game`} className='flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700'>
            {gameName ?? '—'}
          </p>
        )}
        {submitted && !gameId ? (
          <FieldMessage tone='error'>{t('productsPage.gameImage.errors.game')}</FieldMessage>
        ) : (
          gameId && (
            <p className='text-xs text-slate-500'>
              {isLoading ? t('productsPage.gameImage.counting') : t('productsPage.gameImage.affects', { count: products?.length ?? 0 })}
            </p>
          )
        )}
      </div>

      <div className='grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem]'>
        <div className='space-y-2'>
          <p id={`${ids}-image`} className={hudLabelClass}>{t('productsPage.gameImage.image')}</p>
          <ImageDropzone
            value={image}
            onChange={setImage}
            onUploadingChange={setUploading}
            aspectClassName='aspect-square'
            fit='contain'
            labelledBy={`${ids}-image`}
            hint={t('imageDropzone.hints.icon')}
            error={submitted && !image ? t('productsPage.gameImage.errors.image') : undefined}
          />
        </div>
        <div className='space-y-2'>
          <p className={hudLabelClass}>{t('productsPage.gameImage.current')}</p>
          <div className='grid aspect-square place-items-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50'>
            {currentImage ? (
              <img src={currentImage} alt='' className='size-full object-contain p-3' />
            ) : (
              <span className='px-3 text-center text-xs text-slate-400'>
                {gameId ? t('productsPage.gameImage.noCurrent') : t('productsPage.gameImage.pickFirst')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onCancel}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('productsPage.gameImage.cancel')}
        </button>
        <button type='submit' disabled={pending || uploading} className={cn(hudPrimaryButtonClass, 'justify-center sm:min-w-52')}>
          <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
          {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
          {pending ? t('productsPage.gameImage.saving') : t('productsPage.gameImage.save')}
        </button>
      </div>
    </form>
  )
}
