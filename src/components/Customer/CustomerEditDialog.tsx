import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { MailWarning, UserRoundPen } from 'lucide-react'

import { AuthAlert, AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toCustomerError, useUpdateCustomer } from '@/hooks/useCustomer'
import { useRetained } from '@/hooks/useRetained'
import { cn } from '@/lib/utils'
import { customerEditSchema, type CustomerEditFormValues } from '@/schemas/customer'
import type { CustomerDetail, UpdateCustomerPayload } from '@/types/customer'

/** Backend errors that belong to one field; anything else is shown above the form. */
const FIELD_BY_ERROR: Record<string, keyof CustomerEditFormValues> = {
  'customerPage.errors.nameRequired': 'name',
  'customerPage.errors.nameTooLong': 'name',
  'customerPage.errors.emailTaken': 'email',
  'customerPage.errors.emailInvalid': 'email',
}

interface CustomerEditDialogProps {
  customer: CustomerDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerEditDialog({ customer, open, onOpenChange }: CustomerEditDialogProps) {
  const target = useRetained(open ? customer : null)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Keyed per opening target, so each opening starts from the saved values. */}
        {target && <CustomerEditForm key={target.id} customer={target} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

/** The backend compares emails trimmed and lower-cased. */
function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function CustomerEditForm({ customer, onDone }: { customer: CustomerDetail; onDone: () => void }) {
  const { t } = useTranslation('common')
  const ids = useId()
  const update = useUpdateCustomer(onDone)

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    control,
    formState: { errors },
  } = useForm<CustomerEditFormValues>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: { name: customer.name, email: customer.email },
  })
  const [name, email] = useWatch({ control, name: ['name', 'email'] })
  const nameChanged = name.trim() !== customer.name
  const emailChanged = !sameEmail(email, customer.email)

  const onSubmit = (values: CustomerEditFormValues) => {
    // Send only what changed: an unchanged email must not be re-submitted.
    const payload: UpdateCustomerPayload = {
      ...(values.name !== customer.name && { name: values.name }),
      ...(!sameEmail(values.email, customer.email) && { email: values.email }),
    }
    if (!payload.name && !payload.email) {
      setError('root', { message: 'customerPage.errors.nothingToUpdate' })
      return
    }
    update.mutate(
      { id: customer.id, payload },
      {
        onError: (err) => {
          const error = toCustomerError(err)
          const field = Object.hasOwn(FIELD_BY_ERROR, error.key) ? FIELD_BY_ERROR[error.key] : undefined
          if (field) {
            setError(field, { message: error.key })
            setFocus(field)
          } else {
            setError('root', { message: error.key })
          }
        },
      }
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <UserRoundPen className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('customerPage.edit.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {t('customerPage.edit.title')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('customerPage.edit.description')}
          </DialogDescription>
        </div>
      </div>

      {errors.root?.message && <AuthAlert>{t(errors.root.message)}</AuthAlert>}

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-name`} className={hudLabelClass}>
            {t('customerPage.edit.nameLabel')}
          </Label>
          <Input
            id={`${ids}-name`}
            autoFocus
            autoComplete='off'
            maxLength={100}
            placeholder={t('customerPage.edit.namePlaceholder')}
            aria-invalid={!!errors.name}
            className={hudInputClass}
            {...register('name')}
          />
          {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor={`${ids}-email`} className={hudLabelClass}>
            {t('customerPage.edit.emailLabel')}
          </Label>
          <Input
            id={`${ids}-email`}
            type='email'
            autoComplete='off'
            autoCapitalize='none'
            spellCheck={false}
            maxLength={254}
            aria-invalid={!!errors.email}
            aria-describedby={`${ids}-email-note`}
            className={hudInputClass}
            {...register('email')}
          />
          {errors.email?.message && <FieldMessage tone='error'>{t(errors.email.message)}</FieldMessage>}
        </div>

        {/* Always visible, so the consequences are known before typing; it lights up once the email differs. */}
        <div
          id={`${ids}-email-note`}
          className={cn(
            'flex gap-3 rounded-md border px-3.5 py-3 text-xs leading-relaxed transition-colors duration-300',
            emailChanged ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'
          )}
        >
          <MailWarning
            className={cn('mt-0.5 size-4 shrink-0', emailChanged ? 'text-amber-600' : 'text-slate-400')}
            aria-hidden
          />
          <div className='min-w-0 space-y-1.5'>
            <p className='font-semibold'>{t('customerPage.edit.emailNoteTitle')}</p>
            <ul className='list-disc space-y-1 pl-4'>
              <li>{t('customerPage.edit.emailNoteUnverified')}</li>
              <li>{t('customerPage.edit.emailNoteOrders', { email: customer.email })}</li>
              <li>{t('customerPage.edit.emailNoteSession')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={update.isPending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('customerPage.edit.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton
            pending={update.isPending}
            pendingLabel={t('customerPage.edit.saving')}
            cooldown={0}
            disabled={!nameChanged && !emailChanged}
          >
            {t('customerPage.edit.save')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
