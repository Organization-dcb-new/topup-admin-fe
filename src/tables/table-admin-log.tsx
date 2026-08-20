import { formatBackendDateTime } from '@/lib/backend-datetime'
import { nbAccent, nbBadge, nbLink } from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { AdminLog } from '@/types/admin-log'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'

function formatJsonValue(value: Record<string, unknown> | null) {
  if (!value || Object.keys(value).length === 0) return '—'
  return JSON.stringify(value)
}

function actionAccent(action: string) {
  if (action === 'LOGIN') return nbAccent.lime
  if (action === 'DELETE') return nbAccent.red
  if (action === 'CREATE') return nbAccent.cyan
  if (action === 'UPDATE') return nbAccent.yellow
  return nbAccent.cream
}

export function getAdminLogColumns(t: TFunction): ColumnDef<AdminLog>[] {
  return [
    {
      accessorKey: 'ID',
      header: t('adminLogTable.colId'),
      cell: ({ row }) => (
        <Link to={`/admin-logs/${row.original.ID}`} className={cn(nbLink, 'font-mono text-sm')}>
          {row.original.ID}
        </Link>
      ),
    },
    {
      accessorKey: 'CreatedAt',
      header: t('adminLogTable.colCreatedAt'),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm font-bold tabular-nums text-[#111]/70'>
          {formatBackendDateTime(row.original.CreatedAt)}
        </span>
      ),
    },
    {
      accessorKey: 'Action',
      header: t('adminLogTable.colAction'),
      cell: ({ row }) => (
        <span className={cn(nbBadge, actionAccent(row.original.Action))}>
          {row.original.Action}
        </span>
      ),
    },
    {
      accessorKey: 'Module',
      header: t('adminLogTable.colModule'),
      cell: ({ row }) => <span className='font-black'>{row.original.Module}</span>,
    },
    {
      accessorKey: 'Description',
      header: t('adminLogTable.colDescription'),
      cell: ({ row }) => (
        <span className='line-clamp-2 min-w-[14rem] max-w-[22rem] text-sm font-bold'>
          {row.original.Description || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'OldData',
      header: t('adminLogTable.colOldData'),
      cell: ({ row }) => (
        <span
          className='line-clamp-2 min-w-[14rem] max-w-[22rem] font-mono text-xs font-bold text-[#111]/70'
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
          className='line-clamp-2 min-w-[14rem] max-w-[22rem] font-mono text-xs font-bold text-[#111]/70'
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
        <span className='font-mono text-sm font-bold tabular-nums text-[#111]/70'>
          {row.original.IPAddress || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'UserAgent',
      header: t('adminLogTable.colUserAgent'),
      cell: ({ row }) => (
        <span className='line-clamp-2 min-w-[14rem] max-w-[24rem] text-xs font-bold text-[#111]/70'>
          {row.original.UserAgent || '—'}
        </span>
      ),
    },
  ]
}
