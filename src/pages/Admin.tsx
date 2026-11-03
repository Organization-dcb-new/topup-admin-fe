import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Lock, Plus, RefreshCw, Trash2, UserCog, Users } from 'lucide-react'

import { AdminAvatar, RoleChip, TwoFactorChip } from '@/components/Admin/AdminParts'
import { ChangeRoleDialog } from '@/components/Admin/ChangeRoleDialog'
import { CreateAdminDialog } from '@/components/Admin/CreateAdminDialog'
import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { PERM } from '@/constants/permissions'
import { useAdminData, useAdminMutation } from '@/hooks/useAdmin'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { AdminUser } from '@/types/admin'
import { useRetained } from '@/hooks/useRetained'

const PAGE_SIZE = 24

export default function AdminManagementPage() {
  const { t, i18n } = useTranslation('common')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, refetch } = useAdminData(page, PAGE_SIZE)
  const { deleteAdmin } = useAdminMutation()
  const { user } = useAuthUser()
  const [createOpen, setCreateOpen] = useState(false)
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null)
  const [toDelete, setToDelete] = useState<AdminUser | null>(null)
  // The confirm dialog keeps naming its target while it animates closed.
  const deleting = useRetained(toDelete)

  const admins = data?.data ?? []
  const total = data?.meta?.total_data

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('adminPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('adminPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('adminPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('adminPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            <Can permission={PERM.roleView}>
              <Link
                to='/roles'
                className='inline-flex h-11 items-center gap-2 bg-white px-4 font-display text-xs font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
              >
                <UserCog className='size-4' aria-hidden />
                {t('adminPage.manageRoles')}
              </Link>
            </Can>
            <Can permission={PERM.adminCreate}>
              <button type='button' onClick={() => setCreateOpen(true)} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('adminPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('adminPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('adminPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && admins.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Users className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('adminPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('adminPage.emptyBody')}</p>
          </div>
        ) : (
          <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} className='h-52 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />
              ))}
            {admins.map((admin, index) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                isSelf={admin.id === user?.id}
                order={index}
                onChangeRole={() => setRoleTarget(admin)}
                onDelete={() => setToDelete(admin)}
              />
            ))}
          </ul>
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>

      <CreateAdminDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ChangeRoleDialog admin={roleTarget} onOpenChange={(open) => !open && setRoleTarget(null)} />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('adminPage.deleteConfirm.eyebrow')}
        title={t('adminPage.deleteConfirm.title', { name: deleting?.username ?? '' })}
        description={t('adminPage.deleteConfirm.description', { email: deleting?.email ?? '' })}
        confirmLabel={t('adminPage.deleteConfirm.confirm')}
        cancelLabel={t('adminPage.deleteConfirm.cancel')}
        pending={deleteAdmin.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteAdmin.mutate(toDelete.id, {
            onSuccess: () => {
              setToDelete(null)
              if (admins.length === 1 && page > 1) setPage((p) => p - 1)
            },
          })
        }}
      />
    </DashboardLayout>
  )
}

interface AdminCardProps {
  admin: AdminUser
  isSelf: boolean
  order: number
  onChangeRole: () => void
  onDelete: () => void
}

function AdminCard({ admin, isSelf, order, onChangeRole, onDelete }: AdminCardProps) {
  const { t } = useTranslation('common')

  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div
        className={cn(
          'h-full p-px transition-colors duration-300 hud-clip',
          isSelf ? 'bg-brand-purple/40' : 'bg-slate-200/80 hover:bg-brand-purple/40'
        )}
      >
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-3'>
              <AdminAvatar name={admin.username} />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h2 className='truncate font-display text-lg font-bold text-slate-900'>{admin.username}</h2>
                  {isSelf && (
                    <span className='shrink-0 bg-brand-purple px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-[0.15em] text-white hud-clip-sm'>
                      {t('adminPage.you')}
                    </span>
                  )}
                </div>
                <p className='truncate text-sm text-slate-500' title={admin.email}>{admin.email}</p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <RoleChip slug={admin.role} name={admin.role_name} />
              <TwoFactorChip enabled={admin.two_factor_enabled} />
            </div>

            <div className='mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4'>
              <span className='min-w-0 truncate text-xs text-slate-500'>
                {admin.created_at && t('adminPage.joined', { date: formatBackendDateTime(admin.created_at, 'dd MMM yyyy') })}
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                {isSelf ? (
                  <span
                    className='inline-flex h-8 items-center gap-1.5 px-2 text-[11px] text-slate-400'
                    title={t('adminPage.selfLocked')}
                  >
                    <Lock className='size-3.5' aria-hidden />
                    <span className='sr-only'>{t('adminPage.selfLocked')}</span>
                  </span>
                ) : (
                  <>
                    <Can permission={PERM.adminUpdate}>
                      <button
                        type='button'
                        onClick={onChangeRole}
                        className='group/role inline-flex h-8 items-center gap-1.5 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                      >
                        {t('adminPage.changeRole')}
                        <ArrowRight
                          className='size-3.5 transition-transform duration-300 ease-hud group-hover/role:translate-x-0.5'
                          aria-hidden
                        />
                      </button>
                    </Can>
                    <Can permission={PERM.adminDelete}>
                      <button
                        type='button'
                        onClick={onDelete}
                        aria-label={t('adminPage.deleteBtn', { name: admin.username })}
                        title={t('adminPage.deleteBtn', { name: admin.username })}
                        className='grid size-8 place-items-center text-slate-400 hud-clip-sm transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500/30'
                      >
                        <Trash2 className='size-4' aria-hidden />
                      </button>
                    </Can>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}
