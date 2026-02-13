import { AddProductToCategoryProductButton } from '@/components/CategoryProduct/AddProduct'
import { DeleteCategoryProductButton } from '@/components/CategoryProduct/DeleteCategoryProduct'
import { UpdateCategoryProduct } from '@/components/CategoryProduct/UpdateCategoryProduct'
import type { CategoryProduct } from '@/hooks/useCategoryProduct'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'

export const categoryProductColumn: ColumnDef<CategoryProduct>[] = [
  {
    id: 'expand',
    header: 'List Product',
    cell: ({ row }) =>
      row.original.product?.length ? (
        <button onClick={row.getToggleExpandedHandler()}>
          {row.getIsExpanded() ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      ) : null,
    size: 30,
  },
  {
    accessorKey: 'Image',
    header: 'Image',
    cell: ({ row }) => {
      const src = row.original.icon_url || 'https://api.dicebear.com/9.x/lorelei/svg'

      return (
        <img
          src={src}
          alt="show"
          className="h-12 w-auto border rounded"
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
    accessorKey: 'game_name',
    header: 'Game Name',
  },

  {
    accessorKey: 'product',
    header: 'Total Product',
    cell: ({ row }) => row.original.product?.length ?? 0,
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <AddProductToCategoryProductButton
          id={row.original.id}
          game_id={row.original.game_id}
          existingProduct={row.original.product}
        />
        <DeleteCategoryProductButton id={row.original.id} />
        <UpdateCategoryProduct category={row.original} />
      </div>
    ),
  },
]
