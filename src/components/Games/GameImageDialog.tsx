import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageIcon, Trash2 } from 'lucide-react'

import { AuthSubmitButton } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { useUpdateGameImage } from '@/hooks/useGame'
import type { Game } from '@/types/game'
import { useRetained } from './useRetained'

type ImageGame = Pick<Game, 'id' | 'name' | 'thumbnail_url' | 'banner_url'>

interface GameImageDialogProps {
  game: ImageGame | null
  onOpenChange: (open: boolean) => void
}

export function GameImageDialog({ game, onOpenChange }: GameImageDialogProps) {
  const shown = useRetained(game)
  return (
    <Dialog open={!!game} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && <GameImageForm key={shown.id} game={shown} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function GameImageForm({ game, onDone }: { game: ImageGame; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const save = useUpdateGameImage(onDone)
  const [thumbnail, setThumbnail] = useState(game.thumbnail_url ?? '')
  const [banner, setBanner] = useState(game.banner_url ?? '')
  // Remounting the dropzone drops its local preview after the banner is removed.
  const [bannerKey, setBannerKey] = useState(0)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const unchanged = thumbnail === (game.thumbnail_url ?? '') && banner === (game.banner_url ?? '')

  const submit = () => {
    setSubmitted(true)
    if (!thumbnail) return
    if (unchanged) return onDone()
    // The endpoint writes both images as sent, so the untouched one is resent as-is.
    save.mutate({ game_id: game.id, thumbnail_url: thumbnail, banner_url: banner })
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
          <ImageIcon className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('gameImageModal.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('gameImageModal.title', { name: game.name })}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('gameImageModal.description')}</DialogDescription>
        </div>
      </div>

      <div className='grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]'>
        <div className='space-y-2'>
          <p id={`${ids}-thumb`} className={hudLabelClass}>{t('gameImageModal.thumbnailLabel')}</p>
          <ImageDropzone
            value={thumbnail}
            onChange={setThumbnail}
            onUploadingChange={setUploadingThumb}
            aspectClassName='aspect-square'
            labelledBy={`${ids}-thumb`}
            hint={t('gameImageModal.thumbnailHint')}
            error={submitted && !thumbnail ? t('gameImageModal.thumbnailRequired') : undefined}
          />
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <p id={`${ids}-banner`} className={hudLabelClass}>{t('gameImageModal.bannerLabel')}</p>
            {banner && !uploadingBanner && (
              <button
                type='button'
                onClick={() => {
                  setBanner('')
                  setBannerKey((k) => k + 1)
                }}
                className='inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-rose-600'
              >
                <Trash2 className='size-3.5' aria-hidden />
                {t('gameImageModal.removeBanner')}
              </button>
            )}
          </div>
          <ImageDropzone
            key={bannerKey}
            value={banner}
            onChange={setBanner}
            onUploadingChange={setUploadingBanner}
            aspectClassName='aspect-[21/9]'
            labelledBy={`${ids}-banner`}
            hint={t('gameImageModal.bannerHint')}
          />
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={save.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('gameImageModal.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton
            pending={save.isPending}
            pendingLabel={t('gameImageModal.saving')}
            cooldown={0}
            disabled={uploadingThumb || uploadingBanner}
          >
            {t('gameImageModal.save')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
