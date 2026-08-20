import { DeleteProviderModal } from '@/components/Provider/DeleteProviderModal'
import { EditProviderModal } from '@/components/Provider/EditProviderModal'
import { nbBadge, nbCode } from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { Provider } from '@/types/provider'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'

function formatConfigPreview(config: Provider['config']) {
  if (config == null || (typeof config === 'object' && Object.keys(config).length === 0)) {
    return '—'
  }
  return JSON.stringify(config)
}

export const getProviderColumns = (t: TFunction): ColumnDef<Provider>[] => [
  {
    accessorKey: 'name',
    header: t('providerTable.colName'),
    cell: ({ row }) => (
      <div className='max-w-[10rem] font-black sm:max-w-[14rem]'>{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: t('providerTable.colCode'),
    cell: ({ row }) => <span className={nbCode}>{row.original.code}</span>,
  },
  {
    accessorKey: 'api_url',
    header: t('providerTable.colApiUrl'),
    cell: ({ row }) => (
      <span
        className='block max-w-[12rem] truncate text-xs font-bold text-[#111]/70 sm:max-w-[16rem]'
        title={row.original.api_url}
      >
        {row.original.api_url}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: t('providerTable.colStatus'),
    cell: ({ row }) => {
      const active = row.original.status === 'ACTIVE'
      return (
        <span className={cn(nbBadge, active ? 'bg-[#c9f24d]' : 'bg-[#f5f1e8]')}>
          {active ? t('providerTable.statusActive') : t('providerTable.statusInactive')}
        </span>
      )
    },
  },
  {
    accessorKey: 'balance',
    header: t('providerTable.colBalance'),
    cell: ({ row }) => (
      <span className='text-sm font-black tabular-nums'>
        {new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(row.original.balance)}
      </span>
    ),
  },
  {
    accessorKey: 'priority',
    header: t('providerTable.colPriority'),
    cell: ({ row }) => (
      <span className='nb-frame nb-frame-thin inline-flex h-6 min-w-6 items-center justify-center bg-[#6fe3f5] px-1.5 text-xs font-black tabular-nums'>
        {row.original.priority}
      </span>
    ),
  },
  {
    accessorKey: 'config',
    header: t('providerTable.colConfig'),
    cell: ({ row }) => (
      <code className={cn(nbCode, 'max-w-[10rem] truncate sm:max-w-[12rem]')}>
        {formatConfigPreview(row.original.config)}
      </code>
    ),
  },
  {
    id: 'actions',
    header: t('providerTable.colActions'),
    cell: ({ row }) => (
      <div
        className='flex min-w-0 flex-wrap items-center gap-2'
        role='group'
        aria-label={t('providerTable.rowActionsAria', { name: row.original.name })}
      >
        <EditProviderModal provider={row.original} />
        <DeleteProviderModal id={row.original.id} />
      </div>
    ),
  },
]
