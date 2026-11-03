import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Info, Pencil } from 'lucide-react'

import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'
import { DetailPanel, DetailRow } from './GameDetailParts'
import { CopyValueButton } from './GameParts'
import { gamePanelButtonClass } from './game-utils'

const DATE_PATTERN = 'dd MMM yyyy, HH:mm'

/** Identifiers and bookkeeping: what support staff look up and copy. */
export function GameOverviewPanel({ game, order }: { game: Game; order?: number }) {
  const { t } = useTranslation('common')

  return (
    <DetailPanel icon={Info} title={t('gameDetailPage.overview.title')} order={order}>
      <dl className='divide-y divide-slate-100'>
        <DetailRow label={t('gameDetailPage.overview.id')}>
          <span className='min-w-0 truncate font-mono text-xs text-slate-600' title={game.id}>{game.id}</span>
          <CopyValueButton value={game.id} label={t('gameDetailPage.overview.copyId')} />
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.code')}>
          <span className='min-w-0 truncate font-mono text-xs'>{game.code}</span>
          <CopyValueButton value={game.code} label={t('gameDetailPage.overview.copyCode')} />
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.slug')}>
          <span className='min-w-0 truncate'>/{game.slug}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.category')}>
          <span className='min-w-0 truncate'>{game.category?.name || '—'}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.popularity')}>
          <span className='tabular-nums'>{formatNumber(game.popularity_score)}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.developer')}>
          <span className='min-w-0 truncate'>{game.developer || '—'}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.publisher')}>
          <span className='min-w-0 truncate'>{game.publisher || '—'}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.created')}>
          <span className='tabular-nums'>{formatBackendDateTime(game.created_at, DATE_PATTERN)}</span>
        </DetailRow>
        <DetailRow label={t('gameDetailPage.overview.updated')}>
          <span className='tabular-nums'>{formatBackendDateTime(game.updated_at, DATE_PATTERN)}</span>
        </DetailRow>
      </dl>
    </DetailPanel>
  )
}

interface GameAboutPanelProps {
  game: Pick<Game, 'description' | 'instruction'>
  /** Left out for admins who can't edit the game. */
  onEdit?: () => void
  order?: number
}

/** The storefront copy: the description and the how-to-top-up instructions. */
export function GameAboutPanel({ game, onEdit, order }: GameAboutPanelProps) {
  const { t } = useTranslation('common')
  const description = game.description?.trim()
  const instruction = game.instruction?.trim()

  return (
    <DetailPanel
      icon={FileText}
      title={t('gameDetailPage.about.title')}
      description={t('gameDetailPage.about.description')}
      order={order}
      action={
        onEdit && (
          <button type='button' onClick={onEdit} className={gamePanelButtonClass}>
            <Pencil className='size-4' aria-hidden />
            {t('gameDetailPage.about.edit')}
          </button>
        )
      }
    >
      {description || instruction ? (
        <div className='space-y-5'>
          <TextBlock label={t('gameDetailPage.about.descriptionLabel')} text={description} />
          <TextBlock label={t('gameDetailPage.about.instructionLabel')} text={instruction} />
        </div>
      ) : (
        <p className='text-sm text-slate-500'>{t('gameDetailPage.about.empty')}</p>
      )}
    </DetailPanel>
  )
}

const LONG_TEXT = 320

function TextBlock({ label, text }: { label: string; text?: string }) {
  const { t } = useTranslation('common')
  const [expanded, setExpanded] = useState(false)
  const long = (text?.length ?? 0) > LONG_TEXT

  return (
    <div className='space-y-1.5'>
      <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
      {text ? (
        <>
          <p className={cn('whitespace-pre-line text-sm leading-relaxed text-slate-700', long && !expanded && 'line-clamp-5')}>{text}</p>
          {long && (
            <button
              type='button'
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className='text-xs font-semibold text-brand-purple transition-colors hover:text-brand-purple-deep'
            >
              {expanded ? t('gameDetailPage.about.showLess') : t('gameDetailPage.about.showMore')}
            </button>
          )}
        </>
      ) : (
        <p className='text-sm italic text-slate-400'>{t('gameDetailPage.about.notSet')}</p>
      )}
    </div>
  )
}
