import type { ColumnDef } from '@tanstack/react-table'
import type { Game } from '@/types/game'
import { ChangeImageModal } from '@/components/Games/UploadImageModal'
import { GameTableActions } from '@/components/Games/TableAction'
import ToggleGameStatus from '@/components/Games/ToggleGameStatus'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

export const gameColumns = (): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: 'Image',
    cell: ({ row }: { row: { original: Game } }) => {
      const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

      return (
        <div className="flex items-center">
          <ChangeImageModal game={row.original} image={image} />
        </div>
      )
    },
  },

  {
    accessorKey: 'name',
    header: 'Game Name',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'category.name',
    header: 'Category',
    cell: ({ row }) => row.original.category.name,
  },
  {
    accessorKey: 'developer',
    header: 'Developer',
  },
  {
    accessorKey: 'publisher',
    header: 'Publisher',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => <ToggleGameStatus game={row.original} />,
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => <GameTableActions game={row.original} product={row.original.product ?? []} />,
  },
]
