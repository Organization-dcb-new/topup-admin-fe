import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SpendingSummary } from '@/types/spending'

const formatCurrency = (value: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value)
}

interface SummaryCardProps {
  summary: SpendingSummary
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const revenue = summary.total_amount_payment_gateway
  const cost = summary.total_amount_provider

  const margin = revenue - cost
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  const isProfit = margin >= 0

  return (
    <Card className="w-full max-w-xs shadow-md rounded-xl transition-all duration-300 hover:shadow-lg">
      <div className="flex w-full justify-center">
        <CardTitle className="text-base">Summary</CardTitle>
      </div>

      <CardContent className="space-y-3 text-sm">
        {/* Revenue */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment Gateway</span>
          <span className="font-medium text-blue-600">{formatCurrency(revenue)}</span>
        </div>

        {/* Cost */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Provider</span>
          <span className="font-medium text-emerald-600">{formatCurrency(cost)}</span>
        </div>

        {/* Margin */}
        <div className="border-t pt-3 flex justify-between items-center">
          <div>
            <p className="font-medium">Margin</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={`text-xs ${
                  isProfit ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'
                }`}
              >
                {isProfit ? 'Profit' : 'Loss'}
              </Badge>

              <span
                className={`flex items-center text-xs font-medium ${
                  isProfit ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {isProfit ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {marginPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <span
            className={`text-sm font-semibold transition-colors duration-300 ${
              isProfit ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(margin)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
