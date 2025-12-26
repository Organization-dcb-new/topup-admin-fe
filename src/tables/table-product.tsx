import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_GAME_IMAGE } from './table-game'

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.image

      return (
        <img
          src={image || DEFAULT_GAME_IMAGE}
          alt="Game Image"
          className="h-12 w-12 rounded-md object-contain border transition-opacity duration-200 group-hover:opacity-70"
          loading="lazy"
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'selling_price',
    header: 'Price',
    cell: ({ row }) => `Rp ${row.original.selling_price.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'stock_quantity',
    header: 'Stock',
    cell: ({ row }) =>
      row.original.is_unlimited_stock ? 'Unlimited' : row.original.stock_quantity,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]
