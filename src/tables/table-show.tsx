import type { ColumnDef } from '@tanstack/react-table'
import type { Show } from '@/types/show'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DeleteShowButton } from '@/components/Show/DeleteShowModal'
import { AddGamesToShowButton } from '@/components/Show/AddGameToShowModal'
import { UpdateShowModal } from '@/components/Show/EditShowModal'

export const showColumns: ColumnDef<Show>[] = [
  {
    id: 'expand',
    header: 'List Game',
    cell: ({ row }) =>
      row.original.Games?.length ? (
        <button onClick={row.getToggleExpandedHandler()}>
          {row.getIsExpanded() ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      ) : null,
    size: 30,
  },
  {
    accessorKey: 'Image',
    header: 'Image',
    cell: ({ row }) => {
      const src = row.original.Image || 'https://api.dicebear.com/9.x/lorelei/svg'

      return (
        <img
          src={src}
          alt="show"
          className="h-12 w-auto border rounded"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'Name',
    header: 'Name',
  },
  {
    accessorKey: 'Alias',
    header: 'Alias',
  },
  {
    accessorKey: 'Games',
    header: 'Total Games',
    cell: ({ row }) => row.original.Games?.length ?? 0,
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <AddGamesToShowButton showId={row.original.ID} />
        <DeleteShowButton id={row.original.ID} />
        <UpdateShowModal show={row.original} />
      </div>
    ),
  },
]
