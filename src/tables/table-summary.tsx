import type { ColumnDef } from "@tanstack/react-table";
import type { SummaryItem } from "@/types/summary";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const summaryColumns: ColumnDef<SummaryItem>[] = [
  {
    accessorKey: "time_key",
    header: "Waktu (WIB)",
    cell: ({ row }) => {
      const date = new Date(row.getValue("time_key"));
      return format(date, "dd MMM yyyy, HH:00", { locale: id });
    },
  },
  {
    accessorKey: "total_amount_pg",
    header: "Total Masuk (PG)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount_pg"));
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    },
  },
  {
    accessorKey: "total_amount_provider",
    header: "Modal (Provider)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount_provider"));
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);
    },
  },
  {
    accessorKey: "gross_profit",
    header: "Gross Profit",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("gross_profit"));
      const isNegative = amount < 0;
      return (
        <span
          className={`font-bold ${isNegative ? "text-red-500" : "text-emerald-500"}`}
        >
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(amount)}
        </span>
      );
    },
  },
];
