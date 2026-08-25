import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { AdminUser } from '@/types/admin'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { UpdateAdminRole } from '@/components/Admin/Update'
import { DeleteAdminButton } from '@/components/Admin/Delete'
import { cn } from '@/lib/utils'

/**
 * Role sistem punya warna sendiri; role custom memakai gaya netral.
 * Sejak RBAC, slug bisa apa saja, jadi `default` bukan lagi kasus mustahil.
 */
const roleBadgeClass = (slug: string | undefined) => {
  switch (slug) {
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

const roleIconClass = (slug: string | undefined) =>
  slug === 'dev'
    ? 'text-purple-600'
    : slug === 'admin'
      ? 'text-blue-600'
      : 'text-muted-foreground'

// Nama sengaja camelCase: PascalCase membuat react-refresh
// menganggapnya komponen, padahal ini hanya pemilih ikon.
const roleIconFor = (slug: string | undefined) =>
  slug === 'dev' ? ShieldAlert : slug === 'admin' ? ShieldCheck : Shield

export const getAdminColumns = (
  t: TFunction,
  currentAdminId: string | null,
  canUpdateRole: boolean,
  canDelete: boolean,
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'username',
    header: t('adminTable.colUsername'),
    cell: ({ row }) => (
      <div className='font-medium text-gray-900'>{row.original.username}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: t('adminTable.colEmail'),
    cell: ({ row }) => (
      <div className='max-w-[14rem] truncate font-medium text-gray-900 sm:max-w-xs'>
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: t('adminTable.colRole'),
    cell: ({ row }) => {
      const slug = row.original.role
      // Untuk role custom backend mengisi `role` dengan "custom" — itu nilai
      // teknis jalur rollback, bukan untuk ditampilkan.
      const label = row.original.role_name || slug
      return (
        <div className='flex items-center gap-2'>
          {(() => {
            const Icon = roleIconFor(slug)
            return (
              <Icon
                className={cn('h-4 w-4 shrink-0', roleIconClass(slug))}
                aria-hidden
              />
            )
          })()}
          <Badge
            variant='outline'
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide',
              roleBadgeClass(slug),
            )}
          >
            {label}
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
        <Badge variant='success' className='font-medium'>
          {t('adminTable.enabled')}
        </Badge>
      ) : (
        <Badge variant='outline' className='border-border font-medium text-muted-foreground'>
          {t('adminTable.disabled')}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: t('adminTable.colActions'),
    cell: ({ row }) => {
      const isSelf = !!currentAdminId && row.original.id === currentAdminId
      return (
        <div className='flex flex-wrap items-center gap-2'>
          {canUpdateRole && (
            <UpdateAdminRole
              id={row.original.id}
              currentRoleId={row.original.role_id}
              currentRoleName={row.original.role_name || row.original.role}
              isSelf={isSelf}
              selfHint={t('adminTable.selfRoleHint')}
            />
          )}
          {canDelete && !isSelf && (
            <DeleteAdminButton id={row.original.id} email={row.original.email} />
          )}
        </div>
      )
    },
  },
]
