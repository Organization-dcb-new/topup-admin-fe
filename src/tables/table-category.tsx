import type { ColumnDef } from '@tanstack/react-table'
import type { Category } from '@/types/category'
import { DeleteCategoryButton } from '@/components/Category/ModalDeleteCategory'
import { EditCategoryButton } from '@/components/Category/components/Button'
export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'icon_url',
    header: 'Image',
    cell: ({ row }) => (
      <img
        src={row.original.icon_url}
        alt="icon"
        className="w-10 h-10 rounded object-contain border"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.png'
        }}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <EditCategoryButton category={row.original} />
        <DeleteCategoryButton id={row.original.id} />
      </div>
    ),
  },
]
