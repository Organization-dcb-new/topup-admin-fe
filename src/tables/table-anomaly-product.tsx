import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/types/product";

export const anomalyProductTable: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "additional_fee",
    header: "Additional Fee",
    cell: ({ row }) =>
      `Rp ${row.original?.additional_fee?.toLocaleString("id-ID")}`,
  },
  {
    accessorKey: "additional_percent",
    header: "Additional Percent",
    cell: ({ row }) => `${row.original?.additional_percent} %`,
  },

  {
    accessorKey: "base_price",
    header: "Base Price",
    cell: ({ row }) =>
      `Rp ${row.original?.base_price?.toLocaleString("id-ID")}`,
  },
  {
    accessorKey: "selling_price",
    header: "Selling Price",
    cell: ({ row }) =>
      `Rp ${row.original?.selling_price?.toLocaleString("id-ID")}`,
  },

  {
    accessorKey: "stock_quantity",
    header: "Stock",
    cell: ({ row }) =>
      row.original.is_unlimited_stock
        ? "Unlimited"
        : row.original.stock_quantity,
  },
];
