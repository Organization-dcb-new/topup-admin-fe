import { ChangeImageByGame } from '@/components/Product/Filter/ChangeImage'
import { ProductSkuGameFilter } from '@/components/Product/Filter/ProductSkuGameFilter'

type ProductSkuGameImageRowProps = {
  sku: string
  onSkuChange: (value: string) => void
  gameName: string
  onGameNameChange: (value: string) => void
}

export function ProductSkuGameImageRow({
  sku,
  onSkuChange,
  gameName,
  onGameNameChange,
}: ProductSkuGameImageRowProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
      <ProductSkuGameFilter
        sku={sku}
        onSkuChange={onSkuChange}
        gameName={gameName}
        onGameNameChange={onGameNameChange}
      />
     
        <ChangeImageByGame />
     
    </div>
  )
}
