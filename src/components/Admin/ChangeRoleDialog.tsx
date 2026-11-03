import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useAdminMutation } from '@/hooks/useAdmin'
import { useRoleOptions } from '@/hooks/useRoles'
import { cn } from '@/lib/utils'
import type { AdminUser } from '@/types/admin'
import { AdminAvatar, RolePicker } from './AdminParts'

interface ChangeRoleDialogProps {
  admin: AdminUser | null
  onOpenChange: (open: boolean) => void
}

export function ChangeRoleDialog({ admin, onOpenChange }: ChangeRoleDialogProps) {
  const { updateRole } = useAdminMutation()
  const pending = updateRole.isPending

  return (
    <Dialog open={!!admin} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Keyed per admin, so the picker starts from that admin's current role. */}
        {admin && (
          <ChangeRoleForm
            key={admin.id}
            admin={admin}
            pending={pending}
            onCancel={() => onOpenChange(false)}
            onSubmit={(role, roleId) =>
              updateRole.mutate({ id: admin.id, role, roleId }, { onSuccess: () => onOpenChange(false) })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ChangeRoleFormProps {
  admin: AdminUser
  pending: boolean
  onCancel: () => void
  onSubmit: (role: string, roleId?: string) => void
}

function ChangeRoleForm({ admin, pending, onCancel, onSubmit }: ChangeRoleFormProps) {
  const { t } = useTranslation()
  const roleOptions = useRoleOptions()
  const [selected, setSelected] = useState(admin.role)

  // Keep the current role listed even when the picker doesn't offer it (e.g. dev).
  const options = roleOptions.some((option) => option.slug === admin.role)
    ? roleOptions
    : [...roleOptions, { slug: admin.role, name: admin.role_name || admin.role }]
  const unchanged = selected === admin.role

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (unchanged) return
        onSubmit(selected, options.find((option) => option.slug === selected)?.id)
      }}
      className='space-y-6 p-6 sm:p-7'
    >
      <div className='space-y-1'>
        <p className={hudEyebrowClass}>{t('adminPage.roleDialog.eyebrow')}</p>
        <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
          {t('adminPage.roleDialog.title')}
        </DialogTitle>
        <DialogDescription className='text-sm leading-relaxed text-slate-500'>
          {t('adminPage.roleDialog.description')}
        </DialogDescription>
      </div>

      <div className='flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2.5'>
        <AdminAvatar name={admin.username} />
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-slate-900'>{admin.username}</p>
          <p className='truncate text-xs text-slate-500'>{admin.email}</p>
        </div>
      </div>

      <RolePicker
        options={options}
        value={selected}
        onChange={setSelected}
        current={admin.role}
        label={t('adminPage.roleDialog.title')}
      />

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onCancel}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('adminPage.roleDialog.cancel')}
        </button>
        <button
          type='submit'
          disabled={unchanged || pending}
          className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none disabled:opacity-50 sm:w-52')}
        >
          <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
          {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
          {pending ? t('adminPage.roleDialog.saving') : t('adminPage.roleDialog.confirm')}
        </button>
      </div>
    </form>
  )
}
