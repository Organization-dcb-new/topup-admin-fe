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

import { useGetProductNames } from '@/hooks/useProduct'
import {
  useAddProductToCategoryProduct,
  type ProductResponseOnly,
} from '@/hooks/useCategoryProduct'

type ProductName = {
  id: string
  name: string
}

export function AddProductToCategoryProductButton({
  id,
  game_id,
  existingProduct,
}: {
  id: string
  game_id: string
  existingProduct: ProductResponseOnly[]
}) {
  const [selected, setSelected] = useState<string[]>([])
  const { data: products } = useGetProductNames(game_id)
  const mutation = useAddProductToCategoryProduct(id)

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSubmit = () => {
    mutation.mutate(selected)
  }

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (open && existingProduct) {
          setSelected(existingProduct.map((p) => p.id))
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer" variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Games to Show</AlertDialogTitle>
          <AlertDialogDescription>
            Select games you want to add to this show.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* LIST GAME */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {products?.map((product: ProductName) => (
            <label key={product.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(product.id)}
                onChange={() => toggle(product.id)}
              />
              <span>{product.name}</span>
            </label>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!selected.length || mutation.isPending}
            className="cursor-pointer"
          >
            {mutation.isPending ? 'Saving...' : 'Add Games'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
