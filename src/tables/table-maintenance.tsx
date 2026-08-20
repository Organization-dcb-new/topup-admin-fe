import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { DeleteMaintenanceModal } from '@/components/Maintenance/DeleteMaintenanceModal'
import { EditMaintenanceModal } from '@/components/Maintenance/EditMaintenanceModal'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import { nbAccent, nbBadge } from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { Maintenance } from '@/types/maintenance'

export const getMaintenanceColumns = (t: TFunction): ColumnDef<Maintenance>[] => [
  {
    accessorKey: 'name',
    header: t('maintenanceTable.colName'),
    cell: ({ row }) => (
      <div className='max-w-[14rem] font-black sm:max-w-xs' title={row.original.name}>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'is_maintenance',
    header: t('maintenanceTable.colStatus'),
    cell: ({ row }) => (
      <span
        className={cn(nbBadge, row.original.is_maintenance ? nbAccent.red : nbAccent.lime)}
      >
        {row.original.is_maintenance
          ? t('maintenanceTable.statusMaintenance')
          : t('maintenanceTable.statusNormal')}
      </span>
    ),
  },
  {
    id: 'start_time',
    header: t('maintenanceTable.colStart'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm font-bold tabular-nums'>
        {formatMaintenanceInstant(row.original.start_time)}
      </span>
    ),
  },
  {
    id: 'end_time',
    header: t('maintenanceTable.colEnd'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm font-bold tabular-nums'>
        {formatMaintenanceInstant(row.original.end_time)}
      </span>
    ),
  },
  {
    id: 'updated_at',
    header: t('maintenanceTable.colUpdatedAt'),
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-xs font-bold tabular-nums text-[#111]/70'>
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
          className='block max-w-[10rem] truncate text-xs font-bold sm:max-w-[12rem]'
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
          className='block max-w-[10rem] truncate text-xs font-bold sm:max-w-[12rem]'
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
      <div
        className='flex min-w-0 flex-wrap items-center gap-2'
        role='group'
        aria-label={t('maintenanceTable.rowActionsAria', { name: row.original.name })}
      >
        <EditMaintenanceModal maintenance={row.original} />
        <DeleteMaintenanceModal id={row.original.id} name={row.original.name} />
      </div>
    ),
  },
]
