import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { useAssignPaymentMethods } from '@/hooks/usePaymentMethodCategory'
import type { PaymentMethod } from '@/types/payment-method'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

interface Props {
  categoryId: string
}

export function AddPaymentMethodToPaymentCategoryButton({ categoryId }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const { data: paymentMethods, isLoading: isLoadingMethods } = useGetPaymentMethods(1, 50)

  const mutation = useAssignPaymentMethods(categoryId)

  const methods: PaymentMethod[] = paymentMethods?.data ?? []

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = () => {
    mutation.mutate(selected, {
      onSuccess: () => {
        setOpen(false)
        setSelected([])
      },
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)

        if (value) {
          const existingIds = methods
            .filter((m) => m.category_id === categoryId)
            .map((m) => m.id)

          setSelected(existingIds)
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          type='button'
          className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
          aria-label='Tautkan metode pembayaran ke kategori'
        >
          <Plus className='h-4 w-4' aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className='rounded-xl sm:max-w-md'>
        <AlertDialogHeader className='space-y-1 text-left'>
          <AlertDialogTitle className='text-lg font-semibold tracking-tight'>
            Tautkan metode pembayaran
          </AlertDialogTitle>
          <AlertDialogDescription className='text-sm text-muted-foreground'>
            Pilih metode yang masuk ke kategori ini. Centang untuk menambah; hapus centang untuk
            mengeluarkan dari daftar yang akan disimpan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/80 bg-muted/10 p-2'>
          {isLoadingMethods ? (
            <div className='flex flex-col items-center justify-center gap-3 py-10 text-center'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
              <p className='text-sm text-muted-foreground'>Memuat daftar metode pembayaran…</p>
            </div>
          ) : methods.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              Belum ada metode pembayaran.
            </p>
          ) : (
            methods.map((method) => (
              <label
                key={method.id}
                htmlFor={`pm-assign-${categoryId}-${method.id}`}
                className='flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60'
              >
                <Checkbox
                  id={`pm-assign-${categoryId}-${method.id}`}
                  checked={selected.includes(method.id)}
                  onCheckedChange={() => toggle(method.id)}
                  disabled={mutation.isPending || isLoadingMethods}
                />
                <span className='text-sm font-medium text-foreground'>{method.name}</span>
              </label>
            ))
          )}
        </div>

        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel className='rounded-lg' type='button' disabled={mutation.isPending}>
            Batal
          </AlertDialogCancel>
          <Button
            type='button'
            className='rounded-lg font-semibold'
            onClick={handleSubmit}
            disabled={mutation.isPending || isLoadingMethods || methods.length === 0}
          >
            {mutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                Menyimpan…
              </span>
            ) : (
              'Simpan'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
