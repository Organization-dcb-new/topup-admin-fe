import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { GameWithInputs } from '@/types/game-input'
import EditGameInputModalForm from '@/components/Inputs/EditGameInputModal'

const FALLBACK_IMAGE = 'https://api.dicebear.com/9.x/lorelei/svg'

export const getInputColumns = (t: TFunction): ColumnDef<GameWithInputs>[] => [
  {
    accessorKey: 'image',
    header: t('inputTable.colImage'),
    cell: ({ row }) => {
      const src = row.original.image?.trim() || FALLBACK_IMAGE
      return (
        <img
          src={src}
          alt={
            row.original.game_name
              ? t('inputTable.imageAltName', { name: row.original.game_name })
              : t('inputTable.imageAltFallback')
          }
          className='h-10 w-10 rounded-md border border-border/80 bg-muted/20 object-contain ring-1 ring-gray-900/5'
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'game_name',
    header: t('inputTable.colGameName'),
    cell: ({ row }) => (
      <div className='max-w-[14rem] font-medium text-gray-900 sm:max-w-xs'>{row.original.game_name}</div>
    ),
  },
  {
    id: 'actions',
    header: t('inputTable.colActions'),
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center'>
        <div
          className='inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm'
          role='group'
          aria-label={t('inputTable.rowActionsAria', { name: row.original.game_name })}
        >
          <EditGameInputModalForm inputs={row.original.inputs} />
        </div>
      </div>
    ),
  },
]
