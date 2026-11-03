import { useId, useState } from 'react'
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, KeyRound, UserPlus } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { serverMessage, useCreateAdmin } from '@/hooks/useAdmin'
import { useRoleOptions } from '@/hooks/useRoles'
import { cn } from '@/lib/utils'
import { createAdminSchema, type CreateAdminFormValues } from '@/schemas/admin'
import { RolePicker } from './AdminParts'

/** Backend messages that belong to a single field. */
const FIELD_ERRORS: Record<string, [keyof CreateAdminFormValues, string]> = {
  'Email already registered': ['email', 'adminPage.form.errors.emailTaken'],
  'Username already registered': ['username', 'adminPage.form.errors.usernameTaken'],
  'invalid admin password confirmation': ['confirm_admin_password', 'adminPage.form.errors.confirmInvalid'],
}

export function CreateAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Mounted per opening, so passwords never linger between openings. */}
        {open && <CreateAdminForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CreateAdminForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const roleOptions = useRoleOptions()
  const create = useCreateAdmin(onDone)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    control,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: roleOptions.some((o) => o.slug === 'admin') ? 'admin' : (roleOptions[0]?.slug ?? 'admin'),
      confirm_admin_password: '',
    },
  })
  const role = useWatch({ control, name: 'role' })

  const onSubmit = (values: CreateAdminFormValues) => {
    const roleId = roleOptions.find((o) => o.slug === values.role)?.id
    create.mutate(
      { ...values, ...(roleId && { role_id: roleId }) },
      {
        onError: (err) => {
          const known = FIELD_ERRORS[serverMessage(err) ?? '']
          if (known) {
            setError(known[0], { message: known[1] })
            setFocus(known[0])
          } else {
            setError('root', { message: 'adminPage.form.errors.generic' })
          }
        },
      }
    )
  }

  const field = (name: 'full_name' | 'username' | 'email') => ({
    id: `${ids}-${name}`,
    'aria-invalid': !!errors[name],
    className: hudInputClass,
    ...register(name),
  })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <UserPlus className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('adminPage.form.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('adminPage.form.title')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('adminPage.form.description')}
          </DialogDescription>
        </div>
      </div>

      {errors.root?.message && <AuthAlert>{t(errors.root.message)}</AuthAlert>}

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-full_name`} className={hudLabelClass}>{t('adminPage.form.fullNameLabel')}</Label>
          <Input autoFocus autoComplete='off' placeholder={t('adminPage.form.fullNamePlaceholder')} {...field('full_name')} />
          {errors.full_name?.message && <FieldMessage tone='error'>{t(errors.full_name.message)}</FieldMessage>}
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-username`} className={hudLabelClass}>{t('adminPage.form.usernameLabel')}</Label>
            <Input autoComplete='off' autoCapitalize='none' spellCheck={false} placeholder='budisantoso' {...field('username')} />
            {errors.username?.message && <FieldMessage tone='error'>{t(errors.username.message)}</FieldMessage>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`${ids}-email`} className={hudLabelClass}>{t('adminPage.form.emailLabel')}</Label>
            <Input type='email' autoComplete='off' placeholder='admin@pakargaming.id' {...field('email')} />
            {errors.email?.message && <FieldMessage tone='error'>{t(errors.email.message)}</FieldMessage>}
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-password`} className={hudLabelClass}>{t('adminPage.form.passwordLabel')}</Label>
          <PasswordInput
            id={`${ids}-password`}
            autoComplete='new-password'
            invalid={!!errors.password}
            describedBy={`${ids}-password-hint`}
            registration={register('password')}
          />
          {errors.password?.message ? (
            <FieldMessage tone='error'>{t(errors.password.message)}</FieldMessage>
          ) : (
            <p id={`${ids}-password-hint`} className='text-xs text-slate-500'>{t('adminPage.form.passwordHint')}</p>
          )}
        </div>
      </div>

      <fieldset className='space-y-2'>
        <legend className={cn(hudLabelClass, 'mb-2')}>{t('adminPage.form.roleLabel')}</legend>
        <RolePicker
          options={roleOptions}
          value={role}
          onChange={(slug) => setValue('role', slug, { shouldDirty: true })}
          label={t('adminPage.form.roleLabel')}
        />
      </fieldset>

      <div className='space-y-2 rounded-md border border-amber-200 bg-amber-50/60 p-4'>
        <Label htmlFor={`${ids}-confirm`} className='flex items-center gap-2 text-sm font-semibold text-slate-800'>
          <KeyRound className='size-4 text-amber-600' aria-hidden />
          {t('adminPage.form.confirmLabel')}
        </Label>
        <p className='text-xs leading-relaxed text-slate-600'>{t('adminPage.form.confirmHint')}</p>
        <PasswordInput
          id={`${ids}-confirm`}
          autoComplete='current-password'
          invalid={!!errors.confirm_admin_password}
          registration={register('confirm_admin_password')}
        />
        {errors.confirm_admin_password?.message && (
          <FieldMessage tone='error'>{t(errors.confirm_admin_password.message)}</FieldMessage>
        )}
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={create.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('adminPage.form.cancel')}
        </button>
        <div className='sm:w-52'>
          <AuthSubmitButton pending={create.isPending} pendingLabel={t('adminPage.form.creating')} cooldown={0}>
            {t('adminPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}

interface PasswordInputProps {
  id: string
  autoComplete: string
  invalid: boolean
  describedBy?: string
  registration: UseFormRegisterReturn
}

function PasswordInput({ id, autoComplete, invalid, describedBy, registration }: PasswordInputProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const label = visible ? t('adminPage.form.hidePassword') : t('adminPage.form.showPassword')

  return (
    <div className='relative'>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(hudInputClass, 'bg-white pr-11')}
        {...registration}
      />
      <button
        type='button'
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        className='absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition-colors hover:text-brand-purple focus-visible:text-brand-purple focus-visible:outline-none'
      >
        {visible ? <EyeOff className='size-4' aria-hidden /> : <Eye className='size-4' aria-hidden />}
      </button>
    </div>
  )
}
