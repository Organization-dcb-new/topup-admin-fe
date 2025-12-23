import type { ColumnDef } from '@tanstack/react-table'
import type { Game } from '@/types/game'
import { Badge } from '@/components/ui/badge'

export const gameColumns: ColumnDef<Game>[] = [
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
