import type { ColumnDef } from '@tanstack/react-table'
import type { Game } from '@/types/game'
import { Badge } from '@/components/ui/badge'
import { DeleteGameModal } from '@/components/Games/DeleteGameModal'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

export const gameColumns = (): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

      return (
        <img
          src={image}
          alt={row.original.name}
          className="h-12 w-12 rounded-md object-contain border transition-opacity duration-200 group-hover:opacity-70"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_GAME_IMAGE
          }}
        />
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
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <DeleteGameModal id={row.original.id} />
      </div>
    ),
  },
]
