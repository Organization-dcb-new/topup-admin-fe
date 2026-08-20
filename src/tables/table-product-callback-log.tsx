import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { ProductCallbackLogResponse } from '@/types/product_callback_log'
import { CopyButton } from '@/components/ui/copy-button'
import { nbAccent, nbRowBtn, nbTag } from '@/styles/nb'
import { cn } from '@/lib/utils'
import { ChevronRight, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatBackendDateTime } from '@/lib/backend-datetime'

function formatRp(value: number | undefined | null) {
  const n = value ?? 0
  return `Rp ${n.toLocaleString('id-ID')}`
}

/**
 * Warna aksen untuk status callback.
 *
 * Provider mengirim dua bentuk status di lapangan: kata (`success`,
 * `available`, `empty`) dan kode HTTP mentah. Keduanya ditangani di satu tempat
 * supaya tabel dan halaman detail tidak pernah memberi warna yang berbeda untuk
 * status yang sama.
 */
export function callbackStatusAccent(status: string | undefined | null) {
  const raw = (status ?? '').toLowerCase().trim()
  const httpCode = Number(raw)

  if (Number.isInteger(httpCode) && httpCode >= 100) {
    if (httpCode < 400) return nbAccent.lime
    if (httpCode < 500) return nbAccent.orange
    return nbAccent.red
  }

  if (raw === 'success' || raw === 'available' || raw === 'ok') return nbAccent.lime
  if (raw === 'empty' || raw === 'pending' || raw === 'warning') return nbAccent.orange
  if (raw === 'failed' || raw === 'error') return nbAccent.red
  return nbAccent.cyan
}

export const getProductCallbackLogColumns = (
  t: TFunction,
): ColumnDef<ProductCallbackLogResponse>[] => [
  {
    accessorKey: 'id',
    header: t('productCallbackLogTable.colId'),
    cell: ({ row }) => (
      <div className='flex items-center gap-1.5'>
        <Link
          to={`/products/callback-logs/${row.original.id}`}
          className='nb-focus group inline-flex min-w-0 items-center gap-0.5 font-mono text-xs font-bold underline-offset-2 hover:underline'
          title={row.original.id}
        >
          <span className='max-w-[10rem] truncate'>{row.original.id}</span>
          <ChevronRight
            className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5'
            strokeWidth={3}
            aria-hidden
          />
        </Link>
        <CopyButton
          value={row.original.id}
          label={t('productCallbackLogTable.copyId')}
          errorLabel={t('productCallbackLogTable.copyError')}
          className='h-7 w-7'
        />
      </div>
    ),
  },
  {
    accessorKey: 'product_code',
    header: t('productCallbackLogTable.colProductCode'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap font-mono text-xs font-bold'>
        {row.original.product_code}
      </span>
    ),
  },
  {
    accessorKey: 'product_name',
    header: t('productCallbackLogTable.colProductName'),
    cell: ({ row }) => (
      <div
        className='max-w-[12rem] truncate text-xs font-bold sm:max-w-xs'
        title={row.original.product_name}
      >
        {row.original.product_name}
      </div>
    ),
  },
  {
    accessorKey: 'provider_code',
    header: t('productCallbackLogTable.colProviderCode'),
    cell: ({ row }) => (
      <span className={cn(nbTag, nbAccent.cyan)}>{row.original.provider_code}</span>
    ),
  },
  {
    accessorKey: 'price',
    header: () => <span className='block text-right'>{t('productCallbackLogTable.colPrice')}</span>,
    cell: ({ row }) => (
      <span className='block whitespace-nowrap text-right text-sm font-black tabular-nums'>
        {formatRp(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: 'previous_price',
    header: () => (
      <span className='block text-right'>{t('productCallbackLogTable.colPreviousPrice')}</span>
    ),
    cell: ({ row }) => (
      <span className='block whitespace-nowrap text-right text-xs font-bold tabular-nums text-[#111]/70 line-through'>
        {formatRp(row.original.previous_price)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: t('productCallbackLogTable.colStatus'),
    cell: ({ row }) => (
      <span className={cn(nbTag, callbackStatusAccent(row.original.status))}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'meta_level',
    header: t('productCallbackLogTable.colMetaLevel'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em]'>
        {row.original.meta_level}
      </span>
    ),
  },
  {
    accessorKey: 'meta_timestamp',
    header: t('productCallbackLogTable.colMetaTimestamp'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap font-mono text-xs font-bold tabular-nums text-[#111]/70'>
        {row.original.meta_timestamp}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: t('productCallbackLogTable.colCreatedAt'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-xs font-bold tabular-nums'>
        {formatBackendDateTime(row.original.created_at)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => (
      <span className='block text-right'>{t('productCallbackLogTable.colActions')}</span>
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <Link
          to={`/products/callback-logs/${row.original.id}`}
          className={cn(nbRowBtn, nbAccent.yellow)}
        >
          <Eye className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
          {t('productCallbackLogTable.btnDetail')}
        </Link>
      </div>
    ),
  },
]
