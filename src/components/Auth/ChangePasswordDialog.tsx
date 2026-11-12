import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'

import { api } from '@/api/axios'
import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { PasswordInput } from '@/components/Auth/PasswordInput'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useCooldown } from '@/hooks/useCooldown'
import { refreshAuthSession, useAuthUser } from '@/lib/auth'
import { toAuthError } from '@/lib/auth-error'
import { ADMIN_PASSWORD_MIN, makeChangePasswordSchema, type ChangePasswordFormValues } from '@/schemas/admin'

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Radix unmounts the content once closed, so typed passwords never linger between openings. */}
        <ChangePasswordForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const queryClient = useQueryClient()
  const { user } = useAuthUser()
  const email: string | undefined = user?.email
  const cooldown = useCooldown()
  const schema = useMemo(() => makeChangePasswordSchema(email), [email])

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })

  // A wrong current password answers 401, which must not end the session through the global redirect.
  const change = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      api.post(
        '/admin/change-password',
        { current_password: values.current_password, new_password: values.new_password },
        { skipAuthRedirect: true }
      ),
    onSuccess: async () => {
      // The backend set a fresh cookie for this browser and signed every other session out.
      await refreshAuthSession(queryClient)
      toast.success(t('changePassword.success'))
      onDone()
    },
    onError: (err) => {
      const authError = toAuthError(err, 'changePassword.error')
      if (authError.retryAfter) cooldown.start(authError.retryAfter)
      if (authError.key === 'authErrors.wrongPassword') {
        resetField('current_password')
        setError('current_password', { message: 'authErrors.wrongPassword' })
        setFocus('current_password')
        return
      }
      // Any other 401 is an ended session; re-checking it lets the route guard send the admin to login.
      if (isAxiosError(err) && err.response?.status === 401) void refreshAuthSession(queryClient)
      // A 400 is the password policy, in the backend's own words.
      if (isAxiosError(err) && err.response?.status === 400 && authError.detail) {
        setError('new_password', { message: authError.detail })
        setFocus('new_password')
        return
      }
      setError('root', { message: authError.detail ?? t(authError.key) })
    },
  })

  const field = (name: keyof ChangePasswordFormValues, autoComplete: string, describedBy?: string) => ({
    id: `${ids}-${name}`,
    autoComplete,
    invalid: !!errors[name],
    'aria-describedby': describedBy,
    ...register(name),
  })

  // Schema errors are i18n keys; the backend's policy text arrives already worded.
  const message = (value: string) => (/^(changePassword|authErrors)\./.test(value) ? t(value) : value)

  return (
    <form noValidate onSubmit={handleSubmit((values) => change.mutate(values))} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <KeyRound className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('changePassword.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('changePassword.title')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('changePassword.description')}
          </DialogDescription>
        </div>
      </div>

      {errors.root?.message && <AuthAlert>{errors.root.message}</AuthAlert>}

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-current_password`} className={hudLabelClass}>
            {t('changePassword.currentLabel')}
          </Label>
          <PasswordInput autoFocus {...field('current_password', 'current-password')} />
          {errors.current_password?.message && (
            <FieldMessage tone='error'>{message(errors.current_password.message)}</FieldMessage>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-new_password`} className={hudLabelClass}>
            {t('changePassword.newLabel')}
          </Label>
          <PasswordInput {...field('new_password', 'new-password', `${ids}-new-hint`)} />
          {errors.new_password?.message ? (
            <FieldMessage tone='error'>{message(errors.new_password.message)}</FieldMessage>
          ) : (
            <p id={`${ids}-new-hint`} className='text-xs text-slate-500'>
              {t('changePassword.newHint', { count: ADMIN_PASSWORD_MIN })}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-confirm_password`} className={hudLabelClass}>
            {t('changePassword.confirmLabel')}
          </Label>
          <PasswordInput {...field('confirm_password', 'new-password')} />
          {errors.confirm_password?.message && (
            <FieldMessage tone='error'>{message(errors.confirm_password.message)}</FieldMessage>
          )}
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={change.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('changePassword.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={change.isPending} pendingLabel={t('changePassword.saving')} cooldown={cooldown.remaining}>
            {t('changePassword.submit')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
