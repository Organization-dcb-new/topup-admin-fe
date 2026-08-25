import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { DeleteMaintenanceModal } from '@/components/Maintenance/DeleteMaintenanceModal'
import { EditMaintenanceModal } from '@/components/Maintenance/EditMaintenanceModal'
import { Badge } from '@/components/ui/badge'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import type { Maintenance } from '@/types/maintenance'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export const getMaintenanceColumns = (t: TFunction): ColumnDef<Maintenance>[] => [
  {
    accessorKey: 'name',
    header: t('maintenanceTable.colName'),
    cell: ({ row }) => (
      <div className='max-w-[14rem] font-medium text-gray-900 sm:max-w-xs' title={row.original.name}>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'is_maintenance',
    header: t('maintenanceTable.colStatus'),
    cell: ({ row }) => (
      <Badge variant={row.original.is_maintenance ? 'destructive' : 'secondary'} className='font-normal'>
        {row.original.is_maintenance ? t('maintenanceTable.statusMaintenance') : t('maintenanceTable.statusNormal')}
      </Badge>
    ),
  },
  {
    id: 'start_time',
    header: t('maintenanceTable.colStart'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-foreground'>
        {formatMaintenanceInstant(row.original.start_time)}
      </span>
    ),
  },
  {
    id: 'end_time',
    header: t('maintenanceTable.colEnd'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm text-foreground'>
        {formatMaintenanceInstant(row.original.end_time)}
      </span>
    ),
  },
  {
    id: 'updated_at',
    header: t('maintenanceTable.colUpdatedAt'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-xs text-muted-foreground'>
        {formatMaintenanceInstant(row.original.updated_at)}
      </span>
    ),
  },
  {
    accessorKey: 'created_by',
    header: t('maintenanceTable.colCreatedBy'),
    cell: ({ row }) => {
      const v = row.original.created_by?.trim()
      return (
        <span
          className='block max-w-[10rem] truncate text-xs text-foreground sm:max-w-[12rem]'
          title={v || undefined}
        >
          {v || t('maintenanceTable.emptyFallback')}
        </span>
      )
    },
  },
  {
    accessorKey: 'updated_by',
    header: t('maintenanceTable.colUpdatedBy'),
    cell: ({ row }) => {
      const v = row.original.updated_by?.trim()
      return (
        <span
          className='block max-w-[10rem] truncate text-xs text-foreground sm:max-w-[12rem]'
          title={v || undefined}
        >
          {v || t('maintenanceTable.emptyFallback')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: t('maintenanceTable.colActions'),
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center'>
        <div
          className='inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm'
          role='group'
          aria-label={t('maintenanceTable.rowActionsAria', { name: row.original.name })}
        >
          <Can perm={PERM.MAINTENANCE_UPDATE}>
            <EditMaintenanceModal maintenance={row.original} />
          </Can>
          <Can perm={PERM.MAINTENANCE_DELETE}>
            <DeleteMaintenanceModal id={row.original.id} name={row.original.name} />
          </Can>
        </div>
      </div>
    ),
  },
]
