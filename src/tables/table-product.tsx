import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_GAME_IMAGE } from './table-game'
import { ChangeImageModalProduct } from '@/components/Product/UploadImage'
import UpdateProductPriceModal from '@/components/Product/UpdatePrice'

export const productColumns: ColumnDef<Product>[] = [
  {
    id: 'image',
    header: 'Image',
    cell: ({ row }: { row: { original: Product } }) => {
      const image = row.original.image?.trim() || DEFAULT_GAME_IMAGE

      return (
        <div className="flex items-center">
          <ChangeImageModalProduct product={row.original} image={image} />
        </div>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorFn: (row) => row.game?.name || '-',
    id: 'game_name',
    header: 'Game Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'additional_fee',
    header: 'Additional Fee',
    cell: ({ row }) => `Rp ${row.original?.additional_fee?.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'additional_percent',
    header: 'Additional Percent',
    cell: ({ row }) => `${row.original?.additional_percent} %`,
  },

  {
    accessorKey: 'base_price',
    header: 'Base Price',
    cell: ({ row }) => `Rp ${row.original?.base_price?.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'selling_price',
    header: 'Selling Price',
    cell: ({ row }) => `Rp ${row.original?.selling_price?.toLocaleString('id-ID')}`,
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

  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <UpdateProductPriceModal
        basePrice={row.original.base_price}
        productId={row.original.id}
        productName={row.original.name}
      />
    ),
  },
]
