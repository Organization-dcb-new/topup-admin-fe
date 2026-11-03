import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Check, Copy, Eye, EyeOff, Gamepad2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { useToggleGameShow, useToggleGameStatus } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'
import { gameChipClass } from './game-utils'

/** Game artwork with a neutral fallback when the URL is missing or broken. */
export function GameThumb({ src, className, iconClassName }: { src?: string | null; className?: string; iconClassName?: string }) {
  // Keyed on the URL, so a replaced image gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const url = src?.trim()

  if (!url || failedSrc === url) {
    return (
      <span className={cn('grid place-items-center bg-slate-100 text-slate-300', className)} aria-hidden>
        <Gamepad2 className={cn('size-5', iconClassName)} />
      </span>
    )
  }
  return <img src={url} alt='' loading='lazy' onError={() => setFailedSrc(url)} className={cn('object-cover', className)} />
}

interface GameStatusChipsProps {
  game: Pick<Game, 'is_active' | 'is_show' | 'is_featured' | 'is_check_id'>
  /** Leave out the active/shown chips, e.g. where switches already show them. */
  flagsOnly?: boolean
  className?: string
}

/** Active / visibility / featured / ID-check state as small chips. */
export function GameStatusChips({ game, flagsOnly, className }: GameStatusChipsProps) {
  const { t } = useTranslation('common')
  if (flagsOnly && !game.is_featured && !game.is_check_id) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {!flagsOnly && (
        <>
          <span className={cn(gameChipClass, game.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
            <span className={cn('size-1.5 rounded-full', game.is_active ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden />
            {game.is_active ? t('gamePage.status.active') : t('gamePage.status.inactive')}
          </span>
          <span className={cn(gameChipClass, game.is_show ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-slate-500')}>
            {game.is_show ? <Eye className='size-3' aria-hidden /> : <EyeOff className='size-3' aria-hidden />}
            {game.is_show ? t('gamePage.status.shown') : t('gamePage.status.hidden')}
          </span>
        </>
      )}
      {game.is_featured && (
        <span className={cn(gameChipClass, 'bg-amber-50 text-amber-700')}>
          <Star className='size-3' aria-hidden />
          {t('gamePage.status.featured')}
        </span>
      )}
      {game.is_check_id && (
        <span className={cn(gameChipClass, 'bg-brand-purple/10 text-brand-purple')}>
          <BadgeCheck className='size-3' aria-hidden />
          {t('gamePage.status.checkId')}
        </span>
      )}
    </div>
  )
}

/**
 * The two switches admins flip most: whether the game takes orders (active) and whether it is
 * listed on the storefront (shown). Read-only admins see nothing here; the chips carry the state.
 */
export function GameToggles({ game, className }: { game: Pick<Game, 'id' | 'name' | 'is_active' | 'is_show'>; className?: string }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const status = useToggleGameStatus(game.id)
  const show = useToggleGameShow(game.id)

  if (!can(PERM.gameUpdate)) return null

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <label className='flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500'>
        {t('gamePage.toggle.active')}
        <Switch
          checked={game.is_active}
          disabled={status.isPending}
          onCheckedChange={(checked) => status.mutate(checked)}
          aria-label={t('gamePage.toggle.activeAria', { name: game.name })}
          className='data-[state=checked]:bg-emerald-500'
        />
      </label>
      <label className='flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500'>
        {t('gamePage.toggle.shown')}
        <Switch
          checked={game.is_show}
          disabled={show.isPending}
          onCheckedChange={(checked) => show.mutate(checked)}
          aria-label={t('gamePage.toggle.shownAria', { name: game.name })}
          className='data-[state=checked]:bg-brand-cyan'
        />
      </label>
    </div>
  )
}

export function CopyValueButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('gameDetailPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('gameDetailPage.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label={label}
      title={label}
      className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
    >
      {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
    </button>
  )
}
