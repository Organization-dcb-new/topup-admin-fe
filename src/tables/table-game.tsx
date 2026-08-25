import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { Game } from '@/types/game'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { ChangeImageModal } from '@/components/Games/UploadImageModal'
import { GameTableActions } from '@/components/Games/TableAction'
import ToggleGameStatus from '@/components/Games/ToggleGameStatus'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export const DEFAULT_GAME_IMAGE = 'https://placehold.co/64x64?text=No+Image'

function formatRp(value: number | undefined | null) {
  const n = value ?? 0
  return `Rp ${n.toLocaleString('id-ID')}`
}

export const getGameColumns = (t: TFunction): ColumnDef<Game>[] => [
  {
    id: 'thumbnail',
    header: t('gameTable.colImage'),
    cell: ({ row }) => {
      const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

      return (
        <div className='flex min-w-[4.5rem] items-center py-0.5'>
          <Can perm={PERM.GAME_UPDATE}>
            <ChangeImageModal game={row.original} image={image} />
          </Can>
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
        className='group inline-flex max-w-[13rem] items-center gap-1 font-medium text-primary sm:max-w-xs'
      >
        <span className='truncate group-hover:underline'>{row.original.name}</span>
        <ChevronRight
          className='h-3.5 w-3.5 shrink-0 text-primary/50 transition-colors group-hover:text-primary/80'
          aria-hidden
        />
      </Link>
    ),
  },
  {
    accessorKey: 'code',
    header: t('gameTable.colCode'),
    cell: ({ row }) => (
      <code className='rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground'>
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: 'additional_fee',
    header: t('gameTable.colAdditionalFee'),
    cell: ({ row }) => (
      <span className='tabular-nums text-sm font-medium text-foreground'>
        {formatRp(row.original.additional_fee)}
      </span>
    ),
  },
  {
    accessorKey: 'additional_percent',
    header: t('gameTable.colPercent'),
    cell: ({ row }) => (
      <span className='tabular-nums text-sm font-medium text-foreground'>
        {row.original.additional_percent ?? 0} %
      </span>
    ),
  },
  {
    id: 'dev_publisher',
    header: t('gameTable.colDevPublisher'),
    cell: ({ row }) => {
      const d = row.original.developer?.trim()
      const p = row.original.publisher?.trim()
      if (!d && !p) {
        return <span className='text-sm text-muted-foreground'>—</span>
      }
      return (
        <div className='max-w-[10rem] space-y-0.5 text-sm text-muted-foreground'>
          {d ? (
            <div className='truncate' title={d}>
              {d}
            </div>
          ) : null}
          {p ? (
            <div className='truncate text-xs text-muted-foreground/90' title={p}>
              {p}
            </div>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: 'is_active',
    header: t('gameTable.colActive'),
    cell: ({ row }) => (
      <div className='flex min-w-[7rem] items-center py-0.5'>
        <Can perm={PERM.GAME_UPDATE}>
          <ToggleGameStatus game={row.original} />
        </Can>
      </div>
    ),
  },
  {
    accessorKey: 'updated_at',
    header: t('gameTable.colUpdatedAt'),
    cell: ({ row }) => {
      const by = row.original.updated_by?.name?.trim()
      return (
        <div className='max-w-[12rem] space-y-0.5'>
          <div className='whitespace-nowrap text-sm text-muted-foreground'>
            {formatBackendDateTime(row.original.updated_at)}
          </div>
          {by ? (
            <div className='truncate text-xs text-muted-foreground/90' title={by}>
              {by}
            </div>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: t('gameTable.colActions'),
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center'>
        <div
          className='inline-flex flex-wrap items-center gap-1 rounded-lg border border-border/70 bg-muted/25 p-1 shadow-sm'
          role='group'
          aria-label={t('gameTable.rowActionsAria', { name: row.original.name })}
        >
          <GameTableActions game={row.original} />
        </div>
      </div>
    ),
  },
]
