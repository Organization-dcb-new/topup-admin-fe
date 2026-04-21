import { DeleteProviderModal } from '@/components/Provider/DeleteProviderModal'
import { EditProviderModal } from '@/components/Provider/EditProviderModal'
import { Badge } from '@/components/ui/badge'
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
      <div className='max-w-[10rem] font-medium text-gray-900 sm:max-w-[14rem]'>{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: t('providerTable.colCode'),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-foreground tabular-nums'>{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'api_url',
    header: t('providerTable.colApiUrl'),
    cell: ({ row }) => (
      <span
        className='block max-w-[12rem] truncate text-xs text-muted-foreground sm:max-w-[16rem]'
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
        <Badge
          variant={active ? 'default' : 'secondary'}
          className={cn(
            'font-medium',
            active && 'bg-emerald-600 hover:bg-emerald-600/90',
          )}
        >
          {active ? t('providerTable.statusActive') : t('providerTable.statusInactive')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'balance',
    header: t('providerTable.colBalance'),
    cell: ({ row }) => (
      <span className='text-sm font-medium tabular-nums text-foreground'>
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
      <span className='tabular-nums text-sm font-medium text-foreground'>{row.original.priority}</span>
    ),
  },
  {
    accessorKey: 'config',
    header: t('providerTable.colConfig'),
    cell: ({ row }) => (
      <code className='inline-block max-w-[10rem] truncate rounded-md bg-muted/80 px-2 py-1 font-mono text-xs text-foreground sm:max-w-[12rem]'>
        {formatConfigPreview(row.original.config)}
      </code>
    ),
  },
  {
    id: 'actions',
    header: t('providerTable.colActions'),
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center'>
        <div
          className='inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm'
          role='group'
          aria-label={t('providerTable.rowActionsAria', { name: row.original.name })}
        >
          <EditProviderModal provider={row.original} />
          <DeleteProviderModal id={row.original.id} />
        </div>
      </div>
    ),
  },
]
