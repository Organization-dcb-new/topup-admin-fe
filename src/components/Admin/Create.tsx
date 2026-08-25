import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { api } from '@/api/axios'
import { useRoles } from '@/hooks/useRoles'
import { apiErrorMessage } from '@/lib/api-error'

type CreateAdminFormValues = {
  username: string
  email: string
  password: string
  full_name: string
  /** UUID role. Backend juga menerima slug, tapi id lebih tahan rename. */
  role_id: string
  confirm_admin_password: string
}

export const CreateAdminModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

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
      role_id: '',
      confirm_admin_password: '',
    },
  })

  const { data: roles = [], isLoading: rolesLoading } = useRoles()
  const selectedRoleId = watch('role_id')

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
    onError: (err: unknown) => toast.error(apiErrorMessage(err, 'Gagal mendaftarkan admin')),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto'>
          <Plus className='h-4 w-4 shrink-0' aria-hidden />
          Tambah admin
        </Button>
      </DialogTrigger>
      <DialogContent className='rounded-xl sm:max-w-lg'>
        <DialogHeader className='space-y-1 text-left'>
          <DialogTitle className='text-lg font-semibold tracking-tight'>Tambah admin baru</DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Isi detail akun untuk memberi akses ke dashboard admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutate(v))} className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label htmlFor='admin-full-name' className='text-sm font-medium'>
              Nama lengkap
            </Label>
            <Input
              id='admin-full-name'
              {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
              placeholder='Contoh: Budi Santoso'
              className='rounded-lg'
              autoComplete='name'
            />
            {errors.full_name && (
              <p className='text-xs text-destructive'>{errors.full_name.message}</p>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='admin-username' className='text-sm font-medium'>
                Nama pengguna
              </Label>
              <Input
                id='admin-username'
                {...register('username', { required: 'Nama pengguna wajib diisi' })}
                placeholder='budisantoso'
                className='rounded-lg'
                autoComplete='username'
              />
              {errors.username && (
                <p className='text-xs text-destructive'>{errors.username.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Peran</Label>
              <Select
                value={selectedRoleId}
                onValueChange={(val) => setValue('role_id', val)}
                disabled={rolesLoading}
              >
                <SelectTrigger className='rounded-lg font-medium'>
                  <SelectValue placeholder='Pilih peran' />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type='hidden' {...register('role_id', { required: 'Peran wajib dipilih' })} />
              {errors.role_id && (
                <p className='text-xs text-destructive'>{errors.role_id.message}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='admin-email' className='text-sm font-medium'>
              Email
            </Label>
            <Input
              id='admin-email'
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Format email tidak valid',
                },
              })}
              type='email'
              placeholder='admin@pakargaming.id'
              className='rounded-lg'
              autoComplete='email'
            />
            {errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='admin-password' className='text-sm font-medium'>
              Kata sandi
            </Label>
            <Input
              id='admin-password'
              {...register('password', {
                required: 'Kata sandi wajib diisi',
                minLength: { value: 6, message: 'Minimal 6 karakter' },
              })}
              type='password'
              placeholder='••••••••'
              className='rounded-lg'
              autoComplete='new-password'
            />
            {errors.password && (
              <p className='text-xs text-destructive'>{errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2 border-t pt-4 mt-6'>
            <Label className='font-bold text-indigo-600'>Admin Password Check</Label>
            <Input
              {...register('confirm_admin_password', {
                required: 'Your password is required to confirm this action',
              })}
              type='password'
              placeholder='Validasi Password Anda'
              className='rounded-xl border-indigo-200'
            />
            {errors.confirm_admin_password && (
              <p className='text-xs text-red-500'>{errors.confirm_admin_password.message}</p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-bold mt-4'
            disabled={isPending}
          >
            {isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                Mendaftar…
              </span>
            ) : (
              'Daftarkan'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
