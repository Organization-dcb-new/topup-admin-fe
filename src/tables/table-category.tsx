import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { Category } from '@/types/category'
import { DeleteCategoryButton } from '@/components/Category/DeleteCategoryModal'
import { EditCategoryModal } from '@/components/Category/EditCategoryModal'
export const getCategoryColumns = (t: TFunction): ColumnDef<Category>[] => [
  {
    accessorKey: 'icon_url',
    header: t('categoryTable.colImage'),
    cell: ({ row }) => {
      const src = row.original.icon_url || 'https://api.dicebear.com/9.x/lorelei/svg'
      return (
        <img
          src={src}
          alt={row.original.name || t('categoryTable.iconAltFallback')}
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
    header: t('categoryTable.colName'),
  },
  {
    accessorKey: 'slug',
    header: t('categoryTable.colSlug'),
  },
  {
    accessorKey: 'description',
    header: t('categoryTable.colDescription'),
  },
  {
    id: 'actions',
    header: t('categoryTable.colActions'),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <EditCategoryModal category={row.original}   />
        <DeleteCategoryButton id={row.original.id} />
      </div>
    ),
  },
]
