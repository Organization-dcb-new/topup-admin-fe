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

type CreateAdminFormValues = {
  username: string
  email: string
  password: string
  full_name: string
  role: string
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
      role: 'admin',
    },
  })

  const selectedRole = watch('role')

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateAdminFormValues) => {
      return await api.post('/admin/register', values)
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
        <Button className="w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto">
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          Tambah admin
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl sm:max-w-lg">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">Tambah admin baru</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Isi detail akun untuk memberi akses ke dashboard admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="admin-full-name" className="text-sm font-medium">
              Nama lengkap
            </Label>
            <Input
              id="admin-full-name"
              {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
              placeholder="Contoh: Budi Santoso"
              className="rounded-lg"
              autoComplete="name"
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-username" className="text-sm font-medium">
                Nama pengguna
              </Label>
              <Input
                id="admin-username"
                {...register('username', { required: 'Nama pengguna wajib diisi' })}
                placeholder="budisantoso"
                className="rounded-lg"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Peran</Label>
              <Select onValueChange={(val) => setValue('role', val)} defaultValue={selectedRole}>
                <SelectTrigger className="rounded-lg font-medium uppercase">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="noc">NOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="admin-email"
              {...register('email', {
                required: 'Email wajib diisi',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Format email tidak valid',
                },
              })}
              type="email"
              placeholder="admin@pakargaming.id"
              className="rounded-lg"
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Kata sandi
            </Label>
            <Input
              id="admin-password"
              {...register('password', {
                required: 'Kata sandi wajib diisi',
                minLength: { value: 6, message: 'Minimal 6 karakter' },
              })}
              type="password"
              placeholder="••••••••"
              className="rounded-lg"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="mt-2 h-11 w-full rounded-xl font-semibold" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
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
