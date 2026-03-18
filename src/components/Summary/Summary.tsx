import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OverallStats } from "@/types/summary";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

interface SummaryCardProps {
  stats: OverallStats;
}

export default function SummaryCard({ stats }: SummaryCardProps) {
  const revenue = stats.total_amount_pg;
  const cost = stats.total_amount_provider;
  const profit = stats.total_gross_profit;

  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
  const isProfit = profit >= 0;

  return (
    <Card className="w-full shadow-md rounded-xl border-t-4 border-t-purple-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">
          Financial Overall Summary
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Berdasarkan filter yang dipilih
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* PG Amount */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Payment Gateway</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(revenue)}
          </p>
        </div>

        {/* Provider Amount */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Modal Provider</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(cost)}
          </p>
        </div>

        {/* Profit/Loss */}
        <div className="space-y-1 p-3 bg-slate-50 rounded-lg border">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Net Gross Profit</p>
            <Badge
              variant={isProfit ? "default" : "destructive"}
              className={isProfit ? "bg-emerald-500" : ""}
            >
              {isProfit ? "PROFIT" : "LOSS"}
            </Badge>
          </div>
          <div className="flex items-end gap-2">
            <p
              className={`text-2xl font-black ${isProfit ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatCurrency(profit)}
            </p>
            <span
              className={`text-sm mb-1 flex items-center ${isProfit ? "text-emerald-600" : "text-red-600"}`}
            >
              {isProfit ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {marginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
