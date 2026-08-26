import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { ChevronRight, Gamepad2 } from 'lucide-react'

import type { Show, ShowGame } from '@/types/show'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ShowActionsHeader, ShowRowActions } from '@/components/Show/ShowRowActions'
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

export function getShowColumns(t: TFunction): ColumnDef<Show>[] {
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
                ? t('showTable.ariaCloseGameListNamed', { name: row.original.name })
                : t('showTable.ariaOpenGameListNamed', { name: row.original.name })
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
      id: 'flags',
      header: t('showTable.colFlags'),
      cell: ({ row }) => {
        const show = row.original
        // Hanya penanda yang menyala yang dirender, supaya baris tanpa penanda
        // tidak penuh chip abu-abu yang tidak berarti apa-apa.
        const chips = [
          show.is_hot && t('editShowModal.flagHotLabel'),
          show.is_new && t('editShowModal.flagNewLabel'),
          show.is_popular && t('editShowModal.flagPopularLabel'),
        ].filter((label): label is string => typeof label === 'string')

        return (
          <div className='flex flex-wrap items-center gap-1'>
            {show.is_show ? (
              <Badge variant='success' className='font-medium'>
                {t('showTable.flagShow')}
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='border-border font-medium text-muted-foreground'
              >
                {t('showTable.flagHidden')}
              </Badge>
            )}
            {chips.map((label) => (
              <Badge key={label} variant='secondary' className='font-medium'>
                {label}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'sort_order',
      header: t('showTable.colSortOrder'),
      meta: hideBelowLg,
      cell: ({ row }) => (
        <span className='text-sm tabular-nums text-muted-foreground'>
          {row.original.sort_order}
        </span>
      ),
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
                    <span
                      className='truncate text-xs font-medium text-foreground'
                      title={g.name}
                    >
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
