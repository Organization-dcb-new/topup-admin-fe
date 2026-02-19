import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import { useAssignPaymentMethods } from '@/hooks/usePaymentMethodCategory'

interface Props {
  categoryId: string
  existingPaymentMethodIds?: string[]
}
interface Props {
  categoryId: string
}

export function AddPaymentMethodToPaymentCategoryButton({ categoryId }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const { data: paymentMethods } = useGetPaymentMethods(1, 50)

  const mutation = useAssignPaymentMethods(categoryId)

  const methods = paymentMethods?.data ?? []

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
          // 🔥 AUTO SELECT YANG SUDAH ADA CATEGORY NYA
          const existingIds = methods
            .filter((m: any) => m.category_id === categoryId)
            .map((m: any) => m.id)

          setSelected(existingIds)
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Plus className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Payment Methods</AlertDialogTitle>
          <AlertDialogDescription>Select payment methods for this category.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {methods.map((method: any) => (
            <label key={method.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(method.id)}
                onChange={() => toggle(method.id)}
              />
              <span>{method.name}</span>
            </label>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="cursor-pointer"
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
