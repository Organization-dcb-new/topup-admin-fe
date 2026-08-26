import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

import type { PaymentMethodCategory } from '@/types/payment-method-categories'
import { DeletePaymentCategory } from '@/components/PaymentMethodCategory/Delete'
import { AddPaymentMethodToPaymentCategoryButton } from '@/components/PaymentMethodCategory/Add'
import { EditPaymentCategoryModal } from '@/components/PaymentMethodCategory/Edit'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export const getPaymentMethodCategoriesColumns = (
  t: TFunction,
): ColumnDef<PaymentMethodCategory>[] => [
  {
    accessorKey: 'icon_url',
    header: t('paymentMethodCategoryTable.colIcon'),
    cell: ({ row }) => (
      <EntityAvatar
        src={row.original.icon_url}
        alt={
          row.original.name
            ? t('paymentMethodCategoryTable.iconAltName', {
                name: row.original.name,
              })
            : t('paymentMethodCategoryTable.iconAltFallback')
        }
      />
    ),
  },
  {
    accessorKey: 'name',
    header: t('paymentMethodCategoryTable.colName'),
    cell: ({ row }) => (
      <span className='block max-w-56 truncate font-medium text-foreground'>
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: 'slug',
    header: t('paymentMethodCategoryTable.colSlug'),
    cell: ({ row }) => (
      <code className='rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground'>
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: 'sort_order',
    header: t('paymentMethodCategoryTable.colSortOrder'),
    cell: ({ row }) => (
      <span className='text-sm tabular-nums text-muted-foreground'>
        {row.original.sort_order}
      </span>
    ),
  },
  {
    id: 'actions',
    header: t('paymentMethodCategoryTable.colActions'),
    cell: ({ row }) => (
      <div
        className='inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5'
        role='group'
        aria-label={t('paymentMethodCategoryTable.rowActionsAria', {
          name: row.original.name,
        })}
      >
        {/* Dialog tautan membaca daftar metode, jadi butuh izin lihat metode
            selain izin ubah kategori */}
        <Can perm={PERM.PAYMENT_CATEGORY_UPDATE}>
          <Can perm={PERM.PAYMENT_METHOD_VIEW}>
            <AddPaymentMethodToPaymentCategoryButton
              categoryId={row.original.id}
              categoryName={row.original.name}
            />
          </Can>
        </Can>
        <Can perm={PERM.PAYMENT_CATEGORY_UPDATE}>
          <EditPaymentCategoryModal category={row.original} />
        </Can>
        <Can perm={PERM.PAYMENT_CATEGORY_DELETE}>
          <DeletePaymentCategory
            id={row.original.id}
            name={row.original.name}
          />
        </Can>
      </div>
    ),
  },
]
