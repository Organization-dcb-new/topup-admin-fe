import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Loader2, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { roleErrorKey, useDeleteRole } from '@/hooks/useRoles'
import type { Role } from '@/types/role'

interface DeleteRoleDialogProps {
  role: Pick<Role, 'id' | 'name'> | null
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteRoleDialog({ role, onOpenChange, onDeleted }: DeleteRoleDialogProps) {
  const { t } = useTranslation()
  const deleteRole = useDeleteRole()
  const error = deleteRole.error ? roleErrorKey(deleteRole.error) : null

  const close = (open: boolean) => {
    if (deleteRole.isPending) return
    if (!open) deleteRole.reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={!!role} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='space-y-6 p-6 sm:p-7'>
          <div className='flex items-start gap-4'>
            <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-rose-500 to-brand-purple text-white hud-clip-sm'>
              <Trash2 className='size-5' aria-hidden />
            </span>
            <div className='min-w-0 space-y-1'>
              <p className={hudEyebrowClass}>{t('rolesPage.deleteEyebrow')}</p>
              <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
                {t('rolesPage.deleteTitle', { name: role?.name ?? '' })}
              </DialogTitle>
              <DialogDescription className='text-sm leading-relaxed text-slate-500'>
                {t('rolesPage.deleteDescription')}
              </DialogDescription>
            </div>
          </div>

          {error && <AuthAlert>{error.detail ?? t(error.key)}</AuthAlert>}

          {/* Cancel first in the DOM so it, not the destructive action, gets the initial focus. */}
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              onClick={() => close(false)}
              disabled={deleteRole.isPending}
              className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
            >
              {t('rolesPage.cancel')}
            </button>
            <button
              type='button'
              disabled={deleteRole.isPending}
              onClick={() => {
                if (!role) return
                deleteRole.mutate(role.id, {
                  onSuccess: () => {
                    toast.success(t('rolesPage.deleted', { name: role.name }))
                    deleteRole.reset()
                    onOpenChange(false)
                    onDeleted?.()
                  },
                })
              }}
              className='inline-flex h-12 w-full items-center justify-center gap-2 bg-rose-600 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 active:scale-[0.985] disabled:opacity-70 sm:w-48'
            >
              {deleteRole.isPending ? (
                <Loader2 className='size-4 animate-spin' aria-hidden />
              ) : (
                <Trash2 className='size-4' aria-hidden />
              )}
              {t('rolesPage.delete')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
