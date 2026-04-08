import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

import type { PaymentMethodCategory } from '@/types/payment-method-categories'
import { DeletePaymentCategory } from '@/components/PaymentMethodCategory/Delete'
import { AddPaymentMethodToPaymentCategoryButton } from '@/components/PaymentMethodCategory/Add'

const FALLBACK_ICON = 'https://api.dicebear.com/9.x/lorelei/svg'

export const getPaymentMethodCategoriesColumns = (t: TFunction): ColumnDef<PaymentMethodCategory>[] => [
  {
    accessorKey: 'icon_url',
    header: t('paymentMethodCategoryTable.colIcon'),
    cell: ({ row }) => {
      const src = row.original.icon_url || FALLBACK_ICON
      return (
        <img
          src={src}
          alt={
            row.original.name
              ? t('paymentMethodCategoryTable.iconAltName', { name: row.original.name })
              : t('paymentMethodCategoryTable.iconAltFallback')
          }
          className="h-10 w-10 rounded-md border border-border/80 bg-muted/20 object-contain ring-1 ring-gray-900/5"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },

  {
    accessorKey: 'name',
    header: t('paymentMethodCategoryTable.colName'),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'slug',
    header: t('paymentMethodCategoryTable.colSlug'),
    cell: ({ row }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
        {row.original.slug}
      </code>
    ),
  },
  {
    id: 'actions',
    header: t('paymentMethodCategoryTable.colActions'),
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={t('paymentMethodCategoryTable.rowActionsAria', { name: row.original.name })}
        >
          <AddPaymentMethodToPaymentCategoryButton categoryId={row.original.id} />
          <DeletePaymentCategory id={row.original.id} />
        </div>
      </div>
    ),
  },
]
