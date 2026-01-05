import type { ColumnDef } from '@tanstack/react-table'
import type { Category } from '@/types/category'
import { DeleteCategoryButton } from '@/components/Category/DeleteCategoryModal'
import { EditCategoryModal } from '@/components/Category/EditCategoryModal'
export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'icon_url',
    header: 'Image',
    cell: ({ row }) => {
      const src = row.original.icon_url || 'https://api.dicebear.com/9.x/lorelei/svg'
      return (
        <img
          src={src}
          alt={row.original.name || 'icon'}
          className="w-10 h-10 rounded object-contain border"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
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
        <EditCategoryModal category={row.original}   />
        <DeleteCategoryButton id={row.original.id} />
      </div>
    ),
  },
]
