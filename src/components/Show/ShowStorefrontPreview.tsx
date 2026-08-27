import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EyeOff, Flame, Gamepad2, Sparkles, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { getEffectiveShowBadge, isShowLive, type ShowBadgeKey } from '@/lib/show-status'
import { cn } from '@/lib/utils'
import type { Show, ShowGame } from '@/types/show'

/**
 * Pratinjau etalase seperti yang dirender storefront.
 *
 * Ini bukan hiasan. Kurasi show adalah satu-satunya modul di dashboard yang
 * hasilnya tidak bisa disimpulkan dari barisnya sendiri: urutan, penanda, dan
 * ikut-tidaknya sebuah game ditentukan tiga kolom yang saling berkait, dan
 * kesalahannya baru ketahuan setelah membuka homebase publik. Panel ini
 * menyalin aturan render pakargaming-fe (chip nav berurutan `sort_order`,
 * section per show, ribbon satu badge per tile) supaya salahnya kelihatan di
 * sini, bukan di produksi.
 */

/** Jumlah tile per baris di storefront pada layar terlebar. */
const PREVIEW_GAME_LIMIT = 6

const BADGE_ICON: Record<ShowBadgeKey, typeof Star> = {
  is_popular: Star,
  is_new: Sparkles,
  is_hot: Flame,
}

/** Warna ribbon mengikuti ShowBadge di storefront: popular/new/hot. */
const BADGE_CLASS: Record<ShowBadgeKey, string> = {
  is_popular: 'bg-primary text-primary-foreground',
  is_new: 'bg-emerald-600 text-white',
  is_hot: 'bg-amber-500 text-amber-950',
}

const BADGE_LABEL_KEY: Record<ShowBadgeKey, string> = {
  is_popular: 'editShowModal.flagPopularLabel',
  is_new: 'editShowModal.flagNewLabel',
  is_hot: 'editShowModal.flagHotLabel',
}

function GameTilePreview({ game, badge }: { game: ShowGame; badge: ShowBadgeKey | null }) {
  const { t } = useTranslation('common')
  const [imageFailed, setImageFailed] = useState(false)
  const showFallback = !game.thumbnail_url || imageFailed
  const BadgeIcon = badge ? BADGE_ICON[badge] : null

  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <div className='relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/50'>
        {showFallback ? (
          <div className='flex h-full w-full items-center justify-center'>
            <Gamepad2 className='h-6 w-6 text-muted-foreground' aria-hidden />
          </div>
        ) : (
          <img
            src={game.thumbnail_url}
            alt=''
            loading='lazy'
            className='h-full w-full object-cover'
            onError={() => setImageFailed(true)}
          />
        )}

        {badge && BadgeIcon && (
          <span
            className={cn(
              'absolute left-1 top-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm',
              BADGE_CLASS[badge],
            )}
          >
            <BadgeIcon className='h-2.5 w-2.5' aria-hidden />
            {t(BADGE_LABEL_KEY[badge])}
          </span>
        )}
      </div>
      <p className='line-clamp-2 text-center text-xs font-medium text-foreground'>{game.name}</p>
    </div>
  )
}

export function ShowStorefrontPreview({ shows }: { shows: Show[] }) {
  const { t } = useTranslation('common')

  // Hanya show yang benar-benar sampai ke pengunjung, diurutkan persis seperti
  // jalur publik: sort_order menaik, seri dipecah oleh nama.
  const liveShows = useMemo(
    () =>
      shows
        .filter(isShowLive)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [shows],
  )

  if (liveShows.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center'>
        <span
          className='flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground'
          aria-hidden
        >
          <EyeOff className='h-5 w-5' />
        </span>
        <p className='text-sm font-medium text-foreground'>{t('showPreview.emptyTitle')}</p>
        <p className='max-w-sm text-xs leading-relaxed text-muted-foreground'>
          {t('showPreview.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Chip nav: storefront merendernya sticky di atas daftar section, jadi
          urutan dan nama show terbaca lebih dulu oleh pengunjung daripada isinya. */}
      <div className='flex flex-wrap gap-2' aria-label={t('showPreview.navAria')}>
        {liveShows.map((show) => (
          <span
            key={show.id}
            className='rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary'
          >
            {show.name}
          </span>
        ))}
      </div>

      <div className='space-y-5 rounded-xl border border-border bg-muted/20 p-4'>
        {liveShows.map((show) => {
          const badge = getEffectiveShowBadge(show)
          // Jalur publik hanya mengirim game yang tampil; game tersembunyi tetap
          // anggota show tapi tidak pernah dirender pengunjung.
          const visibleGames = (show.games ?? []).filter((game) => game.is_show)
          const overflow = visibleGames.length - PREVIEW_GAME_LIMIT

          return (
            <section key={show.id} className='space-y-2.5'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='h-5 w-1 shrink-0 rounded-full bg-primary' aria-hidden />
                <h4 className='text-sm font-bold text-foreground'>{show.name}</h4>
                {badge && (
                  <Badge className={cn('gap-1 border-transparent', BADGE_CLASS[badge])}>
                    {t(BADGE_LABEL_KEY[badge])}
                  </Badge>
                )}
                <span className='ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground'>
                  {t('showPreview.gamesCount', { count: visibleGames.length })}
                </span>
              </div>

              <div className='grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'>
                {visibleGames.slice(0, PREVIEW_GAME_LIMIT).map((game) => (
                  <GameTilePreview key={game.id} game={game} badge={badge} />
                ))}
              </div>

              {overflow > 0 && (
                <p className='text-center text-[11px] text-muted-foreground'>
                  {t('showPreview.moreGames', { count: overflow })}
                </p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
