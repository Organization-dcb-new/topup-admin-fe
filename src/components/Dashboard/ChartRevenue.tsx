import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

type Props = {
  data: {
    date: string
    total: number
  }[]
}

export function RevenueChartCard({ data }: Props) {
  const totalRevenue = data.reduce((a, b) => a + b.total, 0)

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <p className="text-3xl font-bold">Rp {totalRevenue.toLocaleString('id-ID')}</p>

        <div className="h-32  w-full">
          <ChartContainer
            config={{
              revenue: {
                label: 'Revenue',
                color: 'hsl(142 76% 36%)',
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="var(--color-revenue)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
