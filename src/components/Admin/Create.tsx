import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateAdmin } from '@/hooks/useAdmin'
import { useRoles } from '@/hooks/useRoles'
import { apiErrorMessage } from '@/lib/api-error'
import type { CreateAdminPayload } from '@/types/admin'

/**
 * POST /admin/users membungkus semua kegagalan sebagai 500 dengan pesan
 * layanan apa adanya, jadi penolakan aturan bisnis tidak bisa dibedakan dari
 * kesalahan internal lewat status. Pesan yang sudah pasti bentuknya dipetakan
 * ke field terkait supaya operator tahu apa yang harus diperbaiki, bukan hanya
 * bahwa "gagal".
 */
const FIELD_ERRORS: Record<string, { field: keyof CreateAdminPayload; key: string }> = {
  'Email already registered': { field: 'email', key: 'adminCreate.emailTaken' },
  'Username already registered': { field: 'username', key: 'adminCreate.usernameTaken' },
  'invalid admin password confirmation': {
    field: 'confirm_admin_password',
    key: 'adminCreate.confirmWrong',
  },
  'role tujuan tidak ditemukan': { field: 'role_id', key: 'adminCreate.roleInvalid' },
  'role_id atau role wajib diisi': { field: 'role_id', key: 'adminCreate.roleRequired' },
}

interface CreateAdminModalProps {
  /** Dipanggil setelah admin baru tersimpan — halaman memakainya untuk kembali ke halaman 1. */
  onCreated?: () => void
}

export const CreateAdminModal = ({ onCreated }: CreateAdminModalProps) => {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  // Dinaikkan tiap kali dialog ditutup: form dipasang ulang dari nol sehingga
  // kata sandi aktor tidak tertinggal di state react-hook-form maupun di DOM.
  const [formKey, setFormKey] = useState(0)

  // Mutasi hidup di sini, bukan di dalam form. Observer react-query berhenti
  // memanggil callback begitu komponennya dilepas, jadi kalau mutasi dimiliki
  // form, menutup dialog saat permintaan masih jalan membuat kegagalan lewat
  // tanpa jejak apa pun.
  const { mutate, isPending } = useCreateAdmin(() => {
    setOpen(false)
    onCreated?.()
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Menutup saat pendaftaran sedang berjalan hanya menyembunyikan
        // prosesnya — hasilnya tetap datang beberapa saat kemudian.
        if (isPending) return
        setOpen(next)
        if (!next) setFormKey((key) => key + 1)
      }}
    >
      <DialogTrigger asChild>
        <Button className='w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto'>
          <Plus className='h-4 w-4 shrink-0' aria-hidden />
          {t('adminCreate.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent
        className='rounded-xl sm:max-w-lg'
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault()
        }}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <CreateAdminForm key={formKey} mutate={mutate} isPending={isPending} />
      </DialogContent>
    </Dialog>
  )
}

const CreateAdminForm = ({
  mutate,
  isPending,
}: {
  mutate: ReturnType<typeof useCreateAdmin>['mutate']
  isPending: boolean
}) => {
  const { t } = useTranslation('common')

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    resetField,
    watch,
    formState: { errors },
  } = useForm<CreateAdminPayload>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      full_name: '',
      role_id: '',
      confirm_admin_password: '',
    },
  })

  const { data: roles = [], isLoading: rolesLoading, isError: rolesError } = useRoles()
  const selectedRoleId = watch('role_id')
  // `/admin/roles` dijaga permission `role.view`, berbeda dari `admin.create`
  // yang membuka halaman ini. Daftar kosong karena itu bukan "tidak ada peran".
  const rolesUnavailable = rolesError || (!rolesLoading && roles.length === 0)

  const submit = (values: CreateAdminPayload) =>
    mutate(values, {
      onError: (err: unknown) => {
        // Kredensial tidak ditinggalkan di form setelah percobaan gagal.
        resetField('password')
        resetField('confirm_admin_password')

        const serverMessage = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message
        const mapped = serverMessage ? FIELD_ERRORS[serverMessage] : undefined
        if (mapped) {
          setError(mapped.field, { type: 'server', message: t(mapped.key) })
          // `role_id` terdaftar lewat input tersembunyi yang tidak bisa difokus.
          if (mapped.field !== 'role_id') setFocus(mapped.field)
          return
        }

        toast.error(apiErrorMessage(err, t('adminCreate.error')))
      },
    })

  return (
    <>
      <DialogHeader className='space-y-1 text-left'>
        <DialogTitle className='text-lg font-semibold tracking-tight'>
          {t('adminCreate.title')}
        </DialogTitle>
        <DialogDescription className='text-sm text-muted-foreground'>
          {t('adminCreate.description')}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(submit)} className='space-y-4 pt-2'>
        <div className='space-y-2'>
          <Label htmlFor='admin-full-name' className='text-sm font-medium'>
            {t('adminCreate.fullNameLabel')}
          </Label>
          <Input
            id='admin-full-name'
            {...register('full_name', { required: t('adminCreate.fullNameRequired') })}
            placeholder={t('adminCreate.fullNamePlaceholder')}
            className='rounded-lg'
            autoComplete='name'
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? 'admin-full-name-error' : undefined}
          />
          {errors.full_name && (
            <p id='admin-full-name-error' className='text-xs text-destructive'>{errors.full_name.message}</p>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='admin-username' className='text-sm font-medium'>
              {t('adminCreate.usernameLabel')}
            </Label>
            <Input
              id='admin-username'
              {...register('username', { required: t('adminCreate.usernameRequired') })}
              placeholder={t('adminCreate.usernamePlaceholder')}
              className='rounded-lg'
              autoComplete='username'
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'admin-username-error' : undefined}
            />
            {errors.username && (
              <p id='admin-username-error' className='text-xs text-destructive'>{errors.username.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='admin-role' className='text-sm font-medium'>
              {t('adminCreate.roleLabel')}
            </Label>
            <Select
              value={selectedRoleId}
              onValueChange={(val) =>
                // shouldValidate: pesan "peran wajib dipilih" hilang begitu
                // peran dipilih, bukan menunggu submit berikutnya.
                setValue('role_id', val, { shouldValidate: true, shouldDirty: true })
              }
              disabled={rolesLoading || rolesUnavailable}
            >
              <SelectTrigger
                id='admin-role'
                className='rounded-lg font-medium'
                aria-invalid={!!errors.role_id}
              >
                <SelectValue placeholder={t('adminCreate.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type='hidden'
              {...register('role_id', { required: t('adminCreate.roleRequired') })}
            />
            {rolesUnavailable ? (
              <p className='text-xs text-destructive'>{t('adminPage.rolesUnavailable')}</p>
            ) : (
              errors.role_id && (
                <p className='text-xs text-destructive'>{errors.role_id.message}</p>
              )
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='admin-email' className='text-sm font-medium'>
            {t('adminCreate.emailLabel')}
          </Label>
          <Input
            id='admin-email'
            {...register('email', {
              required: t('adminCreate.emailRequired'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('adminCreate.emailInvalid'),
              },
            })}
            type='email'
            placeholder={t('adminCreate.emailPlaceholder')}
            className='rounded-lg'
            autoComplete='email'
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'admin-email-error' : undefined}
          />
          {errors.email && <p id='admin-email-error' className='text-xs text-destructive'>{errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='admin-password' className='text-sm font-medium'>
            {t('adminCreate.passwordLabel')}
          </Label>
          <Input
            id='admin-password'
            {...register('password', {
              required: t('adminCreate.passwordRequired'),
              minLength: { value: 6, message: t('adminCreate.passwordMin') },
            })}
            type='password'
            placeholder={t('adminCreate.passwordPlaceholder')}
            className='rounded-lg'
            autoComplete='new-password'
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'admin-password-error' : undefined}
          />
          {errors.password && (
            <p id='admin-password-error' className='text-xs text-destructive'>{errors.password.message}</p>
          )}
        </div>

        <div className='mt-6 space-y-2 border-t pt-4'>
          <Label htmlFor='admin-confirm-password' className='text-sm font-semibold text-foreground'>
            {t('adminCreate.confirmLabel')}
          </Label>
          <p className='text-xs text-muted-foreground'>{t('adminCreate.confirmHint')}</p>
          <Input
            id='admin-confirm-password'
            {...register('confirm_admin_password', {
              required: t('adminCreate.confirmRequired'),
            })}
            type='password'
            placeholder={t('adminCreate.confirmPlaceholder')}
            className='rounded-xl'
            autoComplete='current-password'
            aria-invalid={!!errors.confirm_admin_password}
            aria-describedby={errors.confirm_admin_password ? 'admin-confirm-password-error' : undefined}
          />
          {errors.confirm_admin_password && (
            <p id='admin-confirm-password-error' className='text-xs text-destructive'>
              {errors.confirm_admin_password.message}
            </p>
          )}
        </div>

        <Button
          type='submit'
          className='mt-4 h-11 w-full rounded-xl font-bold'
          disabled={isPending || rolesUnavailable}
        >
          {isPending ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
              {t('adminCreate.submitting')}
            </span>
          ) : (
            t('adminCreate.submit')
          )}
        </Button>
      </form>
    </>
  )
}
