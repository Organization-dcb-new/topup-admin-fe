import type { ColumnDef } from '@tanstack/react-table'
import type { Game } from '@/types/game'
import { ChangeImageModal } from '@/components/Games/UploadImageModal'
import { GameTableActions } from '@/components/Games/TableAction'
import ToggleGameStatus from '@/components/Games/ToggleGameStatus'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

export const gameColumns = (): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: 'Gambar',
    cell: ({ row }) => {
      const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

      return (
        <div className="flex min-w-[4.5rem] items-center py-0.5">
          <ChangeImageModal game={row.original} image={image} />
        </div>
      )
    },
  },

  {
    accessorKey: 'name',
    header: 'Nama game',
    cell: ({ row }) => (
      <div className="max-w-[12rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: 'category.name',
    header: 'Kategori',
    cell: ({ row }) => (
      <span className="max-w-[8rem] truncate text-sm text-foreground sm:max-w-[10rem]">
        {row.original.category?.name ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'developer',
    header: 'Developer',
    cell: ({ row }) => (
      <span className="max-w-[8rem] truncate text-sm text-muted-foreground sm:max-w-[9rem]">
        {row.original.developer || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'publisher',
    header: 'Publisher',
    cell: ({ row }) => (
      <span className="max-w-[8rem] truncate text-sm text-muted-foreground sm:max-w-[9rem]">
        {row.original.publisher || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Aktif',
    cell: ({ row }) => (
      <div className="flex min-w-[7rem] items-center py-0.5">
        <ToggleGameStatus game={row.original} />
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={`Aksi untuk game ${row.original.name}`}
        >
          <GameTableActions game={row.original} product={row.original.product ?? []} />
        </div>
      </div>
    ),
  },
]
