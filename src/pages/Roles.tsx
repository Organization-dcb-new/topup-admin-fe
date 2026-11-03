import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Lock, Plus, Trash2, UserCog, Users } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DeleteRoleDialog } from '@/components/Roles/DeleteRoleDialog'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { roleErrorKey, useRoles } from '@/hooks/useRoles'
import type { Role } from '@/types/role'

const TOTAL_PERMISSIONS = Object.keys(PERM).length

export default function RolesPage() {
  const { t } = useTranslation()
  const { data: roles, isLoading, error } = useRoles()
  const [toDelete, setToDelete] = useState<Role | null>(null)
  const loadError = error ? roleErrorKey(error) : null

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('rolesPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>
              {t('rolesPage.title')}
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('rolesPage.subtitle')}</p>
          </div>
          <Can permission={PERM.roleCreate}>
            <Link to='/roles/new' className={hudPrimaryButtonClass}>
              <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
              <Plus className='size-4' aria-hidden />
              {t('rolesPage.newRole')}
            </Link>
          </Can>
        </header>

        {loadError && <AuthAlert>{loadError.detail ?? t(loadError.key)}</AuthAlert>}

        <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {isLoading &&
            [0, 1, 2].map((i) => (
              <li key={i} className='h-64 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
            ))}
          {roles?.map((role, index) => (
            <RoleCard key={role.id} role={role} order={index} onDelete={setToDelete} />
          ))}
        </ul>
      </div>

      <DeleteRoleDialog role={toDelete} onOpenChange={(open) => !open && setToDelete(null)} />
    </DashboardLayout>
  )
}

interface RoleCardProps {
  role: Role
  order: number
  onDelete: (role: Role) => void
}

function RoleCard({ role, order, onDelete }: RoleCardProps) {
  const { t } = useTranslation()
  const { can } = usePermissions()
  const share = Math.min(100, Math.round((role.permission_count / TOTAL_PERMISSIONS) * 100))
  // The backend refuses both; say why instead of letting the request fail.
  const deleteBlocked = role.is_system
    ? t('rolesPage.deleteBlockedSystem')
    : role.admin_count > 0
      ? t('rolesPage.deleteBlockedInUse', { count: role.admin_count })
      : null

  return (
    <li
      className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <div className='flex h-full flex-col bg-white hud-clip'>
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-3'>
              <span className='grid size-10 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <UserCog className='size-5' aria-hidden />
              </span>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h2 className='truncate font-display text-lg font-bold text-slate-900'>{role.name}</h2>
                  {role.is_system && (
                    <span className='inline-flex shrink-0 items-center gap-1 bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 hud-clip-sm'>
                      <Lock className='size-3' aria-hidden />
                      {t('rolesPage.system')}
                    </span>
                  )}
                </div>
                <p className='font-mono text-xs text-slate-400'>{role.slug}</p>
              </div>
            </div>

            <p className='line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500'>
              {role.description || t('rolesPage.noDescription')}
            </p>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
                  {t('rolesPage.permissions')}
                </span>
                <span className='font-semibold tabular-nums text-slate-700'>
                  {role.permission_count} / {TOTAL_PERMISSIONS}
                </span>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-linear-to-r from-brand-purple to-brand-cyan'
                  style={{ width: `${share}%` }}
                />
              </div>
            </div>

            <div className='mt-auto flex items-center justify-between border-t border-slate-100 pt-4'>
              <span className='inline-flex items-center gap-1.5 text-xs text-slate-500'>
                <Users className='size-3.5' aria-hidden />
                {t('rolesPage.adminCount', { count: role.admin_count })}
              </span>
              <div className='flex items-center gap-1'>
                <Can permission={PERM.roleDelete}>
                  <span title={deleteBlocked ?? undefined}>
                    <button
                      type='button'
                      onClick={() => onDelete(role)}
                      disabled={!!deleteBlocked}
                      aria-label={t('rolesPage.deleteRole', { name: role.name })}
                      className='grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400'
                    >
                      <Trash2 className='size-4' aria-hidden />
                    </button>
                  </span>
                </Can>
                <Link
                  to={`/roles/${role.id}`}
                  className='group/link inline-flex h-8 items-center gap-1.5 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                >
                  {can(PERM.roleUpdate) ? t('rolesPage.edit') : t('rolesPage.view')}
                  <ArrowRight
                    className='size-3.5 transition-transform duration-300 ease-hud group-hover/link:translate-x-0.5'
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
