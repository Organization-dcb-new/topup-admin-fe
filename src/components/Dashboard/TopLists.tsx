import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashCard, dashCardHeader } from '@/components/Dashboard/styles'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { TopGame, TopPaymentMethod, TopProduct } from '@/types/dashboard'
import { useTranslation } from 'react-i18next'

interface TopItem {
  id: string
  name: string
  meta: string
  revenue: number
}

function TopListCard({ title, items }: { title: string; items: TopItem[] }) {
  const { t } = useTranslation('common')
  return (
    <Card className={dashCard}>
      <CardHeader className={dashCardHeader}>
        <CardTitle className='text-sm font-semibold text-gray-900'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        {items.length === 0 ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            {t('dashboard.top.empty')}
          </p>
        ) : (
          <ol className='space-y-2.5'>
            {items.map((item, i) => (
              <li key={item.id} className='flex items-center gap-3'>
                <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary'>
                  {i + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground' title={item.name}>
                    {item.name}
                  </p>
                  <p className='truncate text-xs text-muted-foreground'>{item.meta}</p>
                </div>
                <span className='shrink-0 text-sm font-semibold tabular-nums text-foreground'>
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
    name: m.payment_method,
    meta: t('dashboard.top.ordersMeta', { count: formatNumber(m.order_count) }),
    revenue: m.revenue,
  }))

  return (
    <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
      <TopListCard title={t('dashboard.top.products')} items={products} />
      <TopListCard title={t('dashboard.top.games')} items={games} />
      <TopListCard title={t('dashboard.top.paymentMethods')} items={methods} />
    </div>
  )
}
