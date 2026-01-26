import type { OrderItemV2Response } from '@/types/order-item'
import type { ColumnDef } from '@tanstack/react-table'

export const orderItemColumns: ColumnDef<OrderItemV2Response>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'product_id',
    header: 'Product ID',
  },
  {
    accessorKey: 'product_name',
    header: 'Product Name',
  },
  {
    accessorKey: 'product_sku',
    header: 'Product SKU',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },
  {
    accessorKey: 'status_order_provider',
    header: 'Status Provider',
  },
  {
    accessorKey: 'subtotal',
    header: 'Total',
  },
  {
    accessorKey: 'unit_price',
    header: 'Unit Price',
  },
]
