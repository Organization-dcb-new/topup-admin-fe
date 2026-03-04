import type { ColumnDef } from '@tanstack/react-table'

import type { SpendingData } from '@/types/spending'

export const spendingColumns: ColumnDef<SpendingData>[] = [
  {
    accessorKey: 'payment_id',
    header: 'Payment ID',
  },
  {
    accessorKey: 'status_order',
    header: 'Status Order',
  },
  {
    accessorKey: 'status_payment',
    header: 'Status Payment',
  },
  {
    accessorKey: 'payment_gateway_amount',
    header: 'Payment Gateway Amount',
  },
  {
    accessorKey: 'payment_gateway_time',
    header: 'Payment Gateway Time',
  },
  {
    accessorKey: 'provider_amount',
    header: 'Provider Amount',
  },
  {
    accessorKey: 'provider_callback_time',
    header: 'Provider Callback Time',
  },
  {
    accessorKey: 'provider_name',
    header: 'Provider Name',
  },
]
