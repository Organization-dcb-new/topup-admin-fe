import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { AdminUser } from '@/types/admin'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UpdateAdminRole } from '@/components/Admin/Update'
import { DeleteAdminButton } from '@/components/Admin/Delete'
import { cn } from '@/lib/utils'

const roleBadgeClass = (role: string | undefined) => {
  switch (role) {
    case 'dev':
      return 'border-purple-200 bg-purple-50 text-purple-800'
    case 'admin':
      return 'border-blue-200 bg-blue-50 text-blue-800'
    case 'noc':
      return 'border-border bg-muted/50 text-muted-foreground'
    default:
      return 'border-border bg-muted/30 text-foreground'
  }
}

export const getAdminColumns = (t: TFunction): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'username',
    header: t('adminTable.colUsername'),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">{row.original.username}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: t('adminTable.colEmail'),
    cell: ({ row }) => (
      <div className="max-w-[14rem] truncate font-medium text-gray-900 sm:max-w-xs">
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: t('adminTable.colRole'),
    cell: ({ row }) => {
      const role = row.original.role
      return (
        <div className="flex items-center gap-2">
          {role === 'dev' && (
            <ShieldAlert className="h-4 w-4 shrink-0 text-purple-600" aria-hidden />
          )}
          {role === 'admin' && (
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
          )}
          {role === 'noc' && <Shield className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
          <Badge
            variant="outline"
            className={cn('text-[10px] font-semibold uppercase tracking-wide', roleBadgeClass(role))}
          >
            {role}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'two_factor_enabled',
    header: t('adminTable.colTwoFactor'),
    cell: ({ row }) => {
      const enabled = row.original.two_factor_enabled
      return enabled ? (
        <Badge variant="success" className="font-medium">
          {t('adminTable.enabled')}
        </Badge>
      ) : (
        <Badge variant="outline" className="border-border font-medium text-muted-foreground">
          {t('adminTable.disabled')}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: t('adminTable.colActions'),
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <UpdateAdminRole id={row.original.id} currentRole={row.original.role} />
        <DeleteAdminButton id={row.original.id} email={row.original.email} />
      </div>
    ),
  },
]
