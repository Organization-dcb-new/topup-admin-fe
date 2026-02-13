import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'

import { useUpdateCategoryProduct, type CategoryProduct } from '@/hooks/useCategoryProduct'

type FormValues = {
  name: string
}

export function UpdateCategoryProduct({ category }: { category: CategoryProduct }) {
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<FormValues>()

  useEffect(() => {
    if (!open) return

    reset({
      name: category.name,
    })
  }, [open, category, reset])

  const mutation = useUpdateCategoryProduct(category.id, reset, setOpen)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Category Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name', { required: true })} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                {mutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
