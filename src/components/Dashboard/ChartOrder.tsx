import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell } from 'recharts'

type Props = {
  data: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    total: number
  }[]
}

const chartConfig = {
  SUCCESS: {
    label: 'Success',
    color: 'hsl(142 76% 36%)', // green
  },
  PENDING: {
    label: 'Pending',
    color: 'hsl(48 96% 53%)', // yellow
  },
  FAILED: {
    label: 'Failed',
    color: 'hsl(0 84% 60%)', // red
  },
}

export function OrderStatusPieCard({ data }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Orders Status (Today)</CardTitle>
      </CardHeader>

      <CardContent className="h-72">
        <ChartContainer config={chartConfig} className="h-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="status"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
            >
              {data.map((item) => (
                <Cell key={item.status} fill={chartConfig[item.status].color} />
              ))}
            </Pie>

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent payload={data} />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
