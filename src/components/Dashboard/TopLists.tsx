import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  dashAccent,
  dashCard,
  dashCardBody,
  dashCardHeader,
  dashCardTitle,
} from '@/components/Dashboard/styles'
import { formatPaymentChannel } from '@/lib/dashboard'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TopGame, TopPaymentMethod, TopProduct } from '@/types/dashboard'
import { useTranslation } from 'react-i18next'

interface TopItem {
  id: string
  name: string
  meta: string
  revenue: number
}

function TopListCard({
  title,
  items,
  accent,
}: {
  title: string
  items: TopItem[]
  accent: string
}) {
  const { t } = useTranslation('common')
  return (
    <Card className={dashCard}>
      <CardHeader className={cn(dashCardHeader, accent)}>
        <CardTitle className={dashCardTitle}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={dashCardBody}>
        {items.length === 0 ? (
          <p className='py-4 text-center text-xs font-bold uppercase tracking-tight text-[#111]/55'>
            {t('dashboard.top.empty')}
          </p>
        ) : (
          <ol>
            {items.map((item, i) => (
              <li
                key={item.id}
                className='flex items-center gap-3 border-b-2 border-[#111]/10 py-2 first:pt-0 last:border-b-0 last:pb-0'
              >
                {/* Peringkat 1 disorot penuh, sisanya kotak putih — urutan
                    tetap terbaca tanpa harus mengandalkan warna saja. */}
                <span
                  className={cn(
                    'nb-frame nb-frame-thin flex h-6 w-6 shrink-0 items-center justify-center text-xs font-black tabular-nums',
                    i === 0 ? 'bg-[#ffd84d]' : 'bg-white',
                  )}
                >
                  {i + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-bold text-[#111]' title={item.name}>
                    {item.name}
                  </p>
                  <p className='truncate text-[11px] font-bold text-[#111]/55'>{item.meta}</p>
                </div>
                <span className='shrink-0 text-sm font-black tabular-nums text-[#111]'>
                  {formatCurrency(item.revenue)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

interface TopListsProps {
  topProducts: TopProduct[]
  topGames: TopGame[]
  topPaymentMethods: TopPaymentMethod[]
}

export function TopLists({ topProducts, topGames, topPaymentMethods }: TopListsProps) {
  const { t } = useTranslation('common')

  const products: TopItem[] = topProducts.map((p) => ({
    id: p.product_id,
    name: p.product_name,
    meta: t('dashboard.top.productMeta', { sku: p.sku, qty: formatNumber(p.qty_sold) }),
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
      <TopListCard
        title={t('dashboard.top.products')}
        items={products}
        accent={dashAccent.lime}
      />
      <TopListCard title={t('dashboard.top.games')} items={games} accent={dashAccent.pink} />
      <TopListCard
        title={t('dashboard.top.paymentMethods')}
        items={methods}
        accent={dashAccent.cyan}
      />
    </div>
  )
}
