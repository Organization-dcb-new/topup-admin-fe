import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'product_type',
    header: 'Type',
    cell: ({ row }) => <Badge variant="outline">{row.original.product_type}</Badge>,
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
