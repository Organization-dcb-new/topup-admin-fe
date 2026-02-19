import type { ColumnDef } from '@tanstack/react-table'

import type { PaymentMethodCategory } from '@/types/payment-method-categories'
import { DeletePaymentCategory } from '@/components/PaymentMethodCategory/Delete'
import { AddPaymentMethodToPaymentCategoryButton } from '@/components/PaymentMethodCategory/Add'

export const paymentMethodCategoriesColumns: ColumnDef<PaymentMethodCategory>[] = [
  {
    accessorKey: 'icon_url',
    header: 'Icon',
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
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <AddPaymentMethodToPaymentCategoryButton categoryId={row.original.id} />
        <DeletePaymentCategory id={row.original.id} />
      </div>
    ),
  },
]
