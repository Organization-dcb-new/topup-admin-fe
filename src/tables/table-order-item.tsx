import type { OrderItemV2Response } from '@/types/order-item'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

export function getOrderItemColumns(t: TFunction): ColumnDef<OrderItemV2Response>[] {
  return [
    {
      accessorKey: 'id',
      header: t('orderTable.colId'),
    },
    {
      accessorKey: 'product_id',
      header: t('orderTable.colProductId'),
    },
    {
      accessorKey: 'product_name',
      header: t('orderTable.colProductName'),
    },
    {
      accessorKey: 'product_sku',
      header: t('orderTable.colProductSku'),
    },
    {
      accessorKey: 'quantity',
      header: t('orderTable.colQuantity'),
    },
    {
      accessorKey: 'status_order_provider',
      header: t('orderTable.colProviderStatus'),
    },
    {
      accessorKey: 'subtotal',
      header: t('orderTable.colTotal'),
    },
    {
      accessorKey: 'unit_price',
      header: t('orderTable.colUnitPrice'),
    },
  ]
}
