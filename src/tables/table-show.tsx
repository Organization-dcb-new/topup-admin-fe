import type { ColumnDef } from '@tanstack/react-table'
import type { Show } from '@/types/show'
import type { TFunction } from 'i18next'
import { ChevronDown, ChevronRight, Eye, EyeOff, Gamepad2, ImageOff } from 'lucide-react'
import { ShowActionsHeader, ShowRowActions } from '@/components/Show/ShowRowActions'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const FLAGS = [
  { key: 'is_hot', labelKey: 'showTable.flagHot', accent: 'bg-[#ff9d3d]' },
  { key: 'is_new', labelKey: 'showTable.flagNew', accent: 'bg-[#c9f24d]' },
  { key: 'is_popular', labelKey: 'showTable.flagPopular', accent: 'bg-[#ff9ed2]' },
] as const

export function getShowColumns(t: TFunction): ColumnDef<Show>[] {
  return [
    {
      id: 'expand',
      header: () => (
        <span className='block min-w-[2.75rem]'>{t('showTable.gameListColumn')}</span>
      ),
      cell: ({ row }) => {
        const count = row.original.games?.length ?? 0
        if (!count) {
          return <span className='font-black text-[#111]/70'>—</span>
        }
        return (
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-press-sm flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center bg-[#ffd84d]'
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={
              row.getIsExpanded()
                ? t('showTable.ariaCloseGameList')
                : t('showTable.ariaOpenGameList')
            }
          >
            {row.getIsExpanded() ? (
              <ChevronDown className='h-4 w-4' strokeWidth={3} aria-hidden />
            ) : (
              <ChevronRight className='h-4 w-4' strokeWidth={3} aria-hidden />
            )}
          </button>
        )
      },
      size: 40,
    },

    {
      accessorKey: 'name',
      header: t('showTable.colName'),
      cell: ({ row }) => {
        const { image, name } = row.original
        return (
          <div className='flex min-w-0 items-center gap-2.5'>
            {/* Gambar acara sebelumnya tersimpan tapi tidak pernah ditampilkan di mana pun. */}
            {image ? (
              <img
                src={image}
                alt=''
                loading='lazy'
                className='nb-frame nb-frame-thin h-10 w-16 shrink-0 bg-[#f5f1e8] object-cover'
              />
            ) : (
              <span
                className='nb-frame nb-frame-thin flex h-10 w-16 shrink-0 items-center justify-center bg-[#f5f1e8]'
                title={t('showTable.noImage')}
              >
                <ImageOff className='h-4 w-4 text-[#111]/70' strokeWidth={3} aria-hidden />
              </span>
            )}
            <span className='truncate font-black uppercase tracking-tight'>{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'alias',
      header: t('showTable.colAlias'),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-bold'>{row.original.alias || '—'}</span>
      ),
    },
    {
      id: 'flags',
      header: t('showTable.colFlags'),
      cell: ({ row }) => {
        const active = FLAGS.filter((flag) => row.original[flag.key])
        if (!active.length) {
          return <span className='font-black text-[#111]/70'>—</span>
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {active.map((flag) => (
              <span
                key={flag.key}
                className={cn(
                  'nb-frame nb-frame-thin px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]',
                  flag.accent,
                )}
              >
                {t(flag.labelKey)}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'is_show',
      header: t('showTable.colStatus'),
      cell: ({ row }) => {
        const visible = row.original.is_show
        return (
          <span
            className={cn(
              'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]',
              visible ? 'bg-[#c9f24d]' : 'bg-white text-[#111]/70',
            )}
          >
            {visible ? (
              <Eye className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
            ) : (
              <EyeOff className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
            )}
            {visible ? t('showTable.statusVisible') : t('showTable.statusHidden')}
          </span>
        )
      },
    },
    {
      accessorKey: 'games',
      header: t('showTable.colGameCount'),
      cell: ({ row }) => {
        const games = row.original.games ?? []
        const n = games.length
        if (n === 0) {
          return (
            <span className='nb-frame nb-frame-thin inline-flex min-h-7 min-w-7 items-center justify-center bg-white px-2 text-xs font-black tabular-nums text-[#111]/70'>
              0
            </span>
          )
        }
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='nb-frame nb-frame-thin nb-press-sm inline-flex min-h-7 min-w-7 cursor-pointer items-center justify-center bg-[#6fe3f5] px-2 text-xs font-black tabular-nums'
                aria-label={t('showTable.ariaOpenGameList')}
              >
                {n}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side='top'
              align='center'
              className='nb nb-frame nb-frame-thick nb-sd z-[60] w-64 bg-white p-3'
            >
              <p className='mb-2 flex items-center gap-1.5 border-b-[3px] border-[#111] pb-1.5 text-[10px] font-black uppercase tracking-[0.12em]'>
                <Gamepad2 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
                {t('showTable.connectedGames', { count: n })}
              </p>
              <div className='max-h-48 space-y-1 overflow-y-auto pr-1'>
                {games.map((g) => (
                  <div
                    key={g.id}
                    className='truncate px-1.5 py-1 text-xs font-bold hover:bg-[#f5f1e8]'
                  >
                    {g.name}
                  </div>
                ))}
              </div>
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
