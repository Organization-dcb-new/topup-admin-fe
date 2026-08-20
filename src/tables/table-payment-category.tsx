import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

import type { PaymentMethodCategory } from '@/types/payment-method-categories'
import { pmCellIcon, pmCode } from '@/components/PaymentMethod/styles'
import { DeletePaymentCategory } from '@/components/PaymentMethodCategory/Delete'
import { AddPaymentMethodToPaymentCategoryButton } from '@/components/PaymentMethodCategory/Add'
import { EditPaymentCategoryModal } from '@/components/PaymentMethodCategory/Edit'

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
          className={pmCellIcon}
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
    cell: ({ row }) => <div className='font-black text-[#111]'>{row.original.name}</div>,
  },
  {
    accessorKey: 'slug',
    header: t('paymentMethodCategoryTable.colSlug'),
    cell: ({ row }) => <code className={pmCode}>{row.original.slug}</code>,
  },
  {
    accessorKey: 'sort_order',
    header: t('paymentMethodCategoryTable.colSortOrder'),
    cell: ({ row }) => (
      <span className='text-sm font-black tabular-nums'>{row.original.sort_order}</span>
    ),
  },
  {
    id: 'actions',
    header: t('paymentMethodCategoryTable.colActions'),
    cell: ({ row }) => (
      <div
        className='flex min-w-0 flex-wrap items-center gap-1.5'
        role='group'
        aria-label={t('paymentMethodCategoryTable.rowActionsAria', { name: row.original.name })}
      >
        <AddPaymentMethodToPaymentCategoryButton categoryId={row.original.id} />
        <EditPaymentCategoryModal category={row.original} />
        <DeletePaymentCategory id={row.original.id} />
      </div>
    ),
  },
]
