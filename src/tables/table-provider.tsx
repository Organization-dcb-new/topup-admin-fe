import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Provider } from '@/types/provider'

import { DeleteProviderModal } from '@/components/Provider/DeleteProviderModal'
import { EditProviderModal } from '@/components/Provider/EditProviderModal'

export const providerColumns = (): ColumnDef<Provider>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
  },
  {
    accessorKey: 'api_url',
    header: 'API URL',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate max-w-55 block">
        {row.original.api_url}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <span className="font-medium">Rp {row.original.balance.toLocaleString('id-ID')}</span>
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => row.original.priority,
  },
  {
    accessorKey: 'config',
    header: 'Config',
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-2 py-1 rounded">
        {JSON.stringify(row.original.config)}
      </code>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex flex-row">
        <EditProviderModal provider={row.original} />

        <DeleteProviderModal id={row.original.id} />
      </div>
    ),
  },
]
