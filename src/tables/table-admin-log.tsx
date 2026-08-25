import { formatBackendDateTime } from '@/lib/backend-datetime'
import { hasSnapshot } from '@/lib/json-diff'
import type { AdminLog } from '@/types/admin-log'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { ChevronRight, FileDiff } from 'lucide-react'
import { ActionBadge, ModuleBadge } from '@/components/AdminLog/LogBadges'

interface AdminLogColumnOptions {
  t: TFunction
  /** UUID → nama admin; jatuh ke potongan UUID bila belum termuat */
  adminName: (adminId: string) => string
  onOpenDetail: (log: AdminLog) => void
}

/**
 * Kolom sengaja dipangkas dari sembilan menjadi lima. Dua di antaranya dulu
 * berisi `JSON.stringify` mentah dan satu berisi user-agent penuh, yang
 * memaksa tabel melebar jauh dan tetap tidak terbaca. Semuanya kini ada di
 * drawer detail dalam bentuk perbandingan per field.
 */
export function getAdminLogColumns({
  t,
  adminName,
  onOpenDetail,
}: AdminLogColumnOptions): ColumnDef<AdminLog>[] {
  return [
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
      accessorKey: 'AdminID',
      header: t('adminLogTable.colActor'),
      cell: ({ row }) => (
        <span className='block max-w-44 truncate text-sm font-medium text-foreground'>
          {adminName(row.original.AdminID)}
        </span>
      ),
    },
    {
      accessorKey: 'Action',
      header: t('adminLogTable.colAction'),
      cell: ({ row }) => (
        <div className='flex flex-wrap items-center gap-1.5'>
          <ActionBadge action={row.original.Action} />
          <ModuleBadge module={row.original.Module} />
        </div>
      ),
    },
    {
      accessorKey: 'Description',
      header: t('adminLogTable.colDescription'),
      cell: ({ row }) => {
        const withSnapshot = hasSnapshot(
          row.original.OldData,
          row.original.NewData,
        )
        return (
          <div className='flex min-w-56 max-w-96 items-start gap-2'>
            <span className='line-clamp-2 min-w-0 text-sm text-muted-foreground'>
              {row.original.Description || '—'}
            </span>
            {withSnapshot && (
              <span
                className='mt-0.5 shrink-0 text-muted-foreground'
                title={t('adminLogTable.hasSnapshot')}
              >
                <FileDiff className='h-3.5 w-3.5' aria-hidden />
                <span className='sr-only'>{t('adminLogTable.hasSnapshot')}</span>
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>{t('adminLogTable.colDetail')}</span>,
      cell: ({ row }) => (
        <button
          type='button'
          onClick={() => onOpenDetail(row.original)}
          className='flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {t('adminLogTable.colDetail')}
          <ChevronRight className='h-3.5 w-3.5' aria-hidden />
        </button>
      ),
    },
  ]
}
