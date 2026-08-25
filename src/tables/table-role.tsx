import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { ShieldCheck, SquarePen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteRoleButton } from '@/components/Role/DeleteRole'
import type { Role } from '@/types/permission'

export const getRoleColumns = (
  t: TFunction,
  onEdit: (role: Role) => void,
  canUpdate: boolean,
  canDelete: boolean,
): ColumnDef<Role>[] => [
  {
    accessorKey: 'name',
    header: t('rolePage.colName'),
    cell: ({ row }) => (
      <div className='min-w-0 space-y-0.5'>
        <div className='flex items-center gap-2'>
          <span className='font-medium text-gray-900'>{row.original.name}</span>
          {row.original.is_system && (
            <Badge
              variant='outline'
              className='shrink-0 text-[10px] font-semibold uppercase tracking-wide'
            >
              <ShieldCheck className='mr-1 h-3 w-3' aria-hidden />
              {t('rolePage.systemBadge')}
            </Badge>
          )}
        </div>
        <p className='truncate text-xs text-muted-foreground'>
          {row.original.description || row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'permission_count',
    header: t('rolePage.colPermissions'),
    cell: ({ row }) => (
      <span className='tabular-nums text-muted-foreground'>
        {t('rolePage.permissionCount', { count: row.original.permission_count })}
      </span>
    ),
  },
  {
    accessorKey: 'admin_count',
    header: t('rolePage.colAdmins'),
    cell: ({ row }) => (
      <span className='tabular-nums text-muted-foreground'>
        {t('rolePage.adminCount', { count: row.original.admin_count })}
      </span>
    ),
  },
  {
    id: 'actions',
    header: t('rolePage.colActions'),
    cell: ({ row }) => (
      <div className='flex items-center gap-1'>
        {canUpdate && (
          <Button variant='ghost' size='sm' onClick={() => onEdit(row.original)}>
            <SquarePen className='h-4 w-4' aria-hidden />
            <span className='sr-only'>{t('rolePage.editPermissions')}</span>
          </Button>
        )}
        {canDelete && <DeleteRoleButton role={row.original} />}
      </div>
    ),
  },
]
