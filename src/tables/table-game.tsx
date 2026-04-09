import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { Game } from '@/types/game'
import { ChangeImageModal } from '@/components/Games/UploadImageModal'
import { GameTableActions } from '@/components/Games/TableAction'
import ToggleGameStatus from '@/components/Games/ToggleGameStatus'
import { Link } from 'react-router-dom'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

export const getGameColumns = (t: TFunction): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: t('gameTable.colImage'),
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
    header: t('gameTable.colName'),
    cell: ({ row }) => (
      <Link
        to={`/games/${row.original.id}`}
        className="max-w-[12rem] font-medium text-primary hover:underline sm:max-w-xs"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'code',
    header: t('gameTable.colCode'),
    cell: ({ row }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: 'developer',
    header: t('gameTable.colDeveloper'),
    cell: ({ row }) => (
      <span className="max-w-[8rem] truncate text-sm text-muted-foreground sm:max-w-[9rem]">
        {row.original.developer || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'publisher',
    header: t('gameTable.colPublisher'),
    cell: ({ row }) => (
      <span className="max-w-[8rem] truncate text-sm text-muted-foreground sm:max-w-[9rem]">
        {row.original.publisher || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: t('gameTable.colActive'),
    cell: ({ row }) => (
      <div className="flex min-w-[7rem] items-center py-0.5">
        <ToggleGameStatus game={row.original} />
      </div>
    ),
  },
  {
    id: 'actions',
    header: t('gameTable.colActions'),
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={t('gameTable.rowActionsAria', { name: row.original.name })}
        >
          <GameTableActions game={row.original} />
        </div>
      </div>
    ),
  },
]
