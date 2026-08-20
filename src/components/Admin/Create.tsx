import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus, UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

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
import { api } from '@/api/axios'
import {
  nbAccent,
  nbDialog,
  nbDialogBody,
  nbDialogButton,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbError,
  nbHint,
  nbInput,
  nbLabel,
  nbSelectContent,
  nbSelectItem,
  nbSelectTrigger,
} from '@/lib/nb'
import { cn } from '@/lib/utils'

type CreateAdminFormValues = {
  username: string
  email: string
  password: string
  full_name: string
  role: string
  confirm_admin_password: string
}

export const CreateAdminModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const fullNameId = useId()
  const usernameId = useId()
  const roleId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'admin',
      confirm_admin_password: '',
    },
  })

  const selectedRole = watch('role')

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateAdminFormValues) => {
      return await api.post('/admin/users', values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Admin baru berhasil didaftarkan')
      setOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Gagal mendaftarkan admin')
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className={cn(nbDialogButton, nbAccent.lime, 'h-10 w-full px-4 sm:w-auto')}
        >
          <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
          Tambah admin
        </button>
      </DialogTrigger>

      <DialogContent className={nbDialog} showCloseButton={false}>
        <div className={cn(nbDialogHeader, nbAccent.lime)}>
          <DialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className={nbDialogIcon}>
                <UserPlus className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <DialogTitle className={nbDialogTitle}>Tambah admin baru</DialogTitle>
            </div>
            <DialogDescription className={nbHint}>
              Isi detail akun untuk memberi akses ke dashboard admin.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit((v) => mutate(v))}
          className={cn(nbDialogBody, 'max-h-[70vh] overflow-y-auto')}
        >
          <div className='space-y-2'>
            <Label htmlFor={fullNameId} className={nbLabel}>
              Nama lengkap
            </Label>
            <Input
              id={fullNameId}
              {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
              placeholder='Contoh: Budi Santoso'
              className={cn(nbInput, errors.full_name && 'nb-invalid')}
              aria-invalid={!!errors.full_name}
              autoComplete='name'
            />
            {errors.full_name && (
              <p className={nbError} role='alert'>
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor={usernameId} className={nbLabel}>
                Nama pengguna
              </Label>
              <Input
                id={usernameId}
                {...register('username', { required: 'Nama pengguna wajib diisi' })}
                placeholder='budisantoso'
                className={cn(nbInput, errors.username && 'nb-invalid')}
                aria-invalid={!!errors.username}
                autoComplete='username'
              />
              {errors.username && (
                <p className={nbError} role='alert'>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={roleId} className={nbLabel}>
                Peran
              </Label>
              <Select onValueChange={(val) => setValue('role', val)} defaultValue={selectedRole}>
                <SelectTrigger
                  id={roleId}
                  className={cn(nbSelectTrigger, 'w-full data-[size=default]:h-11')}
                >
                  <SelectValue placeholder='Pilih peran' />
                </SelectTrigger>
                <SelectContent className={nbSelectContent}>
                  <SelectItem value='admin' className={nbSelectItem}>
                    ADMIN
                  </SelectItem>
                  <SelectItem value='noc' className={nbSelectItem}>
                    NOC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor={emailId} className={nbLabel}>
              Email
            </Label>
            <Input
              id={emailId}
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Format email tidak valid',
                },
              })}
              type='email'
              placeholder='admin@pakargaming.id'
              className={cn(nbInput, errors.email && 'nb-invalid')}
              aria-invalid={!!errors.email}
              autoComplete='email'
            />
            {errors.email && (
              <p className={nbError} role='alert'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor={passwordId} className={nbLabel}>
              Kata sandi
            </Label>
            <Input
              id={passwordId}
              {...register('password', {
                required: 'Kata sandi wajib diisi',
                minLength: { value: 6, message: 'Minimal 6 karakter' },
              })}
              type='password'
              placeholder='••••••••'
              className={cn(nbInput, errors.password && 'nb-invalid')}
              aria-invalid={!!errors.password}
              autoComplete='new-password'
            />
            {errors.password && (
              <p className={nbError} role='alert'>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className='nb-frame nb-frame-thin nb-sd-sm space-y-2 bg-[#ffd84d] p-3'>
            <Label htmlFor={confirmId} className={nbLabel}>
              Konfirmasi kata sandi Anda
            </Label>
            <p className={nbHint}>
              Masukkan kata sandi akun Anda sendiri untuk mengesahkan pendaftaran ini.
            </p>
            <Input
              id={confirmId}
              {...register('confirm_admin_password', {
                required: 'Your password is required to confirm this action',
              })}
              type='password'
              placeholder='Validasi Password Anda'
              className={cn(nbInput, errors.confirm_admin_password && 'nb-invalid')}
              aria-invalid={!!errors.confirm_admin_password}
              autoComplete='current-password'
            />
            {errors.confirm_admin_password && (
              <p className={nbError} role='alert'>
                {errors.confirm_admin_password.message}
              </p>
            )}
          </div>

          <button
            type='submit'
            className={cn(nbDialogButton, nbAccent.lime, 'w-full')}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                Mendaftar…
              </>
            ) : (
              'Daftarkan'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
