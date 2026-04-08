import type { ColumnDef } from '@tanstack/react-table'
import { DeleteMaintenanceModal } from '@/components/Maintenance/DeleteMaintenanceModal'
import { EditMaintenanceModal } from '@/components/Maintenance/EditMaintenanceModal'
import { Badge } from '@/components/ui/badge'
import { formatMaintenanceInstant } from '@/helpers/maintenance-datetime'
import type { Maintenance } from '@/types/maintenance'

export const maintenanceColumns: ColumnDef<Maintenance>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => (
      <div className="max-w-[14rem] font-medium text-gray-900 sm:max-w-xs" title={row.original.name}>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'is_maintenance',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_maintenance ? 'destructive' : 'secondary'} className="font-normal">
        {row.original.is_maintenance ? 'Pemeliharaan' : 'Normal'}
      </Badge>
    ),
  },
  {
    id: 'start_time',
    header: 'Mulai',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-foreground">
        {formatMaintenanceInstant(row.original.start_time)}
      </span>
    ),
  },
  {
    id: 'end_time',
    header: 'Selesai',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-foreground">
        {formatMaintenanceInstant(row.original.end_time)}
      </span>
    ),
  },
  {
    id: 'updated_at',
    header: 'Diperbarui',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatMaintenanceInstant(row.original.updated_at)}
      </span>
    ),
  },
  {
    accessorKey: 'created_by',
    header: 'Dibuat oleh',
    cell: ({ row }) => {
      const v = row.original.created_by?.trim()
      return (
        <span
          className="block max-w-[10rem] truncate text-xs text-foreground sm:max-w-[12rem]"
          title={v || undefined}
        >
          {v || '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'updated_by',
    header: 'Diperbarui oleh',
    cell: ({ row }) => {
      const v = row.original.updated_by?.trim()
      return (
        <span
          className="block max-w-[10rem] truncate text-xs text-foreground sm:max-w-[12rem]"
          title={v || undefined}
        >
          {v || '—'}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={`Aksi untuk ${row.original.name}`}
        >
          <EditMaintenanceModal maintenance={row.original} />
          <DeleteMaintenanceModal id={row.original.id} name={row.original.name} />
        </div>
      </div>
    ),
  },
]
