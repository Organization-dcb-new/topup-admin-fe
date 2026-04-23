import { Badge } from '@/components/ui/badge'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import type { AdminLog } from '@/types/admin-log'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'

function formatJsonValue(value: Record<string, unknown> | null) {
  if (!value || Object.keys(value).length === 0) return '—'
  return JSON.stringify(value)
}

function actionVariant(action: string): 'success' | 'destructive' | 'outline' {
  if (action === 'LOGIN') return 'success'
  if (action === 'DELETE') return 'destructive'
  return 'outline'
}

export function getAdminLogColumns(t: TFunction): ColumnDef<AdminLog>[] {
  return [
    {
      accessorKey: 'ID',
      header: t('adminLogTable.colId'),
      cell: ({ row }) => (
        <Link
          to={`/admin-logs/${row.original.ID}`}
          className='font-mono text-sm text-primary underline-offset-4 hover:underline'
        >
          {row.original.ID}
        </Link>
      ),
    },
    {
      accessorKey: 'CreatedAt',
      header: t('adminLogTable.colCreatedAt'),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm tabular-nums text-muted-foreground'>
          {formatBackendDateTime(row.original.CreatedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'Action',
      header: t('adminLogTable.colAction'),
      cell: ({ row }) => (
        <Badge variant={actionVariant(row.original.Action)} className='font-medium'>
          {row.original.Action}
        </Badge>
      ),
    },
    {
      accessorKey: 'Module',
      header: t('adminLogTable.colModule'),
      cell: ({ row }) => <span className='font-medium text-foreground'>{row.original.Module}</span>,
    },
    {
      accessorKey: 'Description',
      header: t('adminLogTable.colDescription'),
      cell: ({ row }) => (
        <span className='line-clamp-2 min-w-[14rem] max-w-[22rem] text-sm text-muted-foreground'>
          {row.original.Description || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'OldData',
      header: t('adminLogTable.colOldData'),
      cell: ({ row }) => (
        <span
          className='line-clamp-2 min-w-[14rem] max-w-[22rem] font-mono text-xs text-muted-foreground'
          title={formatJsonValue(row.original.OldData)}
        >
          {formatJsonValue(row.original.OldData)}
        </span>
      ),
    },
    {
      accessorKey: 'NewData',
      header: t('adminLogTable.colNewData'),
      cell: ({ row }) => (
        <span
          className='line-clamp-2 min-w-[14rem] max-w-[22rem] font-mono text-xs text-muted-foreground'
          title={formatJsonValue(row.original.NewData)}
        >
          {formatJsonValue(row.original.NewData)}
        </span>
      ),
    },
    {
      accessorKey: 'IPAddress',
      header: t('adminLogTable.colIpAddress'),
      cell: ({ row }) => (
        <span className='font-mono text-sm tabular-nums text-muted-foreground'>
          {row.original.IPAddress || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'UserAgent',
      header: t('adminLogTable.colUserAgent'),
      cell: ({ row }) => (
        <span className='line-clamp-2 min-w-[14rem] max-w-[24rem] text-xs text-muted-foreground'>
          {row.original.UserAgent || '—'}
        </span>
      ),
    },
  ]
}
