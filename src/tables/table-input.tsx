import type { ColumnDef } from '@tanstack/react-table'
import type { GameWithInputs } from '@/types/game-input'
import EditGameInputModalForm from '@/components/Inputs/EditGameInputModal'

export const inputCollumn: ColumnDef<GameWithInputs>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const src = row.original.image || 'https://api.dicebear.com/9.x/lorelei/svg'
      return (
        <img
          src={src}
          alt={row.original.image || 'icon'}
          className="w-10 h-10 rounded object-contain border"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'game_name',
    header: 'Game Name',
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => <EditGameInputModalForm inputs={row.original.inputs} />,
  },
]
