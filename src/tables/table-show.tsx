import type { ColumnDef } from '@tanstack/react-table'
import type { Show } from '@/types/show'
import type { TFunction } from 'i18next'
import { ChevronDown, ChevronRight, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShowActionsHeader, ShowRowActions } from '@/components/Show/ShowRowActions'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function getShowColumns(t: TFunction): ColumnDef<Show>[] {
  return [
    {
      id: 'expand',
      header: () => (
        <span className='block min-w-[2.75rem] text-xs font-medium text-muted-foreground'>
          {t('showTable.gameListColumn')}
        </span>
      ),
      cell: ({ row }) => {
        const count = row.original.games?.length ?? 0
        if (!count) {
          return <span className='text-xs text-muted-foreground'>—</span>
        }
        return (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground'
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            aria-label={
              row.getIsExpanded()
                ? t('showTable.ariaCloseGameList')
                : t('showTable.ariaOpenGameList')
            }
          >
            {row.getIsExpanded() ? (
              <ChevronDown className='h-4 w-4' aria-hidden />
            ) : (
              <ChevronRight className='h-4 w-4' aria-hidden />
            )}
          </Button>
        )
      },
      size: 40,
    },

    {
      accessorKey: 'name',
      header: t('showTable.colName'),
    },
    {
      accessorKey: 'alias',
      header: t('showTable.colAlias'),
    },
    {
      accessorKey: 'games',
      header: t('showTable.colGameCount'),
      cell: ({ row }) => {
        const games = row.original.games ?? []
        const n = games.length
        if (n === 0) {
          return (
            <span className='inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-900 px-2 text-xs font-bold tabular-nums text-slate-400 dark:text-slate-500'>
              0
            </span>
          )
        }
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/30 px-2 text-xs font-bold cursor-pointer transition-colors duration-200 tabular-nums text-indigo-600 dark:text-indigo-400'
                title={t('showTable.ariaOpenGameList')}
              >
                {n}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side='top'
              align='center'
              className='z-[60] w-64 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg'
            >
              <p className='border-b border-slate-100 dark:border-zinc-900 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
                <Gamepad2 className='h-3.5 w-3.5' />
                Connected Games ({n})
              </p>
              <div className='max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar'>
                {games.map((g) => (
                  <div key={g.id} className='text-xs font-semibold text-slate-700 dark:text-slate-300 truncate py-1 px-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900'>
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
