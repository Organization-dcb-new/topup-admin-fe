import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageIcon, Pencil } from 'lucide-react'

import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'
import { GameStatusChips, GameThumb, GameToggles } from './GameParts'
import { gamePanelButtonClass } from './game-utils'

interface GameDetailHeroProps {
  game: Game
  onEdit: () => void
  onImages: () => void
}

/** Banner, artwork, name and the switches admins reach for first. */
export function GameDetailHero({ game, onEdit, onImages }: GameDetailHeroProps) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const canUpdate = can(PERM.gameUpdate)

  return (
    <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud'>
      <div className='overflow-hidden bg-white hud-clip'>
        <GameBanner src={game.banner_url} />
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />

        <div className='px-5 pb-5 sm:px-7 sm:pb-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
            <span className='relative -mt-12 block size-24 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg ring-4 ring-white sm:-mt-14 sm:size-28'>
              <GameThumb src={game.thumbnail_url} className='size-full' iconClassName='size-8' />
            </span>
            <div className='min-w-0 flex-1 space-y-1.5 sm:pt-4'>
              <p className={hudEyebrowClass}>
                {game.category?.name ? t('gameDetailPage.eyebrowCategory', { category: game.category.name }) : t('gameDetailPage.eyebrow')}
              </p>
              <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl'>{game.name}</h1>
              <p className='truncate text-xs text-slate-500'>
                <span className='font-mono'>{game.code}</span>
                <span> · /{game.slug}</span>
              </p>
            </div>
            {canUpdate && (
              <div className='flex shrink-0 flex-wrap items-center gap-2 sm:pt-4'>
                <button type='button' onClick={onImages} className={gamePanelButtonClass}>
                  <ImageIcon className='size-4' aria-hidden />
                  {t('gameDetailPage.images')}
                </button>
                <button type='button' onClick={onEdit} className={cn(hudPrimaryButtonClass, 'h-9 px-4 text-[11px]')}>
                  <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                  <Pencil className='size-4' aria-hidden />
                  {t('gameDetailPage.edit')}
                </button>
              </div>
            )}
          </div>

          <div className='mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between empty:hidden'>
            <GameStatusChips game={game} flagsOnly={canUpdate} />
            <GameToggles game={game} />
          </div>
        </div>
      </div>
    </section>
  )
}

function GameBanner({ src }: { src?: string | null }) {
  // Keyed on the URL, so a replaced banner gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const url = src?.trim()
  const show = !!url && failedSrc !== url

  return (
    <div className='relative aspect-[21/9] w-full overflow-hidden bg-brand-purple-deep sm:aspect-auto sm:h-56'>
      {show ? (
        <img src={url} alt='' onError={() => setFailedSrc(url)} className='absolute inset-0 size-full object-cover animate-in fade-in duration-700' />
      ) : (
        <div className='absolute inset-0 bg-linear-to-br from-brand-purple via-brand-purple-deep to-brand-cyan' aria-hidden>
          <div className='absolute inset-0 text-white/20 hud-halftone [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]' />
        </div>
      )}
      <div className='absolute inset-0 bg-linear-to-t from-slate-950/35 to-transparent' aria-hidden />
    </div>
  )
}
