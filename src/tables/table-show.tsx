import type { ColumnDef } from '@tanstack/react-table'
import type { Show } from '@/types/show'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShowActionsHeader, ShowRowActions } from '@/components/Show/ShowRowActions'

export const showColumns: ColumnDef<Show>[] = [
  {
    id: 'expand',
    header: () => (
      <span className="block min-w-[2.75rem] text-xs font-medium text-muted-foreground">
        Daftar game
      </span>
    ),
    cell: ({ row }) => {
      const count = row.original.Games?.length ?? 0
      if (!count) {
        return <span className="text-xs text-muted-foreground">—</span>
      }
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={row.getIsExpanded() ? 'Tutup daftar game' : 'Buka daftar game'}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden />
          )}
        </Button>
      )
    },
    size: 40,
  },

  {
    accessorKey: 'Name',
    header: 'Nama',
  },
  {
    accessorKey: 'Alias',
    header: 'Alias',
  },
  {
    accessorKey: 'Games',
    header: 'Jumlah game',
    cell: ({ row }) => {
      const n = row.original.Games?.length ?? 0
      return (
        <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium tabular-nums text-foreground">
          {n}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: () => <ShowActionsHeader />,
    cell: ({ row }) => <ShowRowActions show={row.original} />,
  },
]
