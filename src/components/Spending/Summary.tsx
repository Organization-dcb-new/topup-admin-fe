import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const margin = summary.total_amount_provider - summary.total_amount_payment_gateway

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle> Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Gateway */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Payment Gateway</span>
          <span className="font-semibold text-blue-600 text-lg">
            {formatCurrency(summary.total_amount_payment_gateway)}
          </span>
        </div>

        {/* Provider */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Provider</span>
          <span className="font-semibold text-emerald-600 text-lg">
            {formatCurrency(summary.total_amount_provider)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-medium">Margin</span>
          <span className="font-bold text-lg">{formatCurrency(margin)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
