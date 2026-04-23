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
    <div className='flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4'>
      <div className='min-w-0 flex-1'>
        <ProductSkuGameFilter
          sku={sku}
          onSkuChange={onSkuChange}
          gameName={gameName}
          onGameNameChange={onGameNameChange}
        />
      </div>
      <div className='flex shrink-0 justify-stretch sm:justify-start'>
        <ChangeImageByGame />
      </div>
    </div>
  )
}
