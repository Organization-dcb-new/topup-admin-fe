import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OverallStats } from '@/types/summary'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

interface SummaryCardProps {
  stats: OverallStats
}

export default function SummaryCard({ stats }: SummaryCardProps) {
  const revenue = stats.total_amount_pg
  const cost = stats.total_amount_provider
  const profit = stats.total_gross_profit

  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0
  const isProfit = profit >= 0

  return (
    <Card
      className={cn(
        'w-full overflow-hidden rounded-xl border shadow-sm ring-1 ring-gray-900/5',
        'border-l-4 border-l-primary',
      )}
    >
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight text-gray-900">
          Ringkasan agregat
        </CardTitle>
        <CardDescription className="text-xs">
          Angka berikut mengikuti rentang tanggal dan pengelompokan di filter.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-3 md:gap-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total masuk (PG)</p>
          <p className="text-2xl font-semibold tabular-nums text-primary">
            {formatCurrency(revenue)}
          </p>
        </div>

        <div className="space-y-2 md:border-l md:border-border/80 md:pl-8">
          <p className="text-sm font-medium text-muted-foreground">Modal (provider)</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatCurrency(cost)}
          </p>
        </div>

        <div className="md:border-l md:border-border/80 md:pl-8">
          <div className="space-y-3 rounded-lg border border-border/80 bg-muted/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Laba kotor</p>
              <Badge
                variant={isProfit ? 'default' : 'destructive'}
                className={cn(
                  'shrink-0 text-xs font-medium',
                  isProfit && 'border-transparent bg-emerald-600 hover:bg-emerald-600',
                )}
              >
                {isProfit ? 'Laba' : 'Rugi'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums tracking-tight',
                  isProfit ? 'text-emerald-600' : 'text-destructive',
                )}
              >
                {formatCurrency(profit)}
              </p>
              <span
                className={cn(
                  'mb-0.5 flex items-center gap-0.5 text-sm tabular-nums',
                  isProfit ? 'text-emerald-600' : 'text-destructive',
                )}
              >
                {isProfit ? (
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  <ArrowDownRight className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {marginPercent.toFixed(1)}% dari PG
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
