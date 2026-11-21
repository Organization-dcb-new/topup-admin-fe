import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Check, CircleCheck, Copy, EyeOff, Gamepad2, Globe, Ticket, Wrench, type LucideIcon } from 'lucide-react'
import toast from 'react-hot-toast'

import { Segmented } from '@/components/ui/segmented'
import { PERM } from '@/constants/permissions'
import { useSetGameStatus } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { HOME_REGION, regionName } from '@/lib/regions'
import { cn } from '@/lib/utils'
import { GAME_STATUSES, type Game, type GameStatus } from '@/types/game'
import { gameChipClass, gameStatus } from './game-utils'

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

type GameStatusFields = Pick<Game, 'is_active' | 'is_show' | 'is_check_id' | 'variant' | 'region'> & { status?: GameStatus }

interface GameStatusChipsProps {
  game: GameStatusFields
  /** Leave out the status chip, e.g. where the status control already shows it. */
  flagsOnly?: boolean
  className?: string
}

const STATUS_CHIP: Record<GameStatus, { className: string; icon: LucideIcon }> = {
  ACTIVE: { className: 'bg-emerald-50 text-emerald-700', icon: CircleCheck },
  MAINTENANCE: { className: 'bg-amber-50 text-amber-700', icon: Wrench },
  HIDDEN: { className: 'bg-slate-100 text-slate-500', icon: EyeOff },
}

/**
 * The game's status and its flags as small chips: ID check, a voucher game, and the country of a
 * game sold outside Indonesia.
 */
export function GameStatusChips({ game, flagsOnly, className }: GameStatusChipsProps) {
  const { t, i18n } = useTranslation('common')
  const status = gameStatus(game)
  const voucher = game.variant === 'VOUCHER'
  const region = game.region && game.region !== HOME_REGION ? game.region : null
  if (flagsOnly && !game.is_check_id && !voucher && !region) return null
  const chip = STATUS_CHIP[status]
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {!flagsOnly && (
        <span className={cn(gameChipClass, chip.className)} title={t(`gamePage.statusHint.${status}`)}>
          <chip.icon className='size-3' aria-hidden />
          {t(`gamePage.status.${status}`)}
        </span>
      )}
      {game.is_check_id && (
        <span className={cn(gameChipClass, 'bg-brand-purple/10 text-brand-purple')}>
          <BadgeCheck className='size-3' aria-hidden />
          {t('gamePage.status.checkId')}
        </span>
      )}
      {voucher && (
        <span className={cn(gameChipClass, 'bg-cyan-50 text-cyan-700')} title={t('gamePage.variantHint.VOUCHER')}>
          <Ticket className='size-3' aria-hidden />
          {t('gamePage.variant.VOUCHER')}
        </span>
      )}
      {region && (
        <span className={cn(gameChipClass, 'bg-slate-100 text-slate-600')} title={regionName(region, i18n.resolvedLanguage)}>
          <Globe className='size-3' aria-hidden />
          {region.toUpperCase()}
        </span>
      )}
    </div>
  )
}

/**
 * The status admins change most: sold, listed but paused, or off the storefront. Admins who
 * can't edit games see nothing here; the status chip carries it.
 */
export function GameStatusControl({ game, className }: { game: Pick<Game, 'id' | 'name'> & GameStatusFields; className?: string }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const setStatus = useSetGameStatus(game.id)
  const status = gameStatus(game)

  if (!can(PERM.gameUpdate)) return null

  return (
    <div className={cn('flex items-center', setStatus.isPending && 'pointer-events-none opacity-60', className)} aria-busy={setStatus.isPending}>
      <Segmented
        value={status}
        onChange={(next) => next !== status && setStatus.mutate(next)}
        label={t('gamePage.statusControl', { name: game.name })}
        options={GAME_STATUSES.map((s) => ({ value: s, label: t(`gamePage.status.${s}`) }))}
      />
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
