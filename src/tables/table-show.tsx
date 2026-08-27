import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { AlertTriangle, ChevronRight, ChevronUp, ChevronDown, EyeOff, Gamepad2 } from 'lucide-react'

import type { Show, ShowGame } from '@/types/show'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ShowActionsHeader, ShowRowActions } from '@/components/Show/ShowRowActions'
import {
  getEffectiveShowBadge,
  getOverriddenShowBadges,
  getShowLiveStatus,
  type ShowBadgeKey,
} from '@/lib/show-status'
import { cn } from '@/lib/utils'

/** Kelas yang menyembunyikan kolom sekunder di layar sempit. */
const hideBelowMd = {
  headerClassName: 'hidden md:table-cell',
  cellClassName: 'hidden md:table-cell',
}
const hideBelowLg = {
  headerClassName: 'hidden lg:table-cell',
  cellClassName: 'hidden lg:table-cell',
}

const BADGE_LABEL_KEY: Record<ShowBadgeKey, string> = {
  is_popular: 'editShowModal.flagPopularLabel',
  is_new: 'editShowModal.flagNewLabel',
  is_hot: 'editShowModal.flagHotLabel',
}

export type ShowColumnOptions = {
  /**
   * Menukar posisi satu show dengan tetangganya di halaman ini. Tidak diberikan
   * berarti tombol urutan tidak dirender sama sekali — pemeriksaan izin ada di
   * halaman, yang memang memegang mutasinya, bukan di lapisan kolom ini.
   */
  onMove?: (show: Show, direction: 'up' | 'down') => void
  /**
   * Penataan ulang hanya benar ketika seluruh show muat dalam satu halaman dan
   * tidak sedang disaring: di luar itu, indeks baris tidak mencerminkan posisi
   * sebenarnya dan menyimpannya justru mengacak urutan storefront.
   */
  canReorder?: boolean
  isReordering?: boolean
  reorderDisabledHint?: string
}

export function getShowColumns(
  t: TFunction,
  { onMove, canReorder = false, isReordering = false, reorderDisabledHint }: ShowColumnOptions = {},
): ColumnDef<Show>[] {
  return [
    {
      id: 'expand',
      header: t('showTable.gameListColumn'),
      meta: { headerClassName: 'w-11', cellClassName: 'w-11' },
      cell: ({ row }) => {
        const count = row.original.games?.length ?? 0
        if (!count) {
          return <span className='text-xs text-muted-foreground'>—</span>
        }
        const expanded = row.getIsExpanded()
        return (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground'
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={expanded}
            aria-label={
              expanded
                ? t('showTable.ariaCloseGameListNamed', {
                    name: row.original.name,
                  })
                : t('showTable.ariaOpenGameListNamed', {
                    name: row.original.name,
                  })
            }
          >
            {/* Satu ikon yang dirotasi: menukar dua komponen ikon membuang
                properti yang bisa ditransisikan sehingga arah expand tidak
                pernah terasa. */}
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200 ease-out motion-reduce:transition-none',
                expanded && 'rotate-90',
              )}
              aria-hidden
            />
          </Button>
        )
      },
    },
    {
      accessorKey: 'image',
      header: t('showTable.colImage'),
      meta: { headerClassName: 'w-16', cellClassName: 'w-16' },
      cell: ({ row }) => (
        <EntityAvatar
          src={row.original.image}
          alt={t('showTable.imageAltName', { name: row.original.name })}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: t('showTable.colName'),
      cell: ({ row }) => (
        <span
          className='block max-w-56 truncate font-medium text-foreground'
          title={row.original.name}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'alias',
      header: t('showTable.colAlias'),
      meta: hideBelowMd,
      cell: ({ row }) => (
        <code
          className='inline-block max-w-40 truncate rounded bg-muted/60 px-1.5 py-0.5 align-middle font-mono text-xs text-foreground'
          title={row.original.alias}
        >
          {row.original.alias}
        </code>
      ),
    },
    {
      id: 'status',
      header: t('showTable.colStatus'),
      cell: ({ row }) => {
        const show = row.original
        const status = getShowLiveStatus(show)

        // "Tayang" saja tidak berarti tampil: jalur publik menyaring lewat INNER
        // JOIN ke game yang is_show=true, jadi show tanpa satu pun game tampil
        // hilang dari storefront tanpa galat apa pun. Sebabnya ditulis di baris,
        // bukan disembunyikan di dalam popover.
        if (status === 'noVisibleGames') {
          return (
            <div className='min-w-0 space-y-0.5'>
              <Badge
                variant='outline'
                className='gap-1 border-amber-500/50 text-amber-700 dark:text-amber-400'
              >
                <AlertTriangle className='h-3 w-3 shrink-0' aria-hidden />
                {t('showTable.statusNoGames')}
              </Badge>
              <p className='text-[11px] leading-tight text-muted-foreground'>
                {t('showTable.statusNoGamesHint')}
              </p>
            </div>
          )
        }

        if (status === 'hidden') {
          return (
            <Badge
              variant='outline'
              className='gap-1 border-border font-medium text-muted-foreground'
            >
              <EyeOff className='h-3 w-3 shrink-0' aria-hidden />
              {t('showTable.flagHidden')}
            </Badge>
          )
        }

        return (
          <Badge variant='success' className='gap-1 font-medium'>
            <span className='h-1.5 w-1.5 rounded-full bg-white/90' aria-hidden />
            {t('showTable.statusLive')}
          </Badge>
        )
      },
    },
    {
      id: 'badge',
      header: t('showTable.colBadge'),
      meta: hideBelowLg,
      cell: ({ row }) => {
        const show = row.original
        const effective = getEffectiveShowBadge(show)
        const overridden = getOverriddenShowBadges(show)

        if (!effective) {
          return <span className='text-xs text-muted-foreground'>—</span>
        }

        return (
          <div className='min-w-0 space-y-0.5'>
            <Badge variant='secondary' className='font-medium'>
              {t(BADGE_LABEL_KEY[effective])}
            </Badge>
            {/* Storefront hanya merender satu badge (popular > new > hot).
                Centang yang kalah tetap tersimpan tapi tidak pernah terlihat
                pengunjung — admin berhak tahu itu, bukan menyangkanya tampil. */}
            {overridden.length > 0 && (
              <p className='text-[11px] leading-tight text-muted-foreground'>
                {t('showTable.badgeOverridden', {
                  labels: overridden.map((key) => t(BADGE_LABEL_KEY[key])).join(', '),
                })}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'sort_order',
      header: t('showTable.colSortOrder'),
      meta: hideBelowLg,
      cell: ({ row, table }) => {
        const show = row.original
        const rows = table.getRowModel().rows
        const isFirst = row.index === 0
        const isLast = row.index === rows.length - 1

        return (
          <div className='flex items-center gap-1'>
            <span className='min-w-6 text-sm tabular-nums text-muted-foreground'>
              {show.sort_order}
            </span>
            {onMove && (
              <span
                className='inline-flex flex-col'
                title={canReorder ? undefined : reorderDisabledHint}
              >
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-5 w-6 text-muted-foreground hover:text-foreground'
                  disabled={!canReorder || isReordering || isFirst}
                  onClick={() => onMove(show, 'up')}
                  aria-label={t('showTable.ariaMoveUp', { name: show.name })}
                >
                  <ChevronUp className='h-3.5 w-3.5' aria-hidden />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-5 w-6 text-muted-foreground hover:text-foreground'
                  disabled={!canReorder || isReordering || isLast}
                  onClick={() => onMove(show, 'down')}
                  aria-label={t('showTable.ariaMoveDown', { name: show.name })}
                >
                  <ChevronDown className='h-3.5 w-3.5' aria-hidden />
                </Button>
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'games',
      header: t('showTable.colGameCount'),
      cell: ({ row }) => {
        const games: ShowGame[] = row.original.games ?? []
        const n = games.length
        if (n === 0) {
          return (
            <Badge
              variant='outline'
              className='border-border font-medium tabular-nums text-muted-foreground'
            >
              0
            </Badge>
          )
        }
        const visible = row.original.visible_game_count
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                asChild
                variant='secondary'
                className='cursor-pointer font-medium tabular-nums hover:bg-secondary/80'
              >
                <button
                  type='button'
                  aria-label={t('showTable.ariaGameCount', {
                    name: row.original.name,
                    total: n,
                  })}
                >
                  {n}
                </button>
              </Badge>
            </PopoverTrigger>
            <PopoverContent side='top' align='center' className='w-64 p-3'>
              <p className='mb-2 flex items-center gap-1.5 border-b border-border pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                <Gamepad2 className='h-3.5 w-3.5 shrink-0' aria-hidden />
                {t('showTable.connectedGames', { count: n })}
              </p>
              <div className='custom-scrollbar max-h-48 space-y-1 overflow-y-auto pr-1'>
                {games.map((g) => (
                  <div
                    key={g.id}
                    className='flex items-center justify-between gap-2 rounded-md px-1.5 py-1 hover:bg-muted/60'
                  >
                    <span className='truncate text-xs font-medium text-foreground' title={g.name}>
                      {g.name}
                    </span>
                    {/* Game yang disembunyikan tetap anggota show tapi tidak
                        tampil di storefront — bedanya harus terlihat di sini. */}
                    {!g.is_show && (
                      <Badge
                        variant='outline'
                        className='border-border text-[10px] font-medium text-muted-foreground'
                      >
                        {t('showTable.flagHidden')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className='mt-2 border-t border-border pt-1.5 text-[11px] text-muted-foreground'>
                {t('showTable.visibleGamesHint', { visible, total: n })}
              </p>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      id: 'actions',
      header: () => <ShowActionsHeader />,
      cell: ({ row }) => <ShowRowActions show={row.original} />,
    },
  ]
}
