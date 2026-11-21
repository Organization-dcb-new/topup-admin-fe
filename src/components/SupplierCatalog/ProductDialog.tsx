import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, EyeOff, Link2, Package, Save, Undo2, Unlink } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { ActionButton, CloseButton, InfoItem, MappingChip, RawJson, StockChip } from '@/components/SupplierCatalog/catalog-parts'
import { ProductPicker } from '@/components/SupplierCatalog/ProductPicker'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useProductsByGame } from '@/hooks/useProduct'
import { useRetained } from '@/hooks/useRetained'
import { useMapSupplierProduct, useSupplierBrand, useSupplierProduct, useUpdateSupplierProduct } from '@/hooks/useSupplierCatalog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { SupplierProductDetail } from '@/types/supplier-catalog'

interface ProductDialogProps {
  /** The supplier product to show; the dialog is open while one is set. */
  productId: string | null
  onClose: () => void
  /** Opens the product's brand, e.g. to tie it to a game first. */
  onOpenBrand: (brandId: string) => void
}

export function ProductDialog({ productId, onClose, onOpenBrand }: ProductDialogProps) {
  const target = useRetained(productId)
  return (
    <Dialog open={productId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {target && <ProductDetail key={target} productId={target} onClose={onClose} onOpenBrand={onOpenBrand} />}
      </DialogContent>
    </Dialog>
  )
}

function ProductDetail({ productId, onClose, onOpenBrand }: { productId: string; onClose: () => void; onOpenBrand: (id: string) => void }) {
  const { t } = useTranslation('common')
  const { data: product, isLoading, isError } = useSupplierProduct(productId)

  if (isLoading) {
    return (
      <div className='space-y-4 p-6 sm:p-7' aria-hidden>
        <div className='h-6 w-1/2 animate-pulse rounded bg-slate-100' />
        <div className='h-24 animate-pulse rounded bg-slate-100' />
      </div>
    )
  }
  if (isError || !product) {
    return (
      <div className='space-y-4 p-6 sm:p-7'>
        <DialogTitle className='font-display text-xl font-bold text-slate-900'>{t('supplierCatalogPage.product.notFound')}</DialogTitle>
        <DialogDescription className='text-sm text-slate-500'>{t('supplierCatalogPage.product.notFoundBody')}</DialogDescription>
        <CloseButton onClose={onClose} />
      </div>
    )
  }

  return (
    <div className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Package className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('supplierCatalogPage.product.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{product.name}</DialogTitle>
          <DialogDescription className='text-sm text-slate-500'>
            <span className='font-mono text-xs text-slate-600'>{product.supplier_sku}</span>
            <span aria-hidden> · </span>
            {product.provider_name}
          </DialogDescription>
        </div>
      </div>

      <dl className='grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2'>
        <InfoItem label={t('supplierCatalogPage.product.cost')}>
          <span className='font-display text-base font-bold tabular-nums text-slate-900'>{formatCurrency(product.cost)}</span>
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.stock')}>
          <StockChip status={product.supplier_status} />
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.brand')}>
          {product.supplier_brand_id ? (
            <button
              type='button'
              onClick={() => onOpenBrand(product.supplier_brand_id!)}
              className='inline-flex items-center gap-1 font-mono text-xs font-medium text-brand-purple hover:underline'
            >
              {product.supplier_brand_code || t('supplierCatalogPage.product.brand')}
              <ArrowRight className='size-3.5' aria-hidden />
            </button>
          ) : (
            '—'
          )}
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.subProvider')}>
          <span className='font-mono text-xs'>{product.sub_provider_code || '—'}</span>
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.costUpdated')}>
          {product.cost_updated_at ? formatBackendDateTime(product.cost_updated_at, 'dd MMM yyyy, HH:mm') : t('supplierCatalogPage.never')}
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.lastSeen')}>
          {product.last_seen_at ? formatBackendDateTime(product.last_seen_at, 'dd MMM yyyy, HH:mm') : t('supplierCatalogPage.never')}
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.product.mapping')}>
          <span className='flex flex-wrap items-center gap-2'>
            <MappingChip status={product.mapping_status} />
            {product.product_id && <span className='min-w-0 truncate font-medium text-slate-700'>{product.product_name}</span>}
          </span>
        </InfoItem>
        {product.mapped_by && (
          <InfoItem label={t('supplierCatalogPage.product.mappedBy')}>
            <span className='break-all'>
              {product.mapped_by === 'auto' ? t('supplierCatalogPage.autoMapped') : product.mapped_by}
              {product.mapped_at && <span className='text-slate-400'> · {formatBackendDateTime(product.mapped_at, 'dd MMM yyyy, HH:mm')}</span>}
            </span>
          </InfoItem>
        )}
      </dl>

      <MappingSection product={product} onOpenBrand={onOpenBrand} />
      <OfferSection key={`${product.is_enabled}-${product.priority}`} product={product} />

      <RawJson value={product.raw} />

      <div className='flex justify-start border-t border-slate-100 pt-5'>
        <CloseButton onClose={onClose} />
      </div>
    </div>
  )
}

/** Ties the supplier product to a product of the game its brand supplies, or sets it aside. */
function MappingSection({ product, onOpenBrand }: { product: SupplierProductDetail; onOpenBrand: (id: string) => void }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const canMap = can(PERM.gameSync)
  const { data: brand } = useSupplierBrand(product.supplier_brand_id ?? undefined)
  const gameId = brand?.mapping_status === 'MAPPED' ? (brand.game_id ?? '') : ''
  const { data: products = [], isLoading: productsLoading } = useProductsByGame(gameId, canMap && !!gameId)
  const [choice, setChoice] = useState('')
  const mapProduct = useMapSupplierProduct()

  if (!canMap) return null
  const mapped = product.mapping_status === 'MAPPED' && !!product.product_id

  return (
    <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4'>
      <p className={hudLabelClass}>{t('supplierCatalogPage.product.tieTitle')}</p>

      {mapped ? (
        <div className='flex flex-wrap items-center gap-2'>
          {gameId && (
            <Link
              to={`/games/${gameId}`}
              className='inline-flex items-center gap-1 text-sm font-medium text-brand-purple hover:underline'
            >
              {t('supplierCatalogPage.product.openGame', { name: brand?.game_name ?? '' })}
              <ArrowRight className='size-3.5' aria-hidden />
            </Link>
          )}
          <span className='flex-1' />
          <ActionButton
            icon={Unlink}
            tone='danger'
            pending={mapProduct.isPending}
            disabled={mapProduct.isPending}
            onClick={() => mapProduct.mutate({ id: product.id, status: 'UNMAPPED' })}
          >
            {t('supplierCatalogPage.product.untie')}
          </ActionButton>
        </div>
      ) : !gameId ? (
        <div className='space-y-2'>
          <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.product.brandNotTied')}</p>
          {product.supplier_brand_id && (
            <button
              type='button'
              onClick={() => onOpenBrand(product.supplier_brand_id!)}
              className='inline-flex items-center gap-1 text-sm font-medium text-brand-purple hover:underline'
            >
              {t('supplierCatalogPage.product.openBrand')}
              <ArrowRight className='size-3.5' aria-hidden />
            </button>
          )}
        </div>
      ) : (
        <>
          <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.product.tieHint', { game: brand?.game_name ?? '' })}</p>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <div className='min-w-0 sm:flex-1'>
              <ProductPicker
                products={products}
                value={choice}
                onChange={setChoice}
                placeholder={productsLoading ? t('supplierCatalogPage.product.loadingProducts') : t('supplierCatalogPage.product.pickProduct')}
                disabled={productsLoading || mapProduct.isPending}
                suggestName={product.name}
              />
            </div>
            <ActionButton
              icon={Link2}
              tone='primary'
              pending={mapProduct.isPending}
              disabled={!choice || mapProduct.isPending}
              onClick={() => mapProduct.mutate({ id: product.id, status: 'MAPPED', productId: choice })}
            >
              {t('supplierCatalogPage.product.tie')}
            </ActionButton>
          </div>
        </>
      )}

      {!mapped && (
        <div className='flex justify-end'>
          {product.mapping_status === 'IGNORED' ? (
            <ActionButton
              icon={Undo2}
              pending={mapProduct.isPending}
              disabled={mapProduct.isPending}
              onClick={() => mapProduct.mutate({ id: product.id, status: 'UNMAPPED' })}
            >
              {t('supplierCatalogPage.product.unignore')}
            </ActionButton>
          ) : (
            <ActionButton
              icon={EyeOff}
              pending={mapProduct.isPending}
              disabled={mapProduct.isPending}
              onClick={() => mapProduct.mutate({ id: product.id, status: 'IGNORED' })}
            >
              {t('supplierCatalogPage.product.ignore')}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  )
}

/** Whether routing may use this supplier product, and in which order among the offers of one product. */
function OfferSection({ product }: { product: SupplierProductDetail }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const update = useUpdateSupplierProduct()
  const [priority, setPriority] = useState(String(product.priority))
  const parsed = Number(priority)
  const priorityValid = priority.trim() !== '' && Number.isInteger(parsed) && parsed >= 0
  const priorityChanged = priorityValid && parsed !== product.priority

  if (!can(PERM.productUpdate)) return null

  return (
    <div className='space-y-3 rounded-lg border border-slate-200 p-4'>
      <p className={hudLabelClass}>{t('supplierCatalogPage.product.offerTitle')}</p>
      <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.product.offerHint')}</p>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
        <label className='flex items-center gap-3'>
          <Switch
            checked={product.is_enabled}
            disabled={update.isPending}
            onCheckedChange={(checked) => update.mutate({ id: product.id, isEnabled: checked })}
            className='data-[state=checked]:bg-emerald-500'
          />
          <span className='text-sm text-slate-700'>
            {product.is_enabled ? t('supplierCatalogPage.product.enabled') : t('supplierCatalogPage.product.disabled')}
          </span>
        </label>
        <div className='flex items-end gap-2 sm:ml-auto'>
          <div className='space-y-1'>
            <label htmlFor={`priority-${product.id}`} className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('supplierCatalogPage.product.priority')}
            </label>
            <Input
              id={`priority-${product.id}`}
              type='number'
              inputMode='numeric'
              min={0}
              step={1}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-invalid={!priorityValid}
              className={cn(hudInputClass, 'h-10 w-24 tabular-nums')}
            />
          </div>
          <ActionButton
            icon={Save}
            pending={update.isPending}
            disabled={!priorityChanged || update.isPending}
            onClick={() => update.mutate({ id: product.id, priority: parsed })}
          >
            {t('supplierCatalogPage.product.savePriority')}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
