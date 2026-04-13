import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  type ProductResponseOnly,
  useAddProductToCategoryProduct,
} from '@/hooks/useCategoryProduct'
import { useGetProductNames } from '@/hooks/useProduct'
import { Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('common')
  const [selected, setSelected] = useState<string[]>([])
  const { data: products, isPending, isError } = useGetProductNames(game_id)
  const mutation = useAddProductToCategoryProduct(id)

  const toggle = (productId: string) => {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId],
    )
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
        <Button
          type="button"
          className="cursor-pointer"
          variant="ghost"
          size="icon"
          aria-label={t('categoryProductAddProducts.triggerAria')}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('categoryProductAddProducts.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('categoryProductAddProducts.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-2">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('categoryProductAddProducts.loading')}
            </div>
          ) : isError ? (
            <p className="py-6 text-center text-sm text-destructive">{t('categoryProductAddProducts.loadError')}</p>
          ) : !products?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('categoryProductAddProducts.empty')}
            </p>
          ) : (
            products.map((product: ProductName) => {
              const checkboxId = `cat-prod-${id}-${product.id}`
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    id={checkboxId}
                    checked={selected.includes(product.id)}
                    onCheckedChange={() => toggle(product.id)}
                  />
                  <Label htmlFor={checkboxId} className="flex-1 cursor-pointer text-sm font-normal">
                    {product.name}
                  </Label>
                </div>
              )
            })
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer rounded-xl">{t('categoryProductAddProducts.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!selected.length || mutation.isPending || isPending || isError}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                {t('categoryProductAddProducts.saving')}
              </>
            ) : (
              t('categoryProductAddProducts.save')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
