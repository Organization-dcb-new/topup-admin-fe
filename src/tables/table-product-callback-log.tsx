import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import type { ProductCallbackLogResponse } from "@/types/product_callback_log";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

import { formatBackendDateTime } from "@/lib/backend-datetime";

function formatRp(value: number | undefined | null) {
  const n = value ?? 0;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export const getProductCallbackLogColumns = (
  t: TFunction,
): ColumnDef<ProductCallbackLogResponse>[] => [
  {
    accessorKey: "id",
    header: t("productCallbackLogTable.colId"),
    cell: ({ row }) => (
      <Link
        to={`/products/callback-logs/${row.original.id}`}
        className="font-mono text-sm text-primary underline-offset-4 hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "product_code",
    header: t("productCallbackLogTable.colProductCode"),
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.original.product_code}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
    header: t("productCallbackLogTable.colProductName"),
    cell: ({ row }) => (
      <div
        className="max-w-[12rem] truncate font-medium text-gray-900 sm:max-w-xs"
        title={row.original.product_name}
      >
        {row.original.product_name}
      </div>
    ),
  },
  {
    accessorKey: "provider_code",
    header: t("productCallbackLogTable.colProviderCode"),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal text-sm">
        {row.original.provider_code}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: t("productCallbackLogTable.colPrice"),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatRp(row.original.price)}
      </span>
    ),
  },
  {
    accessorKey: "previous_price",
    header: t("productCallbackLogTable.colPreviousPrice"),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatRp(row.original.previous_price)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: t("productCallbackLogTable.colStatus"),
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "success" ? "success" : "secondary"}
        className="font-normal text-sm"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "meta_level",
    header: t("productCallbackLogTable.colMetaLevel"),
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.original.meta_level}</span>
    ),
  },
  {
    accessorKey: "meta_timestamp",
    header: t("productCallbackLogTable.colMetaTimestamp"),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {row.original.meta_timestamp}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: t("productCallbackLogTable.colCreatedAt"),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {formatBackendDateTime(row.original.created_at)}
      </span>
    ),
  },
];
