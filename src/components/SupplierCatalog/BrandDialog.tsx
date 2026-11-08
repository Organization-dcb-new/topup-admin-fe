import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, EyeOff, Import, Link2, PackagePlus, RefreshCw, Store, Undo2, Unlink } from 'lucide-react'

import { hudEyebrowClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { GamePicker } from '@/components/Product/GamePicker'
import { ActionButton, CloseButton, InfoItem, MappingChip, RawJson } from '@/components/SupplierCatalog/catalog-parts'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { PERM } from '@/constants/permissions'
import { useGetGameNames } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { useRetained } from '@/hooks/useRetained'
import { useImportBrand, useImportBrandProducts, useMapBrand, useSupplierBrand, useSyncBrand } from '@/hooks/useSupplierCatalog'
import { formatBackendDateTime } from '@/lib/backend-datetime'

interface BrandDialogProps {
  /** The supplier brand to show; the dialog is open while one is set. */
  brandId: string | null
  onClose: () => void
  /** Switches the page to this brand's products. */
  onShowProducts: (brandId: string) => void
}

export function BrandDialog({ brandId, onClose, onShowProducts }: BrandDialogProps) {
  const target = useRetained(brandId)
  return (
    <Dialog open={brandId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {target && <BrandDetail key={target} brandId={target} onClose={onClose} onShowProducts={onShowProducts} />}
      </DialogContent>
    </Dialog>
  )
}

function BrandDetail({ brandId, onClose, onShowProducts }: { brandId: string; onClose: () => void; onShowProducts: (id: string) => void }) {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  const { data: brand, isLoading, isError } = useSupplierBrand(brandId)
  const canSync = can(PERM.gameSync)
  const { data: games = [] } = useGetGameNames(canSync)
  const [gameId, setGameId] = useState('')

  const syncBrand = useSyncBrand()
  const mapBrand = useMapBrand()
  const importBrand = useImportBrand()
  const importProducts = useImportBrandProducts()
  const busy = syncBrand.isPending || mapBrand.isPending || importBrand.isPending || importProducts.isPending

  if (isLoading) {
    return (
      <div className='space-y-4 p-6 sm:p-7' aria-hidden>
        <div className='h-6 w-1/2 animate-pulse rounded bg-slate-100' />
        <div className='h-24 animate-pulse rounded bg-slate-100' />
      </div>
    )
  }
  if (isError || !brand) {
    return (
      <div className='space-y-4 p-6 sm:p-7'>
        <DialogTitle className='font-display text-xl font-bold text-slate-900'>{t('supplierCatalogPage.brand.notFound')}</DialogTitle>
        <DialogDescription className='text-sm text-slate-500'>{t('supplierCatalogPage.brand.notFoundBody')}</DialogDescription>
        <CloseButton onClose={onClose} />
      </div>
    )
  }

  const mapped = brand.mapping_status === 'MAPPED' && !!brand.game_id

  return (
    <div className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Store className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('supplierCatalogPage.brand.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{brand.name}</DialogTitle>
          <DialogDescription className='text-sm text-slate-500'>
            <span className='font-mono text-xs text-slate-600'>{brand.supplier_brand_code}</span>
            <span aria-hidden> · </span>
            {brand.provider_name}
          </DialogDescription>
        </div>
      </div>

      <dl className='grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2'>
        <InfoItem label={t('supplierCatalogPage.brand.mapping')}>
          <span className='flex flex-wrap items-center gap-2'>
            <MappingChip status={brand.mapping_status} />
            {mapped && (
              <Link
                to={`/games/${brand.game_id}`}
                className='inline-flex min-w-0 items-center gap-1 truncate font-medium text-brand-purple hover:underline'
              >
                {brand.game_name || t('supplierCatalogPage.brand.game')}
                <ArrowRight className='size-3.5 shrink-0' aria-hidden />
              </Link>
            )}
          </span>
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.brand.products')}>
          <span className='tabular-nums'>{brand.product_count.toLocaleString(i18n.resolvedLanguage)}</span>
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.brand.checkId')}>
          {brand.check_id_enabled ? t('supplierCatalogPage.yes') : t('supplierCatalogPage.no')}
        </InfoItem>
        <InfoItem label={t('supplierCatalogPage.brand.lastSeen')}>
          {brand.last_seen_at ? formatBackendDateTime(brand.last_seen_at, 'dd MMM yyyy, HH:mm') : t('supplierCatalogPage.never')}
        </InfoItem>
        {brand.mapped_by && (
          <InfoItem label={t('supplierCatalogPage.brand.mappedBy')}>
            <span className='break-all'>
              {brand.mapped_by === 'auto' ? t('supplierCatalogPage.autoMapped') : brand.mapped_by}
              {brand.mapped_at && (
                <span className='text-slate-400'> · {formatBackendDateTime(brand.mapped_at, 'dd MMM yyyy, HH:mm')}</span>
              )}
            </span>
          </InfoItem>
        )}
      </dl>

      {canSync && (
        <div className='space-y-4'>
          {!mapped && (
            <div className='space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className={hudLabelClass}>{t('supplierCatalogPage.brand.tieTitle')}</p>
              <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.brand.tieHint')}</p>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <GamePicker
                  games={games}
                  value={gameId}
                  by='id'
                  onChange={(game) => setGameId(game?.id ?? '')}
                  placeholder={t('supplierCatalogPage.brand.pickGame')}
                  disabled={busy}
                  className='sm:flex-1'
                />
                <ActionButton
                  icon={Link2}
                  pending={mapBrand.isPending}
                  disabled={busy || !gameId}
                  onClick={() => mapBrand.mutate({ id: brand.id, status: 'MAPPED', gameId })}
                  tone='primary'
                >
                  {t('supplierCatalogPage.brand.tie')}
                </ActionButton>
              </div>
            </div>
          )}

          <div className='flex flex-wrap gap-2'>
            <ActionButton icon={RefreshCw} pending={syncBrand.isPending} disabled={busy} onClick={() => syncBrand.mutate(brand.id)}>
              {t('supplierCatalogPage.brand.sync')}
            </ActionButton>
            {mapped ? (
              <>
                <ActionButton
                  icon={PackagePlus}
                  pending={importProducts.isPending}
                  disabled={busy}
                  onClick={() => importProducts.mutate(brand.id)}
                  tone='primary'
                >
                  {t('supplierCatalogPage.brand.importProducts')}
                </ActionButton>
                <ActionButton
                  icon={Unlink}
                  pending={mapBrand.isPending}
                  disabled={busy}
                  onClick={() => mapBrand.mutate({ id: brand.id, status: 'UNMAPPED' })}
                  tone='danger'
                >
                  {t('supplierCatalogPage.brand.untie')}
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton icon={Import} pending={importBrand.isPending} disabled={busy} onClick={() => importBrand.mutate(brand.id)}>
                  {t('supplierCatalogPage.brand.importGame')}
                </ActionButton>
                {brand.mapping_status === 'IGNORED' ? (
                  <ActionButton
                    icon={Undo2}
                    pending={mapBrand.isPending}
                    disabled={busy}
                    onClick={() => mapBrand.mutate({ id: brand.id, status: 'UNMAPPED' })}
                  >
                    {t('supplierCatalogPage.brand.unignore')}
                  </ActionButton>
                ) : (
                  <ActionButton
                    icon={EyeOff}
                    pending={mapBrand.isPending}
                    disabled={busy}
                    onClick={() => mapBrand.mutate({ id: brand.id, status: 'IGNORED' })}
                  >
                    {t('supplierCatalogPage.brand.ignore')}
                  </ActionButton>
                )}
              </>
            )}
          </div>
          {mapped && <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.brand.importProductsHint')}</p>}
          {!mapped && <p className='text-xs leading-relaxed text-slate-500'>{t('supplierCatalogPage.brand.importGameHint')}</p>}
        </div>
      )}

      <RawJson value={brand.raw} />

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <CloseButton onClose={onClose} />
        <button
          type='button'
          onClick={() => onShowProducts(brand.id)}
          className='inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
        >
          {t('supplierCatalogPage.brand.showProducts', { count: brand.product_count })}
          <ArrowRight className='size-4' aria-hidden />
        </button>
      </div>
    </div>
  )
}
