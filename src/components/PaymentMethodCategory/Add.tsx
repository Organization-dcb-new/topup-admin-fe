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
import { Checkbox } from '@/components/ui/checkbox'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { useAssignPaymentMethods } from '@/hooks/usePaymentMethodCategory'
import type { PaymentMethod } from '@/types/payment-method'
import { cn } from '@/lib/utils'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import {
  pmBtn,
  pmCheckbox,
  pmDialog,
  pmDialogDesc,
  pmDialogHeader,
  pmDialogIcon,
  pmDialogTitle,
  pmIconBtn,
  pmListBox,
  pmListItem,
} from '@/components/PaymentMethod/styles'

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
        <button
          type='button'
          className={cn(pmIconBtn, 'bg-[#c9f24d]')}
          aria-label='Tautkan metode pembayaran ke kategori'
        >
          <Plus className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className={cn(pmDialog, 'overflow-hidden sm:max-w-lg')}>
        <div className={cn(pmDialogHeader, 'bg-[#c9f24d]')}>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className={pmDialogIcon}>
                <Plus className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className={pmDialogTitle}>
                Tautkan metode pembayaran
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className={cn(pmDialogDesc, 'text-left')}>
              Pilih metode yang masuk ke kategori ini. Centang untuk menambah; hapus centang untuk
              mengeluarkan dari daftar yang akan disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className='px-5 pt-5'>
          <div className={pmListBox}>
            {isLoadingMethods ? (
              <div className='flex flex-col items-center justify-center gap-3 py-10 text-center'>
                <span className='nb-frame nb-frame-thin nb-sd-sm flex h-11 w-11 items-center justify-center bg-[#6fe3f5]'>
                  <Loader2 className='h-5 w-5 animate-spin' strokeWidth={3} aria-hidden />
                </span>
                <p className='text-xs font-bold text-[#111]/70'>
                  Memuat daftar metode pembayaran…
                </p>
              </div>
            ) : methods.length === 0 ? (
              <p className='py-8 text-center text-xs font-bold text-[#111]/70'>
                Belum ada metode pembayaran.
              </p>
            ) : (
              methods.map((method) => (
                <label
                  key={method.id}
                  htmlFor={`pm-assign-${categoryId}-${method.id}`}
                  className={pmListItem}
                >
                  <Checkbox
                    id={`pm-assign-${categoryId}-${method.id}`}
                    checked={selected.includes(method.id)}
                    onCheckedChange={() => toggle(method.id)}
                    disabled={mutation.isPending || isLoadingMethods}
                    className={pmCheckbox}
                  />
                  <span>{method.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <AlertDialogFooter className='gap-2 px-5 py-5'>
          <AlertDialogCancel
            className={cn(pmBtn, 'bg-white')}
            type='button'
            disabled={mutation.isPending}
          >
            Batal
          </AlertDialogCancel>
          <button
            type='button'
            className={cn(pmBtn, 'bg-[#c9f24d]')}
            onClick={handleSubmit}
            disabled={mutation.isPending || isLoadingMethods || methods.length === 0}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                Menyimpan…
              </>
            ) : (
              'Simpan'
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
