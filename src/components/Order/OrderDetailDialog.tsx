import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, X } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useRetained } from '@/hooks/useRetained'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OrderItem } from '@/types/order-item'
import { CopyValueButton, ProviderStatusChip, VoucherValue } from './OrderParts'
import { orderItemTotal, providerState } from './order-utils'

interface OrderDetailDialogProps {
  item: OrderItem | null
  onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({ item, onOpenChange }: OrderDetailDialogProps) {
  // Keep showing the item while the dialog animates closed.
  const shown = useRetained(item)

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && <OrderDetail key={shown.id} item={shown} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function OrderDetail({ item, onClose }: { item: OrderItem; onClose: () => void }) {
  const { t } = useTranslation('common')
  const state = providerState(item.status_provider)

  return (
    // min-w-0: DialogContent is a grid, and long IDs would otherwise widen it past a phone screen.
    <div className='min-w-0 space-y-5 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Package className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 flex-1 space-y-1.5'>
          <p className={hudEyebrowClass}>{t('orderPage.detail.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {item.product_name || item.product_sku || t('orderPage.unnamed')}
          </DialogTitle>
          <ProviderStatusChip code={item.status_provider} showCode={false} />
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label={t('orderPage.detail.close')}
          className='grid size-8 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
        >
          <X className='size-4' aria-hidden />
        </button>
      </div>

      <DialogDescription className='rounded-md bg-slate-50 px-3 py-2.5 text-sm leading-relaxed text-slate-600'>
        {t(`orderPage.detail.provider.${state}`, { code: item.status_provider })}
      </DialogDescription>

      <div className='grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-3'>
        <Amount label={t('orderPage.unitPrice')} value={formatCurrency(item.unit_price)} />
        <Amount label={t('orderPage.quantity')} value={`× ${item.quantity}`} />
        <Amount
          label={t('orderPage.total')}
          value={formatCurrency(orderItemTotal(item))}
          strong
          className='col-span-2 border-t border-slate-100 pt-3 sm:col-span-1 sm:border-0 sm:pt-0'
        />
      </div>

      <dl className='divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm'>
        <Row label={t('orderPage.detail.voucher')}>
          {item.voucher_code ? (
            <VoucherValue code={item.voucher_code} />
          ) : (
            <span className='text-slate-400'>{t('orderPage.detail.noVoucher')}</span>
          )}
        </Row>
        <Row label={t('orderPage.sku')}>
          <span className='min-w-0 flex-1 truncate font-mono text-slate-700'>{item.product_sku || '—'}</span>
          {item.product_sku && <CopyValueButton value={item.product_sku} label={t('orderPage.copySku')} />}
        </Row>
        <Row label={t('orderPage.detail.itemId')}>
          <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-600'>{item.id}</span>
          <CopyValueButton value={item.id} label={t('orderPage.copyId')} />
        </Row>
        <Row label={t('orderPage.detail.productId')}>
          <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-600'>{item.product_id || '—'}</span>
          {item.product_id && <CopyValueButton value={item.product_id} label={t('orderPage.copyProductId')} />}
        </Row>
      </dl>

      <p className='text-xs leading-relaxed text-slate-400'>{t('orderPage.detail.missingFields')}</p>
    </div>
  )
}

function Amount({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</p>
      <p className={strong ? 'truncate font-display text-lg font-bold text-slate-900' : 'truncate text-sm font-semibold tabular-nums text-slate-700'}>
        {value}
      </p>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-center gap-3 px-3 py-2'>
      <dt className='w-28 shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{label}</dt>
      <dd className='flex min-w-0 flex-1 items-center gap-1'>{children}</dd>
    </div>
  )
}
