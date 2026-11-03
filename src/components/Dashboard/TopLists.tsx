import { CreditCard, Gamepad2, Package, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatPaymentChannel } from '@/lib/dashboard'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TopGame, TopPaymentMethod, TopProduct } from '@/types/dashboard'
import { DashboardPanel } from './DashboardPanel'

interface TopItem {
  id: string
  name: string
  meta: string
  revenue: number
}

function TopListCard({ title, icon, items, order }: { title: string; icon: LucideIcon; items: TopItem[]; order: number }) {
  const { t } = useTranslation('common')
  const max = items.reduce((acc, item) => Math.max(acc, item.revenue), 0)

  return (
    <DashboardPanel title={title} icon={icon} order={order}>
      {items.length === 0 ? (
        <p className='py-6 text-center text-sm text-slate-500'>{t('dashboard.top.empty')}</p>
      ) : (
        <ol className='space-y-3'>
          {items.map((item, i) => (
            <li key={item.id} className='flex items-center gap-3'>
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center font-display text-xs font-bold hud-clip-sm',
                  i === 0 ? 'bg-linear-to-br from-brand-purple to-brand-cyan text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                {i + 1}
              </span>
              <div className='min-w-0 flex-1 space-y-1'>
                <div className='flex items-baseline justify-between gap-3'>
                  <p className='truncate text-sm font-medium text-slate-900' title={item.name}>{item.name}</p>
                  <span className='shrink-0 text-sm font-semibold tabular-nums text-slate-900'>{formatCurrency(item.revenue)}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='h-1 flex-1 overflow-hidden rounded-full bg-slate-100'>
                    <div
                      className='h-full rounded-full bg-brand-purple/70 transition-[width] duration-700 ease-hud'
                      style={{ width: `${max > 0 ? (item.revenue / max) * 100 : 0}%` }}
                    />
                  </div>
                  <span className='shrink-0 truncate text-[11px] text-slate-500'>{item.meta}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </DashboardPanel>
  )
}

interface TopListsProps {
  topProducts: TopProduct[]
  topGames: TopGame[]
  topPaymentMethods: TopPaymentMethod[]
  order?: number
}

export function TopLists({ topProducts, topGames, topPaymentMethods, order = 0 }: TopListsProps) {
  const { t } = useTranslation('common')

  const products: TopItem[] = topProducts.map((p) => ({
    id: p.product_id,
    name: p.product_name,
    meta: t('dashboard.top.soldMeta', { qty: formatNumber(p.qty_sold) }),
    revenue: p.revenue,
  }))
  const games: TopItem[] = topGames.map((g) => ({
    id: g.game_id,
    name: g.game_name,
    meta: t('dashboard.top.ordersMeta', { count: formatNumber(g.order_count) }),
    revenue: g.revenue,
  }))
  const methods: TopItem[] = topPaymentMethods.map((m) => ({
    id: m.payment_method,
    name: formatPaymentChannel(m.payment_method),
    meta: t('dashboard.top.ordersMeta', { count: formatNumber(m.order_count) }),
    revenue: m.revenue,
  }))

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
      <TopListCard title={t('dashboard.top.games')} icon={Gamepad2} items={games} order={order} />
      <TopListCard title={t('dashboard.top.products')} icon={Package} items={products} order={order + 1} />
      <TopListCard title={t('dashboard.top.paymentMethods')} icon={CreditCard} items={methods} order={order + 2} />
    </div>
  )
}
