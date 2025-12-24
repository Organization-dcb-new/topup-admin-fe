import type { ColumnDef } from '@tanstack/react-table'
import type { Game } from '@/types/game'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

export const gameColumns = (onImageClick: (game: Game) => void): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

      return (
        <button
          onClick={() => onImageClick(row.original)}
          className="group relative h-12 w-12 cursor-pointer"
        >
          <img
            src={image}
            alt={row.original.name}
            className="h-12 w-12 rounded-md object-contain border transition-opacity duration-200 group-hover:opacity-70"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_GAME_IMAGE
            }}
          />

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Pencil className="h-4 w-4 text-white" />
          </div>
        </button>
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
]
